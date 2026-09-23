<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonTemplate extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'category',
        'description',
        'structure',
        'is_public',
        'subject',
        'grade_level',
        'learning_area',
        'file_name',
        'file_path',
        'preview_path',
        'file_mime',
        'file_size',
        'processing_status',
    ];

    protected function casts(): array
    {
        return [
            'structure' => 'array',
            'is_public' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
