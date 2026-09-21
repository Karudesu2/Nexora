<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competency_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->foreignId('competency_id')->constrained('competencies')->cascadeOnDelete();
            $table->decimal('alignment_score', 5, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique([
                'lesson_id',
                'competency_id',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competency_mappings');
    }
};
