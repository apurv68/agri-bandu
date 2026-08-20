<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

class AuthController extends Controller
{
    public function sendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email format. Please enter a valid official email address.',
            ], 422);
        }

        $email = strtolower(trim($request->email));

        // Check if email already exists in database
        if (User::where('email', $email)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'This official email is already registered. Please log in instead.',
            ], 422);
        }

        // Generate 6-digit OTP & cache for 10 minutes
        $otp = (string) rand(100000, 999999);
        Cache::put('otp_' . $email, $otp, now()->addMinutes(10));

        // Dispatch OTP code to system log for instant 1ms response
        \Illuminate\Support\Facades\Log::info("Agri Bandhu OTP for {$email}: {$otp}");

        return response()->json([
            'success' => true,
            'message' => "A 6-digit verification OTP code has been generated for {$email}.",
            'otp' => $otp,
            'email' => $email
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'otp' => 'required|string|size:6',
            'role' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $email = strtolower(trim($request->email));
        $cachedOtp = Cache::get('otp_' . $email);

        // Verify OTP code
        if (!$cachedOtp || $cachedOtp !== trim($request->otp)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP verification code. Please request a new OTP.',
            ], 422);
        }

        try {
            // Remove used OTP
            Cache::forget('otp_' . $email);

            $user = User::create([
                'name' => $request->name,
                'email' => $email,
                'password' => Hash::make($request->password),
                'role' => $request->role ?? 'Farmer',
                'email_verified_at' => now(),
            ]);

            $token = bin2hex(random_bytes(32));

            return response()->json([
                'success' => true,
                'message' => 'Official Email Verified! Account created successfully in database.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'token' => $token,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => strtolower(trim($request->email)),
                'password' => Hash::make($request->password),
                'role' => $request->role ?? 'Farmer',
                'email_verified_at' => now(),
            ]);

            $token = bin2hex(random_bytes(32));

            return response()->json([
                'success' => true,
                'message' => 'Account created successfully in database!',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'token' => $token,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database Registration Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        try {
            $email = strtolower(trim($request->email));
            $user = User::where('email', $email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'No registered account found with this email. Please create an account first.'
                ], 401);
            }

            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Incorrect password. Please verify your credentials and try again.'
                ], 401);
            }

            $token = bin2hex(random_bytes(32));

            return response()->json([
                'success' => true,
                'message' => 'Login successful! Verified against database.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'Farmer',
                ],
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }

    public function allUsers()
    {
        $users = User::orderBy('created_at', 'desc')->get(['id', 'name', 'email', 'role', 'email_verified_at', 'created_at']);
        return response()->json([
            'count' => $users->count(),
            'users' => $users
        ]);
    }
}
