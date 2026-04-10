<?php

namespace App\Http\Middleware;

use App\Models\ServiceRequest;
use Closure;
use Illuminate\Http\Request;

class EnsureRequestOwnership
{
    public function handle(Request $request, Closure $next): mixed
    {
        $user = $request->user();
        $requestId = $request->route('id') ?? $request->route('requestId');

        if ($requestId && in_array($user->role->value, ['customer', 'b2b'])) {
            $serviceRequest = ServiceRequest::find($requestId);
            if (!$serviceRequest || $serviceRequest->customer_id !== $user->id) {
                return response()->json(['message' => 'Access denied.'], 403);
            }
        }
        return $next($request);
    }
}
