<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Assessment extends Model
{
    protected $fillable = [
        'id',
        'lesson_id',
        'title',
        'type',
        'description',
        'total_points',
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

    public function competencies(): BelongsToMany
    {
        return $this->belongsToMany(
            Competency::class,
            'assessment_competencies'
        );
    }
}
