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
        if (! Schema::hasTable('calendar_events')) {
            return;
        }

        // Synchronize legacy production column names with the current application schema.
        if (
            Schema::hasColumn('calendar_events', 'event_date') &&
            ! Schema::hasColumn('calendar_events', 'start_date')
        ) {
            Schema::table('calendar_events', function (Blueprint $table) {
                $table->renameColumn('event_date', 'start_date');
            });
        }

        if (
            Schema::hasColumn('calendar_events', 'event_type') &&
            ! Schema::hasColumn('calendar_events', 'type')
        ) {
            Schema::table('calendar_events', function (Blueprint $table) {
                $table->renameColumn('event_type', 'type');
            });
        }

        if (! Schema::hasColumn('calendar_events', 'is_approved')) {
            Schema::table('calendar_events', function (Blueprint $table) {
                $table->boolean('is_approved')
                    ->default(true)
                    ->after('is_instructional_day');
            });
        }

        if (Schema::hasColumn('calendar_events', 'created_by')) {
            Schema::table('calendar_events', function (Blueprint $table) {
                $table->dropColumn('created_by');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('calendar_events')) {
            return;
        }

        if (
            Schema::hasColumn('calendar_events', 'start_date') &&
            ! Schema::hasColumn('calendar_events', 'event_date')
        ) {
            Schema::table('calendar_events', function (Blueprint $table) {
                $table->renameColumn('start_date', 'event_date');
            });
        }

        if (
            Schema::hasColumn('calendar_events', 'type') &&
            ! Schema::hasColumn('calendar_events', 'event_type')
        ) {
            Schema::table('calendar_events', function (Blueprint $table) {
                $table->renameColumn('type', 'event_type');
            });
        }

        if (Schema::hasColumn('calendar_events', 'is_approved')) {
            Schema::table('calendar_events', function (Blueprint $table) {
                $table->dropColumn('is_approved');
            });
        }

        if (! Schema::hasColumn('calendar_events', 'created_by')) {
            Schema::table('calendar_events', function (Blueprint $table) {
                $table->foreignId('created_by')
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete();
            });
        }
    }
};