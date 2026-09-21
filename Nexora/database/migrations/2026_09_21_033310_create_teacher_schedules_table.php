<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_schedules', function (Blueprint $table) {
            $table->id();

            $table->foreignId('teacher_assignment_id')
                ->constrained('teacher_assignments')
                ->cascadeOnDelete();

            $table->string('day_of_week');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('room')->nullable();

            $table->timestamps();

            $table->unique([
                'teacher_assignment_id',
                'day_of_week',
                'start_time',
                'end_time',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_schedules');
    }
};
