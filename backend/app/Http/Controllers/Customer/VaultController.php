<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\DocumentVault;
use App\Models\ServiceDocumentType;
use App\Services\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VaultController extends Controller
{
    public function __construct(private DocumentService $documentService) {}

    public function index(Request $request): JsonResponse
    {
        $docs = DocumentVault::where('user_id', $request->user()->id)
            ->latest()
            ->paginate($request->input('per_page', 20));
        return response()->json($docs);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'document_name' => 'required|string|max:255',
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,doc,docx',
        ]);

        $doc = $this->documentService->storeVaultDocument(
            $request->user()->id,
            $request->file('file'),
            $validated['document_name']
        );

        return response()->json(['data' => $doc, 'message' => 'Document uploaded'], 201);
    }

    public function destroy(int $id, Request $request): JsonResponse
    {
        $doc = DocumentVault::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();
        Storage::delete($doc->file_path);
        $doc->delete();
        return response()->json(['message' => 'Document deleted']);
    }

    public function suggest(int $serviceId, Request $request): JsonResponse
    {
        $userDocs = DocumentVault::where('user_id', $request->user()->id)->get();
        return response()->json(['data' => $userDocs]);
    }
}
