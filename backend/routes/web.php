<?php

use Illuminate\Support\Facades\Route;

Route::match(['get', 'head'], '/', function () {
    return response()->json([
        'status' => 'Active',
        'application' => 'Agri Bandhu Laravel API Backend',
        'message' => 'Backend API is running smoothly.',
        'endpoints' => [
            'POST /api/register' => 'Register new user account in database',
            'POST /api/login' => 'Authenticate user credentials',
            'POST /api/disease/scan' => 'Plant leaf disease diagnostics',
        ]
    ], 200);
});

Route::match(['get', 'head'], '/api', function () {
    return response()->json([
        'status' => 'Active',
        'message' => 'Agri Bandhu REST API Endpoint Server'
    ], 200);
});
