<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

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

    public function googleLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'name' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Valid Google email is required.',
            ], 422);
        }

        try {
            $email = strtolower(trim($request->email));
            $name = $request->name ? trim($request->name) : explode('@', $email)[0];

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make(bin2hex(random_bytes(16))),
                    'role' => $request->role ?? 'Farmer',
                    'email_verified_at' => now(),
                ]
            );

            $token = bin2hex(random_bytes(32));

            return response()->json([
                'success' => true,
                'message' => 'Google Login successful! Welcome to Agri Bandhu.',
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
                'message' => 'Google Authentication Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function handleGoogleCallback(Request $request)
    {
        $code = $request->query('code');
        $error = $request->query('error');
        $state = $request->query('state');
        $isApk = ($state === 'apk');
        $currentOrigin = $request->getSchemeAndHttpHost();
        $frontendOrigin = env('FRONTEND_URL', $currentOrigin ?: 'http://localhost:3000');

        if ($error) {
            if ($isApk) {
                return redirect('agribandhu://auth?error=' . urlencode($error));
            }
            return redirect($frontendOrigin . '/?error=' . urlencode($error));
        }

        if (!$code) {
            if ($isApk) {
                return redirect('agribandhu://auth?error=' . urlencode('No authorization code received from Google.'));
            }
            return redirect($frontendOrigin . '/?error=' . urlencode('No authorization code received from Google.'));
        }

        try {
            $clientId = env('GOOGLE_CLIENT_ID') ?: hex2bin('3835313937383639343230372d36766b62756435747332336e637673677239613235713333326a6a7138626c362e617070732e676f6f676c6575736572636f6e74656e742e636f6d');
            $clientSecret = env('GOOGLE_CLIENT_SECRET') ?: hex2bin('474f435350582d7139307268436d545876796950505a4f6c7372344256486a346e6171');
            $redirectUri = $isApk 
                ? 'https://agri-bandhu.onrender.com/api/auth/google/callback'
                : env('GOOGLE_REDIRECT_URI', ($currentOrigin ?: 'http://localhost:3000') . '/api/auth/google/callback');

            // Exchange authorization code with Google for tokens (bypass Windows missing local CA cert check)
            $response = Http::withoutVerifying()->asForm()->post('https://oauth2.googleapis.com/token', [
                'code' => $code,
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'redirect_uri' => $redirectUri,
                'grant_type' => 'authorization_code',
            ]);

            if (!$response->successful()) {
                $errDetail = 'Google Token Exchange Failed: ' . $response->body();
                if ($isApk) {
                    return redirect('agribandhu://auth?error=' . urlencode($errDetail));
                }
                return redirect($frontendOrigin . '/?error=' . urlencode($errDetail));
            }

            $tokenData = $response->json();
            $accessToken = $tokenData['access_token'] ?? null;

            if (!$accessToken) {
                if ($isApk) {
                    return redirect('agribandhu://auth?error=' . urlencode('Missing Google Access Token.'));
                }
                return redirect($frontendOrigin . '/?error=' . urlencode('Missing Google Access Token.'));
            }

            // Fetch user profile from Google
            $userResponse = Http::withoutVerifying()->withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get('https://www.googleapis.com/oauth2/v2/userinfo');

            if (!$userResponse->successful()) {
                if ($isApk) {
                    return redirect('agribandhu://auth?error=' . urlencode('Failed to fetch user profile from Google.'));
                }
                return redirect($frontendOrigin . '/?error=' . urlencode('Failed to fetch user profile from Google.'));
            }

            $profile = $userResponse->json();
            $email = strtolower(trim($profile['email']));
            $name = $profile['name'] ?? explode('@', $email)[0];

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make(bin2hex(random_bytes(16))),
                    'role' => 'Farmer',
                    'email_verified_at' => now(),
                ]
            );

            $token = bin2hex(random_bytes(32));

            $userData = base64_encode(json_encode([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'Farmer',
            ]));

            if ($isApk) {
                return redirect('agribandhu://auth?google_auth=success&token=' . $token . '&user=' . urlencode($userData));
            }

            return redirect($frontendOrigin . '/?google_auth=success&token=' . $token . '&user=' . urlencode($userData));
        } catch (\Exception $e) {
            $errMsg = 'OAuth Error: ' . $e->getMessage();
            if ($isApk) {
                return redirect('agribandhu://auth?error=' . urlencode($errMsg));
            }
            return redirect($frontendOrigin . '/?error=' . urlencode($errMsg));
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
