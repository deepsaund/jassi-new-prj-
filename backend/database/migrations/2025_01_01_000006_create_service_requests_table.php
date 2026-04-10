<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_id', 20)->unique();
            $table->foreignId('service_id')->constrained();
            $table->foreignId('customer_id')->constrained('users');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('claimed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('claimed_at')->nullable();
            $table->enum('status', [
                'submitted', 'docs_under_review', 'docs_rejected',
                'in_progress', 'completed', 'pickup_ready', 'delivered', 'cancelled'
            ])->default('submitted');
            $table->decimal('price_charged', 10, 2);
            $table->enum('delivery_type', ['pickup', 'courier', 'digital'])->nullable();
            $table->boolean('is_on_behalf')->default(false);
            $table->string('output_file_path', 500)->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('customer_id');
            $table->index('claimed_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_requests');
    }
};
