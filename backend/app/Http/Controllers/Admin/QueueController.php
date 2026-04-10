<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Enums\DocumentStatus;
use App\Models\ServiceRequest;
use App\Models\RequestStatusHistory;
use App\Services\ServiceRequestService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class QueueController extends Controller
{
    public function __construct(
        private ServiceRequestService $requestService,
        private NotificationService $notificationService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = ServiceRequest::with(['service', 'customer'])
            ->whereNull('claimed_by')
            ->where('status', 'docs_under_review')
            ->whereDoesntHave('documents', fn($q) => $q->whereNot('status', 'approved'));

        if ($search = $request->input('search')) {
            $query->where('tracking_id', 'like', "%{$search}%");
        }

        $query->orderBy('created_at', 'asc');

        return response()->json($query->paginate($request->input('per_page', 15)));
    }

    public function claim(int $id, Request $request): JsonResponse
    {
        try {
            $serviceRequest = $this->requestService->claimRequest($id, $request->user()->id);

            $this->notificationService->send(
                $serviceRequest->customer_id,
                'Request In Progress',
                "Your request {$serviceRequest->tracking_id} is now being processed.",
                'status_change',
                'service_request',
                $serviceRequest->id
            );

            // Broadcast queue update via socket
            try {
                Http::withHeaders([
                    'X-Socket-Secret' => config('app.socket_secret', 'jassi-socket-secret-2025'),
                ])->post('http://localhost:3001/emit/queue', [
                    'event' => 'queue:claimed',
                    'data' => ['requestId' => $id, 'claimedBy' => $request->user()->id],
                ]);
            } catch (\Throwable $e) {}

            return response()->json([
                'data' => $serviceRequest->load(['service', 'customer']),
                'message' => 'Request claimed successfully',
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    public function unclaim(int $id, Request $request): JsonResponse
    {
        $serviceRequest = ServiceRequest::where('id', $id)
            ->where('claimed_by', $request->user()->id)
            ->firstOrFail();

        $serviceRequest->update([
            'claimed_by' => null,
            'claimed_at' => null,
            'status' => 'docs_under_review',
        ]);

        RequestStatusHistory::create([
            'service_request_id' => $serviceRequest->id,
            'from_status' => 'in_progress',
            'to_status' => 'docs_under_review',
            'changed_by' => $request->user()->id,
            'notes' => 'Request unclaimed',
        ]);

        return response()->json(['message' => 'Request released back to queue']);
    }
}
