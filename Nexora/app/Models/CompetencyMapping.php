<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompetencyMapping extends Model
{
    protected $fillable = [
        'lesson_id',
        'competency_id',
        'alignment_score',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'alignment_score' => 'decimal:2',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function competency(): BelongsTo
    {
        return $this->belongsTo(Competency::class);
    }
}
