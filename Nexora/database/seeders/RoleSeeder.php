<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ([
            ['name' => 'Teacher', 'code' => 'teacher'],
            ['name' => 'Curriculum Coordinator', 'code' => 'curriculum_coordinator'],
            ['name' => 'School Administrator', 'code' => 'administrator'],
            ['name' => 'System Administrator', 'code' => 'system_administrator'],
        ] as $role) {
            Role::query()->updateOrCreate(['code' => $role['code']], $role);
        }
    }
}
