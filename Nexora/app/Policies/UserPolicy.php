<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['system_administrator']);
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

        return $user->hasAnyRole(['system_administrator']);
    }
}
