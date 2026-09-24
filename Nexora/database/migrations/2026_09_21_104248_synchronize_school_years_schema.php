<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('school_years')) {
            return;
        }

        if (! Schema::hasColumn('school_years', 'is_active')) {
            Schema::table('school_years', function (Blueprint $table) {
                $table->boolean('is_active')
                    ->default(false)
                    ->after('end_date');
            });
        }

        if (Schema::hasColumn('school_years', 'status')) {
            Schema::table('school_years', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('school_years')) {
            return;
        }

        if (! Schema::hasColumn('school_years', 'status')) {
            Schema::table('school_years', function (Blueprint $table) {
                $table->string('status')->nullable()->after('end_date');
            });
        }

        if (Schema::hasColumn('school_years', 'is_active')) {
            Schema::table('school_years', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }
    }
};
