<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table): void {
            if (! Schema::hasColumn('lessons', 'plan_data')) {
                $table->json('plan_data')->nullable()->after('differentiation');
            }

            if (! Schema::hasColumn('lessons', 'source_file_name')) {
                $table->string('source_file_name')->nullable()->after('plan_data');
            }

            if (! Schema::hasColumn('lessons', 'source_file_path')) {
                $table->string('source_file_path')->nullable()->after('source_file_name');
            }

            if (! Schema::hasColumn('lessons', 'source_file_mime')) {
                $table->string('source_file_mime')->nullable()->after('source_file_path');
            }
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table): void {
            foreach (['source_file_mime', 'source_file_path', 'source_file_name', 'plan_data'] as $column) {
                if (Schema::hasColumn('lessons', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
