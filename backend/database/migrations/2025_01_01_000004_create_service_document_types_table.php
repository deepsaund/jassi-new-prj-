<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_document_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->string('document_name');
            $table->text('description')->nullable();
            $table->boolean('is_mandatory')->default(true);
            $table->string('accepted_formats')->default('pdf,jpg,jpeg,png');
            $table->integer('max_size_mb')->default(10);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_document_types');
    }
};
