<?php

namespace App\Models;

use App\Enums\DocumentStatus;
use Illuminate\Database\Eloquent\Model;

class RequestDocument extends Model
{
    protected $fillable = [
        'service_request_id', 'service_doc_type_id', 'vault_document_id',
        'file_path', 'original_filename', 'mime_type', 'status',
        'rejection_reason', 'reviewed_by', 'reviewed_at', 'auto_approved',
    ];

    protected $casts = [
        'status' => DocumentStatus::class,
        'auto_approved' => 'boolean',
        'reviewed_at' => 'datetime',
    ];

    public function serviceRequest()
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function documentType()
    {
        return $this->belongsTo(ServiceDocumentType::class, 'service_doc_type_id');
    }

    public function vaultDocument()
    {
        return $this->belongsTo(DocumentVault::class, 'vault_document_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
