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
            'first_name' => 'New',
            'middle_name' => 'M.',
            'last_name' => 'Teacher',
            'email' => 'NEW.TEACHER@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Registration successful.')
            ->assertJsonPath('data.user.email', 'new.teacher@example.test');

        $user = User::query()->where('email', 'new.teacher@example.test')->firstOrFail();

        $this->assertSame('New', $user->first_name);
        $this->assertSame('M.', $user->middle_name);
        $this->assertSame('Teacher', $user->last_name);
        $this->assertSame('New M. Teacher', $user->name);
        $this->assertTrue(Hash::check('password123', $user->password));
        $this->assertTrue($user->hasAnyRole(['teacher']));

        $this->withToken($response->json('data.token'))
            ->getJson('/api/v1/auth/profile')
            ->assertOk()
            ->assertJsonPath('data.user.id', $user->id);

    }

    public function test_registration_validates_duplicate_email_and_password_confirmation(): void
    {
        User::factory()->create([
            'email' => 'teacher@example.test',
        ]);

        $this->postJson('/api/v1/auth/register', [
            'first_name' => 'New',
            'last_name' => 'Teacher',
            'email' => 'teacher@example.test',
            'password' => 'password123',
            'password_confirmation' => 'different-password',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonStructure(['errors' => ['email', 'password']]);
    }

    public function test_registration_requires_a_first_and_last_name_but_allows_an_optional_middle_name(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'middle_name' => 'M.',
            'email' => 'new.teacher@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('errors.first_name.0', 'The first name field is required.')
            ->assertJsonPath('errors.last_name.0', 'The last name field is required.');

        $this->postJson('/api/v1/auth/register', [
            'first_name' => 'New',
            'last_name' => 'Teacher',
            'email' => 'first.name@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated();

        $this->assertDatabaseHas('users', [
            'email' => 'first.name@example.test',
            'name' => 'New Teacher',
            'middle_name' => null,
            'last_name' => 'Teacher',
        ]);
    }
}
