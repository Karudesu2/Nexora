<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            'administrator',
            'system_administrator',
        ]);
    }

    public function view(User $user, User $managedUser): bool
    {
        return $this->canManage($user, $managedUser);
    }

    public function updateRole(User $user, User $managedUser): bool
    {
        return $this->canManage($user, $managedUser);
    }

    private function canManage(User $user, User $managedUser): bool
    {
        if ($user->is($managedUser)) {
            return false;
        }

        if ($user->hasAnyRole(['system_administrator'])) {
            return true;
        }

        if (! $user->hasAnyRole(['administrator'])) {
            return false;
        }

        return ! $managedUser->hasAnyRole([
            'administrator',
            'system_administrator',
        ]);
    }
}
