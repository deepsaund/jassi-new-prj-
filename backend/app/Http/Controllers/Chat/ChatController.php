<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ServiceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    public function index(int $requestId, Request $request): JsonResponse
    {
        $query = ChatMessage::where('service_request_id', $requestId)
            ->with('sender:id,name,role,avatar')
            ->orderByDesc('id');

        if ($cursor = $request->input('cursor')) {
            $query->where('id', '<', $cursor);
        }

        $limit = $request->input('limit', 50);
        $messages = $query->limit($limit + 1)->get();

        $hasMore = $messages->count() > $limit;
        if ($hasMore) $messages->pop();

        return response()->json([
            'data' => [
                'messages' => $messages->reverse()->values(),
                'next_cursor' => $hasMore ? $messages->last()?->id : null,
            ],
        ]);
    }

    public function store(int $requestId, Request $request): JsonResponse
    {
        $serviceRequest = ServiceRequest::findOrFail($requestId);
        $user = $request->user();

        // Verify access: customer owns it, or admin/staff is assigned/reviewing
        if (in_array($user->role->value, ['customer', 'b2b']) && $serviceRequest->customer_id !== $user->id) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $message = ChatMessage::create([
            'service_request_id' => $requestId,
            'sender_id' => $user->id,
            'message' => $validated['message'],
        ]);

        $message->load('sender:id,name,role,avatar');

        // Broadcast via socket server
        try {
            Http::withHeaders([
                'X-Socket-Secret' => config('app.socket_secret', 'jassi-socket-secret-2025'),
            ])->post('http://localhost:3001/emit/chat', [
                'id' => $message->id,
                'service_request_id' => $requestId,
                'sender_id' => $user->id,
                'sender_name' => $user->name,
                'message' => $message->message,
                'attachment_path' => null,
                'created_at' => $message->created_at->toISOString(),
            ]);
        } catch (\Throwable $e) {}

        return response()->json(['data' => $message], 201);
    }
}
