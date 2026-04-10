<?php

namespace App\Services;

use App\Enums\RequestStatus;
use App\Enums\DocumentStatus;
use App\Models\ServiceRequest;
use App\Models\RequestStatusHistory;
use Illuminate\Support\Facades\DB;

class ServiceRequestService
{
    const TRANSITIONS = [
        'submitted' => ['docs_under_review', 'cancelled'],
        'docs_under_review' => ['docs_rejected', 'in_progress', 'cancelled'],
        'docs_rejected' => ['docs_under_review', 'cancelled'],
        'in_progress' => ['completed'],
        'completed' => ['pickup_ready', 'delivered'],
    ];

    public function transitionStatus(ServiceRequest $request, string $newStatus, int $changedBy, ?string $notes = null): ServiceRequest
    {
        $currentStatus = $request->status->value;

        if (!isset(self::TRANSITIONS[$currentStatus]) || !in_array($newStatus, self::TRANSITIONS[$currentStatus])) {
            throw new \InvalidArgumentException("Cannot transition from '{$currentStatus}' to '{$newStatus}'");
        }

        $request->status = $newStatus;
        if ($newStatus === 'completed') {
            $request->completed_at = now();
        }
        $request->save();

        RequestStatusHistory::create([
            'service_request_id' => $request->id,
            'from_status' => $currentStatus,
            'to_status' => $newStatus,
            'changed_by' => $changedBy,
            'notes' => $notes,
        ]);

        return $request;
    }

    public function checkAndUpdateDocumentStatus(ServiceRequest $request, int $changedBy): void
    {
        $documents = $request->documents;
        $allApproved = $documents->every(fn($doc) => $doc->status === DocumentStatus::Approved);
        $anyRejected = $documents->contains(fn($doc) => $doc->status === DocumentStatus::Rejected);

        if ($anyRejected && $request->status->value === 'docs_under_review') {
            $this->transitionStatus($request, 'docs_rejected', $changedBy, 'Some documents were rejected');
        }
    }

    public function claimRequest(int $requestId, int $staffId): ServiceRequest
    {
        return DB::transaction(function () use ($requestId, $staffId) {
            $request = ServiceRequest::where('id', $requestId)
                ->whereNull('claimed_by')
                ->where('status', 'docs_under_review')
                ->lockForUpdate()
                ->first();

            if (!$request) {
                throw new \RuntimeException('Request not available for claiming');
            }

            // Check all docs approved
            $allApproved = $request->documents->every(fn($doc) => $doc->status === DocumentStatus::Approved);
            if (!$allApproved) {
                throw new \RuntimeException('Not all documents are approved');
            }

            $request->update([
                'claimed_by' => $staffId,
                'claimed_at' => now(),
            ]);

            $this->transitionStatus($request, 'in_progress', $staffId, 'Request claimed');

            return $request;
        });
    }
}
