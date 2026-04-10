<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentVault extends Model
{
    protected $table = 'document_vault';

    protected $fillable = [
        'user_id', 'document_name', 'file_path', 'original_filename',
        'mime_type', 'file_size_kb',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
