<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeedbackReport extends Model
{
    public const CATEGORIES = [
        'Bug Report',
        'Feature Request',
        'Improvement Suggestion',
        'General Feedback',
    ];

    public const PRIORITIES = [
        'Low',
        'Medium',
        'High',
        'Critical',
    ];

    public const STATUSES = [
        'Submitted',
        'Reviewing',
        'In Progress',
        'Resolved',
        'Closed',
    ];

    protected $fillable = [
        'user_id',
        'category',
        'priority',
        'status',
        'title',
        'description',
        'affected_module',
        'steps_to_reproduce',
        'suggested_solution',
        'system_information',
        'attachment_path',
        'attachment_name',
        'attachment_mime',
        'resolved_by',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function updates(): HasMany
    {
        return $this->hasMany(FeedbackUpdate::class);
    }
}
