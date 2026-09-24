<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    public function feedbackReports(): HasMany
    {
        return $this->hasMany(FeedbackReport::class);
    }

    public function hasAnyRole(array $roleCodes): bool
    {
        return $this->roles()
            ->whereIn('code', $roleCodes)
            ->exists();
    }

    public function isSchoolAdministrator(): bool
    {
        return $this->hasAnyRole([
            'school_administrator',
            'administrator',
            'system_administrator',
        ]);
    }
}
