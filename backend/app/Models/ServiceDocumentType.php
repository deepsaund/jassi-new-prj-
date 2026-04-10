<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceDocumentType extends Model
{
    protected $fillable = [
        'service_id', 'document_name', 'description', 'is_mandatory',
        'accepted_formats', 'max_size_mb', 'sort_order',
    ];

    protected $casts = [
        'is_mandatory' => 'boolean',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function getAcceptedFormatsArrayAttribute(): array
    {
        return array_map('trim', explode(',', $this->accepted_formats));
    }
}
