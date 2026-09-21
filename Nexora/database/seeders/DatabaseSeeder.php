<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $user = User::query()->firstOrCreate(
            ['email' => 'testteacher@nexora.test'],
            [
                'name' => 'Test Teacher',
                'password' => 'password123',
            ]
        );

        $user->roles()->syncWithoutDetaching(
            [Role::query()->where('code', 'teacher')->valueOrFail('id')]
        );
    }
}
