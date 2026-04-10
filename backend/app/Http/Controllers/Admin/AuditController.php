<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\ServiceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('user')->latest('created_at');

        if ($search = $request->input('search')) {
            $query->where('action', 'like', "%{$search}%");
        }
        if ($entityType = $request->input('entity_type')) {
            $query->where('entity_type', $entityType);
        }

        return response()->json($query->paginate($request->input('per_page', 20)));
    }

    public function staffAudit(int $userId, Request $request): JsonResponse
    {
        $query = AuditLog::with('user')
            ->where('user_id', $userId)
            ->latest('created_at');

        return response()->json($query->paginate($request->input('per_page', 20)));
    }

    public function requestAudit(int $requestId): JsonResponse
    {
        $logs = AuditLog::with('user')
            ->where('entity_type', 'service_request')
            ->where('entity_id', $requestId)
            ->latest('created_at')
            ->get();

        return response()->json(['data' => $logs]);
    }

    public function customerDetail(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $requests = ServiceRequest::where('customer_id', $id)
            ->with(['service', 'claimedByUser'])
            ->latest()
            ->get();
        $vault = $user->vaultDocuments()->latest()->get();

        return response()->json([
            'data' => [
                'user' => $user,
                'requests' => $requests,
                'vault' => $vault,
            ],
        ]);
    }
}
