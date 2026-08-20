<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DiseaseController;

/*
|--------------------------------------------------------------------------
| Agri Bandhu API Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return response()->json([
        'status' => 'Active',
        'message' => 'Agri Bandhu REST API Endpoint Server',
        'database' => 'Connected & Migrated',
        'endpoints' => [
            'GET /api/users' => 'View all registered users',
            'GET /api/scans' => 'View all uploaded leaf scan images & diagnostic reports',
            'POST /api/send-otp' => 'Send 6-digit email verification OTP',
            'POST /api/verify-otp' => 'Verify OTP & create user in MySQL database',
            'POST /api/register' => 'Register a new user',
            'POST /api/login' => 'Authenticate user login',
            'POST /api/disease/scan' => 'Upload & diagnose leaf image',
        ]
    ]);
});

Route::get('/users', [AuthController::class, 'allUsers']);
Route::get('/scans', [DiseaseController::class, 'getHistory']);

Route::post('/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/user', [AuthController::class, 'user']);

Route::post('/disease/scan', [DiseaseController::class, 'scan']);
Route::post('/disease/history', [DiseaseController::class, 'saveHistory']);
Route::get('/disease/history', [DiseaseController::class, 'getHistory']);
