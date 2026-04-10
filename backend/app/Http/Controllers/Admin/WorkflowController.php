<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\RequestDocument;
use App\Models\RequestStatusHistory;
use App\Services\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class WorkflowController extends Controller
{
    public function __construct(private DocumentService $documentService) {}

    public function createCustomer(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $password = Str::random(8);
        $validated['password'] = Hash::make($password);
        $validated['role'] = 'customer';

        $user = User::create($validated);

        return response()->json([
            'data' => $user,
            'generated_password' => $password,
            'message' => 'Customer created successfully',
        ], 201);
    }

    public function onBehalfRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:users,id',
            'service_id' => 'required|exists:services,id',
            'notes' => 'nullable|string',
            'documents' => 'required|array',
            'documents.*.doc_type_id' => 'required|exists:service_document_types,id',
            'documents.*.file' => 'required|file|max:10240',
        ]);

        $staff = $request->user();
        $customer = User::findOrFail($validated['customer_id']);
        $service = Service::findOrFail($validated['service_id']);
        $price = $customer->role->value === 'b2b' ? $service->b2b_price : $service->customer_price;

        $serviceRequest = ServiceRequest::create([
            'tracking_id' => ServiceRequest::generateTrackingId(),
            'service_id' => $service->id,
            'customer_id' => $customer->id,
            'created_by' => $staff->id,
            'status' => 'docs_under_review',
            'price_charged' => $price,
            'is_on_behalf' => true,
            'notes' => $validated['notes'] ?? null,
        ]);

        RequestStatusHistory::create([
            'service_request_id' => $serviceRequest->id,
            'from_status' => null,
            'to_status' => 'submitted',
            'changed_by' => $staff->id,
            'notes' => 'Created on behalf by staff',
        ]);
        RequestStatusHistory::create([
            'service_request_id' => $serviceRequest->id,
            'from_status' => 'submitted',
            'to_status' => 'docs_under_review',
            'changed_by' => $staff->id,
            'notes' => 'Documents auto-approved (staff upload)',
        ]);

        foreach ($validated['documents'] as $index => $docData) {
            $file = $request->file("documents.{$index}.file");
            $filePath = $this->documentService->storeRequestDocument($serviceRequest->id, $file);

            RequestDocument::create([
                'service_request_id' => $serviceRequest->id,
                'service_doc_type_id' => $docData['doc_type_id'],
                'file_path' => $filePath,
                'original_filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'status' => 'approved',
                'auto_approved' => true,
                'reviewed_by' => $staff->id,
                'reviewed_at' => now(),
            ]);
        }

        return response()->json([
            'data' => $serviceRequest->load(['service', 'customer', 'documents']),
            'message' => 'On-behalf request created. Documents auto-approved.',
        ], 201);
    }
}
