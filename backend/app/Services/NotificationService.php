<?php

namespace App\Services;

use App\Models\Notification;
use Illuminate\Support\Facades\Http;

class NotificationService
{
    public function send(int $userId, string $title, string $message, string $type, ?string $referenceType = null, ?int $referenceId = null): Notification
    {
        $notification = Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
        ]);

        // Emit via socket server
        try {
            Http::withHeaders([
                'X-Socket-Secret' => config('app.socket_secret', 'jassi-socket-secret-2025'),
            ])->post('http://localhost:3001/emit/notification', [
                'userId' => $userId,
                'notification' => $notification->toArray(),
            ]);
        } catch (\Throwable $e) {
            // Silent fail
        }

        return $notification;
    }
}
