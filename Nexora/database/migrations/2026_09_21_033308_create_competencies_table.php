<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('curriculum_version_id')
                ->constrained('curriculum_versions')
                ->cascadeOnDelete();
            $table->foreignId('grade_id')
                ->constrained('grades')
                ->cascadeOnDelete();
            $table->foreignId('subject_id')
                ->constrained('subjects')
                ->cascadeOnDelete();
            $table->foreignId('term_id')
                ->constrained('terms')
                ->cascadeOnDelete();
            $table->string('code');
            $table->text('description');
            $table->string('learning_area')->nullable();
            $table->timestamps();

            $table->unique([
                'curriculum_version_id',
                'grade_id',
                'subject_id',
                'term_id',
                'code',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competencies');
    }
};
