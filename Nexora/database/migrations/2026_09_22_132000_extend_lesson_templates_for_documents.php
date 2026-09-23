<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lesson_templates', function (Blueprint $table) {
            $table->string('subject')->nullable()->after('category');
            $table->string('grade_level')->nullable()->after('subject');
            $table->string('learning_area')->nullable()->after('grade_level');
            $table->string('file_name')->nullable()->after('is_public');
            $table->string('file_path')->nullable()->after('file_name');
            $table->string('preview_path')->nullable()->after('file_path');
            $table->string('file_mime', 120)->nullable()->after('preview_path');
            $table->unsignedInteger('file_size')->nullable()->after('file_mime');
            $table->string('processing_status', 30)->default('ready')->after('file_size');
            $table->index(['subject', 'grade_level']);
        });
    }

    public function down(): void
    {
        Schema::table('lesson_templates', function (Blueprint $table) {
            $table->dropIndex(['subject', 'grade_level']);
            $table->dropColumn(['subject', 'grade_level', 'learning_area', 'file_name', 'file_path', 'preview_path', 'file_mime', 'file_size', 'processing_status']);
        });
    }
};
