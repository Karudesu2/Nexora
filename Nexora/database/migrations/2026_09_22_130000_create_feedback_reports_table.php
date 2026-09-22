<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feedback_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('category', 80);
            $table->string('priority', 40)->default('Medium');
            $table->string('status', 40)->default('Submitted');
            $table->string('title');
            $table->text('description');
            $table->string('affected_module')->nullable();
            $table->text('steps_to_reproduce')->nullable();
            $table->text('suggested_solution')->nullable();
            $table->text('system_information')->nullable();
            $table->text('attachment_path')->nullable();
            $table->string('attachment_name')->nullable();
            $table->string('attachment_mime')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['category', 'priority', 'status']);
        });

        Schema::create('feedback_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feedback_report_id')->constrained('feedback_reports')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 40)->nullable();
            $table->text('message');
            $table->timestamps();

            $table->index(['feedback_report_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback_updates');
        Schema::dropIfExists('feedback_reports');
    }
};
