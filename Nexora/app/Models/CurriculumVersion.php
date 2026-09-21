<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CurriculumVersion extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'effective_date',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'effective_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function competencies(): HasMany
    {
        return $this->hasMany(Competency::class);
    }
}
