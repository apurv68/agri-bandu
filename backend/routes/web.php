<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'Active',
        'application' => 'Agri Bandhu Laravel API Backend',
        'message' => 'Backend API is running smoothly. Access the React Frontend at http://localhost:3000',
        'endpoints' => [
            'POST /api/register' => 'Register new user account in database',
            'POST /api/login' => 'Authenticate user credentials',
            'POST /api/disease/scan' => 'Plant leaf disease diagnostics',
        ]
    ]);
});
