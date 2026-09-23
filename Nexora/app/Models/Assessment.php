<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Assessment extends Model
{
    protected $fillable = [
        'lesson_id',
        'teacher_id',
        'title',
        'description',
        'assessment_type',
        'total_points',
        'status',
        'assessment_date',
    ];

    protected function casts(): array
    {
        return [
            'assessment_date' => 'date',
            'total_points' => 'decimal:2',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function competencies(): BelongsToMany
    {
        return $this->belongsToMany(
            Competency::class,
            'assessment_competencies'
        );
    }
}