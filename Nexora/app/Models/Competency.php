<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Competency extends Model
{
    protected $fillable = [
        'curriculum_version_id',
        'grade_id',
        'subject_id',
        'term_id',
        'code',
        'description',
        'learning_area',
    ];

    public function curriculumVersion()
    {
        return $this->belongsTo(CurriculumVersion::class);
    }

    public function grade()
    {
        return $this->belongsTo(Grade::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function term()
    {
        return $this->belongsTo(Term::class);
    }
}
