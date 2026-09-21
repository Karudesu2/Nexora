<?php

use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CompetencyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\PacingController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::prefix('auth')->group(function () {

        Route::post('/login', [
            AuthController::class,
            'login',
        ]);

        Route::middleware('auth:sanctum')->group(function () {

            Route::post('/logout', [
                AuthController::class,
                'logout',
            ]);

            Route::get('/profile', [
                AuthController::class,
                'profile',
            ]);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Protected NEXORA API
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:sanctum')->group(function () {

        /*
        | Dashboard
        */

        Route::get('/dashboard', [
            DashboardController::class,
            'index',
        ]);

        /*
        | Calendar
        */

        Route::apiResource(
            '/calendar',
            CalendarController::class
        );

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

        Route::apiResource(
            '/lessons',
            LessonController::class
        );

        /*
        | Assessments
        */

        Route::apiResource(
            '/assessments',
            AssessmentController::class
        );

        /*
        | Pacing
        */

        Route::get('/pacing', [
            PacingController::class,
            'index',
        ]);

        /*
        | Reports
        */

        Route::get('/reports/lessons', [
            ReportController::class,
            'lessons',
        ]);
    });
});
