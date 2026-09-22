<?php

use App\Http\Controllers\AcademicContextController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AlignmentController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CompetencyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\LessonPlanningController;
use App\Http\Controllers\LessonTemplateController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PacingController;
use App\Http\Controllers\PlanningContextController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ResourceController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::prefix('auth')->group(function () {

        Route::post('/register', [
            AuthController::class,
            'register',
        ])->middleware('throttle:5,1');

        Route::post('/login', [
            AuthController::class,
            'login',
        ])->middleware('throttle:5,1');

        Route::middleware('auth:sanctum')->group(function () {

            Route::post('/logout', [
                AuthController::class,
                'logout',
            ]);

            Route::get('/profile', [
                AuthController::class,
                'profile',
            ]);

            Route::patch('/profile', [
                AuthController::class,
                'updateProfile',
            ]);

            Route::put('/password', [
                AuthController::class,
                'updatePassword',
            ]);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Protected NEXORA API
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:sanctum')->group(function () {

        Route::middleware('school-administrator')->prefix('admin')->group(function () {
            Route::get('/dashboard', [
                AdminDashboardController::class,
                'index',
            ]);
        });

        /*
        | Dashboard
        */

        Route::get('/dashboard', [
            DashboardController::class,
            'index',
        ]);

        Route::get('/planning-context', [
            PlanningContextController::class,
            'index',
        ]);

        Route::get('/admin/academic-context', [
            AcademicContextController::class,
            'index',
        ]);

        Route::get('/admin/users', [
            AdminUserController::class,
            'index',
        ]);

        Route::get('/admin/users/{user}', [
            AdminUserController::class,
            'show',
        ]);

        Route::patch('/admin/users/{user}/role', [
            AdminUserController::class,
            'updateRole',
        ]);

        Route::get('/admin/feedback', [
            FeedbackController::class,
            'adminIndex',
        ]);

        Route::get('/admin/feedback/{feedback}', [
            FeedbackController::class,
            'adminShow',
        ]);

        Route::patch('/admin/feedback/{feedback}', [
            FeedbackController::class,
            'adminUpdate',
        ]);

        Route::post('/admin/school-years', [
            AcademicContextController::class,
            'storeSchoolYear',
        ]);

        Route::post('/admin/terms', [
            AcademicContextController::class,
            'storeTerm',
        ]);

        Route::post('/admin/grades', [
            AcademicContextController::class,
            'storeGrade',
        ]);

        Route::post('/admin/subjects', [
            AcademicContextController::class,
            'storeSubject',
        ]);

        Route::post('/admin/curriculum-versions', [
            AcademicContextController::class,
            'storeCurriculumVersion',
        ]);

        Route::post('/admin/competencies', [
            AcademicContextController::class,
            'storeCompetency',
        ]);

        /*
        | Calendar
        */

        Route::apiResource(
            '/calendar',
            CalendarController::class
        );

        /*
        | System feedback and support
        */

        Route::get('/feedback', [
            FeedbackController::class,
            'index',
        ]);

        Route::post('/feedback', [
            FeedbackController::class,
            'store',
        ]);

        Route::get('/feedback/{feedback}', [
            FeedbackController::class,
            'show',
        ]);

        Route::get('/feedback/{feedback}/attachment', [
            FeedbackController::class,
            'downloadAttachment',
        ]);

        /*
        | Competencies
        */

        Route::get('/competencies', [
            CompetencyController::class,
            'index',
        ]);

        Route::get('/competencies/{competency}', [
            CompetencyController::class,
            'show',
        ]);

        /*
        | Lessons
        */

        Route::post('/lessons/import', [
            LessonController::class,
            'import',
        ]);

        Route::get('/lessons/{lesson}/versions', [
            LessonController::class,
            'versions',
        ]);

        Route::post('/lessons/{lesson}/versions/{version}/restore', [
            LessonController::class,
            'restoreVersion',
        ]);

        Route::put('/lessons/{lesson}/planning', [
            LessonPlanningController::class,
            'update',
        ]);

        Route::apiResource(
            '/lessons',
            LessonController::class
        );

        Route::apiResource('/lesson-templates', LessonTemplateController::class)
            ->except(['show']);

        /*
        | Assessments
        */

        Route::apiResource(
            '/assessments',
            AssessmentController::class
        );

        /*
        | Resources and notifications
        */

        Route::get('/resources/{resource}/download', [
            ResourceController::class,
            'download',
        ]);

        Route::apiResource('/resources', ResourceController::class)
            ->except(['show']);

        Route::get('/notifications', [
            NotificationController::class,
            'index',
        ]);

        Route::patch('/notifications/read-all', [
            NotificationController::class,
            'markAllRead',
        ]);

        Route::patch('/notifications/{notification}/read', [
            NotificationController::class,
            'markRead',
        ]);

        /*
        | Pacing
        */

        Route::get('/pacing', [
            PacingController::class,
            'index',
        ]);

        /*
        | Alignment and competency mapping
        */

        Route::get('/alignment', [
            AlignmentController::class,
            'index',
        ]);

        Route::post('/lessons/{lesson}/competencies', [
            AlignmentController::class,
            'mapCompetency',
        ]);

        Route::delete('/lessons/{lesson}/competencies/{competency}', [
            AlignmentController::class,
            'unmapCompetency',
        ]);

        /*
        | Reports
        */

        Route::get('/reports/lessons', [
            ReportController::class,
            'lessons',
        ]);

        Route::get('/reports/overview', [
            ReportController::class,
            'overview',
        ]);
    });
});
