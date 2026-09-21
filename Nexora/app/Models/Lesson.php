<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Lesson extends Model
{
    protected $fillable = [
        'teacher_id',
        'school_year_id',
        'term_id',
        'grade_id',
        'subject_id',
        'section',
        'title',
        'lesson_date',
        'status',
        'content',
    ];

    protected function casts(): array
    {
        return [
            'lesson_date' => 'date',
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function schoolYear(): BelongsTo
    {
        return $this->belongsTo(SchoolYear::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function objectives(): HasMany
    {
        return $this->hasMany(LessonObjective::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(LessonActivity::class);
    }

    public function resources(): HasMany
    {
        return $this->hasMany(LessonResource::class);
    }

    public function reflections(): HasOne
    {
        return $this->hasOne(LessonReflection::class);
    }

    public function competencies(): BelongsToMany
    {
        return $this->belongsToMany(
            Competency::class,
            'competency_mappings'
        );
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }
}
