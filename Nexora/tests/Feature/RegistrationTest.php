<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_can_register_and_retrieve_their_profile(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'New Teacher',
            'email' => 'NEW.TEACHER@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Registration successful.')
            ->assertJsonPath('data.user.name', 'New Teacher')
            ->assertJsonPath('data.user.email', 'new.teacher@example.test')
            ->assertJsonPath('data.user.role_codes.0', 'teacher');

        $user = User::query()->where('email', 'new.teacher@example.test')->firstOrFail();

        $this->assertSame('New Teacher', $user->name);
        $this->assertTrue(Hash::check('password123', $user->password));
        $this->assertTrue($user->hasAnyRole(['teacher']));

        $this->withToken($response->json('data.token'))
            ->getJson('/api/v1/auth/profile')
            ->assertOk()
            ->assertJsonPath('data.user.id', $user->id);
    }

    public function test_registration_validates_name_duplicate_email_and_password_confirmation(): void
    {
        User::factory()->create(['email' => 'teacher@example.test']);

        $this->postJson('/api/v1/auth/register', [
            'email' => 'teacher@example.test',
            'password' => 'password123',
            'password_confirmation' => 'different-password',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonStructure(['errors' => ['name', 'email', 'password']]);
    }

    public function test_registration_ignores_role_injection_and_assigns_teacher_role(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'New Teacher',
            'email' => 'new.teacher@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'school_administrator',
            'role_code' => 'system_administrator',
        ])->assertCreated();

        $user = User::query()->where('email', 'new.teacher@example.test')->firstOrFail();

        $this->assertTrue($user->hasAnyRole(['teacher']));
        $this->assertFalse($user->hasAnyRole(['school_administrator', 'system_administrator']));
    }
}
