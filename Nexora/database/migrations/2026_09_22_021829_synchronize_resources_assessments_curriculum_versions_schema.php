<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * Resources
         */
        if (Schema::hasTable('resources')
            && ! Schema::hasColumn('resources', 'is_public')) {
            Schema::table('resources', function (Blueprint $table) {
                $table->boolean('is_public')
                    ->default(false)
                    ->after('file_size');
            });
        }

        /*
         * Assessments
         */
        if (Schema::hasTable('assessments')
            && ! Schema::hasColumn('assessments', 'assessment_date')) {
            Schema::table('assessments', function (Blueprint $table) {
                $table->date('assessment_date')
                    ->nullable()
                    ->after('status');
            });
        }

        /*
         * Curriculum Versions
         */
        if (Schema::hasTable('curriculum_versions')
            && Schema::hasColumn('curriculum_versions', 'effective_from')
            && ! Schema::hasColumn('curriculum_versions', 'effective_date')) {
            Schema::table('curriculum_versions', function (Blueprint $table) {
                $table->renameColumn('effective_from', 'effective_date');
            });
        }
    }

    public function down(): void
    {
        /*
         * Resources
         */
        if (Schema::hasTable('resources')
            && Schema::hasColumn('resources', 'is_public')) {
            Schema::table('resources', function (Blueprint $table) {
                $table->dropColumn('is_public');
            });
        }

        /*
         * Assessments
         */
        if (Schema::hasTable('assessments')
            && Schema::hasColumn('assessments', 'assessment_date')) {
            Schema::table('assessments', function (Blueprint $table) {
                $table->dropColumn('assessment_date');
            });
        }

        /*
         * Curriculum Versions
         */
        if (Schema::hasTable('curriculum_versions')
            && Schema::hasColumn('curriculum_versions', 'effective_date')
            && ! Schema::hasColumn('curriculum_versions', 'effective_from')) {
            Schema::table('curriculum_versions', function (Blueprint $table) {
                $table->renameColumn('effective_date', 'effective_from');
            });
        }
    }
};