<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $isStaff = $user->role->value === 'staff';

        $requestsQuery = ServiceRequest::query();
        if ($isStaff) {
            $requestsQuery->where('claimed_by', $user->id);
        }

        $stats = [
            'total_requests' => (clone $requestsQuery)->count(),
            'pending_requests' => (clone $requestsQuery)->whereIn('status', ['submitted', 'docs_under_review', 'docs_rejected'])->count(),
            'in_progress_requests' => (clone $requestsQuery)->where('status', 'in_progress')->count(),
            'completed_requests' => (clone $requestsQuery)->whereIn('status', ['completed', 'pickup_ready', 'delivered'])->count(),
            'total_customers' => $isStaff ? 0 : User::whereIn('role', ['customer', 'b2b'])->count(),
            'total_revenue' => (clone $requestsQuery)->whereIn('status', ['completed', 'pickup_ready', 'delivered'])->sum('price_charged'),
        ];

        // Requests by status
        $byStatus = (clone $requestsQuery)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        // Popular services
        $popularServices = ServiceRequest::select('service_id', DB::raw('count(*) as count'))
            ->with('service:id,name')
            ->groupBy('service_id')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(fn($r) => ['name' => $r->service?->name, 'count' => $r->count]);

        // Recent requests
        $recent = (clone $requestsQuery)->with(['service', 'customer'])->latest()->limit(10)->get();

        // Daily trend (last 30 days)
        $dailyTrend = ServiceRequest::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'data' => array_merge($stats, [
                'requests_by_status' => $byStatus,
                'popular_services' => $popularServices,
                'recent_requests' => $recent,
                'daily_trend' => $dailyTrend,
            ]),
        ]);
    }
}
