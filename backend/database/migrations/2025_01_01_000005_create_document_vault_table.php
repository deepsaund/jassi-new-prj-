<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_vault', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('document_name');
            $table->string('file_path', 500);
            $table->string('original_filename');
            $table->string('mime_type', 100);
            $table->integer('file_size_kb');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_vault');
    }
};
