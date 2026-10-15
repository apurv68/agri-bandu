<?php

use Illuminate\Support\Facades\Route;

Route::match(['get', 'head'], '/', function () {
    $spaFile = public_path('index.html');
    if (!file_exists($spaFile)) {
        $spaFile = public_path('app.html');
    }
    if (file_exists($spaFile)) {
        return response()->file($spaFile, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }
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

// Fallback for Single Page App (SPA) routes on web
Route::fallback(function () {
    $spaFile = public_path('index.html');
    if (!file_exists($spaFile)) {
        $spaFile = public_path('app.html');
    }
    if (file_exists($spaFile)) {
        return response()->file($spaFile, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }
    return response()->json(['error' => 'Endpoint Not Found'], 404);
});

