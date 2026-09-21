<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'application' => 'NEXORA',
        'message' => 'NEXORA Laravel API is running.',
    ]);
});
