<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Resource extends Model
{
    protected $fillable = [
        'teacher_id',
        'name',
        'description',
        'resource_type',
        'file_path',
        'file_url',
        'mime_type',
        'file_size',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
            'file_size' => 'integer',
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}app/Http/Controllers/ResourceController.php