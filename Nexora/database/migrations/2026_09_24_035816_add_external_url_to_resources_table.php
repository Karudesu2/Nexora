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
        if (! Schema::hasColumn('resources', 'external_url')) {
            Schema::table('resources', function (Blueprint $table) {
                $table->text('external_url')->nullable()->after('file_url');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('resources', 'external_url')) {
            Schema::table('resources', function (Blueprint $table) {
                $table->dropColumn('external_url');
            });
        }
    }
};
