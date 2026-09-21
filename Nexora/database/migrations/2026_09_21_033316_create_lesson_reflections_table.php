<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_reflections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->unique()->constrained('lessons')->cascadeOnDelete();
            $table->text('what_went_well')->nullable();
            $table->text('challenges')->nullable();
            $table->text('student_learning')->nullable();
            $table->text('next_steps')->nullable();
            $table->text('teacher_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_reflections');
    }
};
