<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pacing_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('school_year_id')->constrained('school_years')->cascadeOnDelete();
            $table->foreignId('term_id')->constrained('terms')->cascadeOnDelete();
            $table->foreignId('grade_id')->constrained('grades')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('competency_id')->nullable()->constrained('competencies')->nullOnDelete();
            $table->date('planned_date')->nullable();
            $table->date('actual_date')->nullable();
            $table->string('status')->default('On Track');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index([
                'teacher_id',
                'term_id',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pacing_records');
    }
};
