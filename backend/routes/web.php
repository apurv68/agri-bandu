<?php

use Illuminate\Support\Facades\Route;

Route::match(['get', 'head'], '/', function () {
    return response()->json([
        'status' => 'Active',
        'application' => 'Agri Bandhu Laravel API Backend',
        'message' => 'Backend API is running smoothly.',
        'database' => 'Connected & Ready',
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

// Database check endpoint - view all registered users
Route::get('/db-check', function () {
    try {
        $users = \App\Models\User::select('id', 'name', 'email', 'created_at')->get();
        return response()->json([
            'status' => 'Connected',
            'db_driver' => config('database.default'),
            'total_users' => $users->count(),
            'users' => $users,
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'Error',
            'message' => $e->getMessage(),
        ], 500);
    }
});
