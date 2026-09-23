<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('resources')
            && ! Schema::hasColumn('resources', 'type')) {
            Schema::table('resources', function (Blueprint $table) {
                $table->string('type')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('resources')
            && Schema::hasColumn('resources', 'type')) {
            Schema::table('resources', function (Blueprint $table) {
                $table->dropColumn('type');
            });
        }
    }
};
