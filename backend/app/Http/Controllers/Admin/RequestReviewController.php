<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use App\Models\RequestDocument;
use App\Models\RequestStatusHistory;
use App\Services\ServiceRequestService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RequestReviewController extends Controller
{
    public function __construct(
        private ServiceRequestService $requestService,
        private NotificationService $notificationService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = ServiceRequest::with(['service', 'customer', 'claimedByUser']);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('tracking_id', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($q2) => $q2->where('name', 'like', "%{$search}%"));
            });
        }

        $sort = $request->input('sort', 'created_at');
        $dir = $request->input('direction', 'desc');
        $query->orderBy($sort, $dir);

        return response()->json($query->paginate($request->input('per_page', 15)));
    }

    public function show(int $id): JsonResponse
    {
        $request = ServiceRequest::with([
            'service.documentTypes', 'customer', 'claimedByUser',
            'documents.documentType', 'statusHistory.changer',
        ])->findOrFail($id);

        return response()->json(['data' => $request]);
    }

    public function review(int $id, Request $request): JsonResponse
    {
        $serviceRequest = ServiceRequest::findOrFail($id);
        $user = $request->user();

        $validated = $request->validate([
            'documents' => 'required|array',
            'documents.*.id' => 'required|exists:request_documents,id',
            'documents.*.status' => 'required|in:approved,rejected',
            'documents.*.rejection_reason' => 'required_if:documents.*.status,rejected|nullable|string',
        ]);

        // Auto-transition to docs_under_review if submitted
        if ($serviceRequest->status->value === 'submitted') {
            $this->requestService->transitionStatus($serviceRequest, 'docs_under_review', $user->id);
        }

        foreach ($validated['documents'] as $docData) {
            RequestDocument::where('id', $docData['id'])
                ->where('service_request_id', $serviceRequest->id)
                ->update([
                    'status' => $docData['status'],
                    'rejection_reason' => $docData['rejection_reason'] ?? null,
                    'reviewed_by' => $user->id,
                    'reviewed_at' => now(),
                ]);
        }

        $serviceRequest->refresh();
        $this->requestService->checkAndUpdateDocumentStatus($serviceRequest, $user->id);

        // Notify customer
        $this->notificationService->send(
            $serviceRequest->customer_id,
            'Document Review Update',
            "Your request {$serviceRequest->tracking_id} documents have been reviewed.",
            'doc_reviewed',
            'service_request',
            $serviceRequest->id
        );

        return response()->json([
            'data' => $serviceRequest->load(['documents.documentType', 'statusHistory']),
            'message' => 'Documents reviewed',
        ]);
    }

    public function requestReupload(int $id, Request $request): JsonResponse
    {
        $serviceRequest = ServiceRequest::findOrFail($id);

        $this->notificationService->send(
            $serviceRequest->customer_id,
            'Documents Need Re-upload',
            "Some documents in request {$serviceRequest->tracking_id} need to be re-uploaded.",
            'reupload_requested',
            'service_request',
            $serviceRequest->id
        );

        return response()->json(['message' => 'Re-upload request sent to customer']);
    }
}
