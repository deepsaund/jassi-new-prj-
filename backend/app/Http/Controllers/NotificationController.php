<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest('created_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($notifications);
    }

    public function markRead(int $id, Request $request): JsonResponse
    {
        Notification::where('id', $id)->where('user_id', $request->user()->id)->update(['is_read' => true]);
        return response()->json(['message' => 'Marked as read']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)->where('is_read', false)->update(['is_read' => true]);
        return response()->json(['message' => 'All marked as read']);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = Notification::where('user_id', $request->user()->id)->where('is_read', false)->count();
        return response()->json(['data' => ['count' => $count]]);
    }
}
