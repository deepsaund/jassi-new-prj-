<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\RequestDocument;
use App\Models\DocumentVault;
use App\Models\RequestStatusHistory;
use App\Services\DocumentService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceRequestController extends Controller
{
    public function __construct(
        private DocumentService $documentService,
        private NotificationService $notificationService,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'notes' => 'nullable|string',
            'documents' => 'required|array',
            'documents.*.doc_type_id' => 'required|exists:service_document_types,id',
            'documents.*.vault_id' => 'nullable|exists:document_vault,id',
            'documents.*.file' => 'required_without:documents.*.vault_id|file|max:10240',
        ]);

        $user = $request->user();
        $service = Service::findOrFail($validated['service_id']);
        $price = $user->role->value === 'b2b' ? $service->b2b_price : $service->customer_price;

        $serviceRequest = ServiceRequest::create([
            'tracking_id' => ServiceRequest::generateTrackingId(),
            'service_id' => $service->id,
            'customer_id' => $user->id,
            'status' => 'submitted',
            'price_charged' => $price,
            'notes' => $validated['notes'] ?? null,
        ]);

        RequestStatusHistory::create([
            'service_request_id' => $serviceRequest->id,
            'from_status' => null,
            'to_status' => 'submitted',
            'changed_by' => $user->id,
        ]);

        foreach ($validated['documents'] as $index => $docData) {
            $file = $request->file("documents.{$index}.file");
            $vaultId = $docData['vault_id'] ?? null;

            if ($vaultId) {
                $vaultDoc = DocumentVault::where('id', $vaultId)->where('user_id', $user->id)->firstOrFail();
                $filePath = $this->documentService->copyVaultToRequest($vaultDoc, $serviceRequest->id);
                $originalFilename = $vaultDoc->original_filename;
                $mimeType = $vaultDoc->mime_type;
            } else {
                $filePath = $this->documentService->storeRequestDocument($serviceRequest->id, $file);
                $originalFilename = $file->getClientOriginalName();
                $mimeType = $file->getMimeType();
            }

            RequestDocument::create([
                'service_request_id' => $serviceRequest->id,
                'service_doc_type_id' => $docData['doc_type_id'],
                'vault_document_id' => $vaultId,
                'file_path' => $filePath,
                'original_filename' => $originalFilename,
                'mime_type' => $mimeType,
                'status' => 'pending',
            ]);
        }

        return response()->json([
            'data' => $serviceRequest->load(['service', 'documents.documentType', 'statusHistory']),
            'message' => 'Service request created successfully',
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $query = ServiceRequest::where('customer_id', $request->user()->id)
            ->with(['service', 'claimedByUser'])
            ->latest();

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }
        if ($search = $request->input('search')) {
            $query->where('tracking_id', 'like', "%{$search}%");
        }

        return response()->json($query->paginate($request->input('per_page', 15)));
    }

    public function show(int $id, Request $request): JsonResponse
    {
        $serviceRequest = ServiceRequest::where('id', $id)
            ->with(['service.documentTypes', 'customer', 'claimedByUser', 'documents.documentType', 'statusHistory.changer'])
            ->firstOrFail();

        return response()->json(['data' => $serviceRequest]);
    }

    public function reupload(int $id, Request $request): JsonResponse
    {
        $serviceRequest = ServiceRequest::where('id', $id)
            ->where('customer_id', $request->user()->id)
            ->where('status', 'docs_rejected')
            ->firstOrFail();

        $validated = $request->validate([
            'documents' => 'required|array',
            'documents.*.doc_id' => 'required|exists:request_documents,id',
            'documents.*.file' => 'required|file|max:10240',
        ]);

        foreach ($validated['documents'] as $index => $docData) {
            $doc = RequestDocument::where('id', $docData['doc_id'])
                ->where('service_request_id', $serviceRequest->id)
                ->where('status', 'rejected')
                ->firstOrFail();

            $file = $request->file("documents.{$index}.file");
            $filePath = $this->documentService->storeRequestDocument($serviceRequest->id, $file);

            $doc->update([
                'file_path' => $filePath,
                'original_filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'status' => 'pending',
                'rejection_reason' => null,
                'reviewed_by' => null,
                'reviewed_at' => null,
            ]);
        }

        // Check if all rejected docs are now reuploaded
        $stillRejected = $serviceRequest->documents()->where('status', 'rejected')->count();
        if ($stillRejected === 0) {
            $serviceRequest->update(['status' => 'docs_under_review']);
            RequestStatusHistory::create([
                'service_request_id' => $serviceRequest->id,
                'from_status' => 'docs_rejected',
                'to_status' => 'docs_under_review',
                'changed_by' => $request->user()->id,
                'notes' => 'Documents re-uploaded',
            ]);
        }

        return response()->json([
            'data' => $serviceRequest->load(['documents.documentType', 'statusHistory']),
            'message' => 'Documents re-uploaded successfully',
        ]);
    }

    public function downloadOutput(int $id, Request $request): mixed
    {
        $serviceRequest = ServiceRequest::where('id', $id)
            ->where('customer_id', $request->user()->id)
            ->firstOrFail();

        if (!$serviceRequest->output_file_path) {
            return response()->json(['message' => 'No output file available'], 404);
        }

        return response()->download(storage_path('app/' . $serviceRequest->output_file_path));
    }
}
