<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonVersion extends Model
{
    protected $fillable = [
        'lesson_id',
        'user_id',
        'version_number',
        'title',
        'status',
        'content',
        'plan_data',
    ];

    protected function casts(): array
    {
        return [
            'plan_data' => 'array',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
