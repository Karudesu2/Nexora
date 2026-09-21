<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonReflection extends Model
{
    protected $fillable = [
        'lesson_id',
        'what_went_well',
        'challenges',
        'student_learning',
        'next_steps',
        'teacher_notes',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
