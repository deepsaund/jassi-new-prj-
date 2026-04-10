<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        $user = $request->user();
        if (!$user || !in_array($user->role->value, $roles)) {
            return response()->json(['message' => 'Unauthorized. Insufficient role.'], 403);
        }
        return $next($request);
    }
}
