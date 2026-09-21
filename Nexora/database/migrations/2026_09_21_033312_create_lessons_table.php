<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();

            $table->foreignId('teacher_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('school_year_id')
                ->constrained('school_years')
                ->cascadeOnDelete();

            $table->foreignId('term_id')
                ->constrained('terms')
                ->cascadeOnDelete();

            $table->foreignId('grade_id')
                ->constrained('grades')
                ->cascadeOnDelete();

            $table->foreignId('subject_id')
                ->constrained('subjects')
                ->cascadeOnDelete();

            $table->string('section');
            $table->string('title');
            $table->date('lesson_date');

            $table->enum('status', [
                'Draft',
                'Scheduled',
                'In Progress',
                'Completed',
                'Missed',
                'Rescheduled',
                'Cancelled',
                'Archived',
            ])->default('Draft');

            $table->longText('content')->nullable();

            $table->timestamps();

            $table->index([
                'teacher_id',
                'lesson_date',
            ]);

            $table->index([
                'school_year_id',
                'term_id',
                'lesson_date',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
