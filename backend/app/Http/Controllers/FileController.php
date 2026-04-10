<?php

namespace App\Http\Controllers;

use App\Models\DocumentVault;
use App\Models\RequestDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function serve(string $type, int $id, Request $request)
    {
        $user = $request->user();

        if ($type === 'vault') {
            $doc = DocumentVault::findOrFail($id);
            if ($doc->user_id !== $user->id && !in_array($user->role->value, ['admin', 'staff'])) {
                abort(403);
            }
            $path = $doc->file_path;
        } elseif ($type === 'request-doc') {
            $doc = RequestDocument::with('serviceRequest')->findOrFail($id);
            $sr = $doc->serviceRequest;
            if ($sr->customer_id !== $user->id && !in_array($user->role->value, ['admin', 'staff'])) {
                abort(403);
            }
            $path = $doc->file_path;
        } else {
            abort(404);
        }

        if (!Storage::exists($path)) {
            abort(404, 'File not found');
        }

        return Storage::download($path);
    }
}
