<?php

namespace App\Services;

use App\Models\DocumentVault;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentService
{
    public function storeVaultDocument(int $userId, UploadedFile $file, string $documentName): DocumentVault
    {
        $filename = Str::uuid() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs("documents/vault/{$userId}", $filename);

        return DocumentVault::create([
            'user_id' => $userId,
            'document_name' => $documentName,
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size_kb' => (int) ceil($file->getSize() / 1024),
        ]);
    }

    public function storeRequestDocument(int $requestId, UploadedFile $file): string
    {
        $filename = Str::uuid() . '_' . $file->getClientOriginalName();
        return $file->storeAs("documents/requests/{$requestId}", $filename);
    }

    public function copyVaultToRequest(DocumentVault $vaultDoc, int $requestId): string
    {
        $ext = pathinfo($vaultDoc->file_path, PATHINFO_EXTENSION);
        $newPath = "documents/requests/{$requestId}/" . Str::uuid() . '.' . $ext;
        Storage::copy($vaultDoc->file_path, $newPath);
        return $newPath;
    }
}
