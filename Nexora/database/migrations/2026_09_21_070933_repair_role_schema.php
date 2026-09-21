<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('code')->unique();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        } elseif (! Schema::hasColumn('roles', 'name')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->string('name');
            });
        }

        if (Schema::hasTable('roles') && ! Schema::hasColumn('roles', 'code')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->string('code')->unique();
            });
        }

        if (Schema::hasTable('roles') && ! Schema::hasColumn('roles', 'description')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->text('description')->nullable();
            });
        }

        if (! Schema::hasTable('role_user')) {
            Schema::create('role_user', function (Blueprint $table) {
                $table->id();
                $table->foreignId('role_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->timestamps();

                $table->unique(['role_id', 'user_id']);
            });
        } elseif (! Schema::hasColumn('role_user', 'role_id')) {
            Schema::table('role_user', function (Blueprint $table) {
                $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            });
        }

        if (Schema::hasTable('role_user') && ! Schema::hasColumn('role_user', 'user_id')) {
            Schema::table('role_user', function (Blueprint $table) {
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            });
        }

        if (Schema::hasTable('role_user')
            && Schema::hasColumn('role_user', 'role_id')
            && Schema::hasColumn('role_user', 'user_id')
            && ! Schema::hasIndex('role_user', ['role_id', 'user_id'])) {
            Schema::table('role_user', function (Blueprint $table) {
                $table->unique(['role_id', 'user_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {}
};
