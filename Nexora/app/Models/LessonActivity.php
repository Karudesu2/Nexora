<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonActivity extends Model
{
    protected $fillable = [
        'lesson_id',
        'title',
        'description',
        'activity_type',
        'duration_minutes',
        'sort_order',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
