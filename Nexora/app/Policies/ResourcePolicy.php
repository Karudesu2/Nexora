<?php

namespace App\Policies;

use App\Models\Resource;
use App\Models\User;

class ResourcePolicy
{
    public function view(User $user, Resource $resource): bool
    {
        return $resource->is_public || $resource->teacher_id === $user->id;
    }

    public function update(User $user, Resource $resource): bool
    {
        return $resource->teacher_id === $user->id;
    }

    public function delete(User $user, Resource $resource): bool
    {
        return $resource->teacher_id === $user->id;
    }
}
