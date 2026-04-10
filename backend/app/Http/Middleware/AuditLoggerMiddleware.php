<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;

class AuditLoggerMiddleware
{
    public function handle(Request $request, Closure $next): mixed
    {
        $response = $next($request);

        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE']) && $request->user()) {
            try {
                $routeName = $request->route()?->getName() ?? $request->path();
                AuditLog::create([
                    'user_id' => $request->user()->id,
                    'action' => $request->method() . ' ' . $routeName,
                    'entity_type' => $this->guessEntityType($request),
                    'entity_id' => $this->guessEntityId($request, $response),
                    'metadata' => [
                        'route' => $routeName,
                        'method' => $request->method(),
                        'status' => $response->getStatusCode(),
                    ],
                    'ip_address' => $request->ip(),
                ]);
            } catch (\Throwable $e) {
                // Silent fail — audit logging should never break the request
            }
        }

        return $response;
    }

    private function guessEntityType(Request $request): string
    {
        $path = $request->path();
        if (str_contains($path, 'services')) return 'service';
        if (str_contains($path, 'requests') || str_contains($path, 'queue')) return 'service_request';
        if (str_contains($path, 'users')) return 'user';
        if (str_contains($path, 'vault')) return 'document_vault';
        if (str_contains($path, 'chat')) return 'chat_message';
        return 'unknown';
    }

    private function guessEntityId(Request $request, $response): int
    {
        // Try route parameter
        foreach (['id', 'requestId', 'userId'] as $param) {
            if ($id = $request->route($param)) return (int) $id;
        }
        // Try response body
        try {
            $data = json_decode($response->getContent(), true);
            return $data['data']['id'] ?? 0;
        } catch (\Throwable $e) {
            return 0;
        }
    }
}
