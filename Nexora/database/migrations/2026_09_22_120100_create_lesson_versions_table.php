<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('version_number');
            $table->string('title');
            $table->string('status')->default('Draft');
            $table->longText('content')->nullable();
            $table->json('plan_data')->nullable();
            $table->timestamps();

            $table->unique(['lesson_id', 'version_number']);
            $table->index(['lesson_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_versions');
    }
};
