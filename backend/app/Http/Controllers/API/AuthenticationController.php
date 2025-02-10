<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\Authentication\StoreLoginRequest;
use App\Http\Requests\Authentication\StoreActivationCodeRequest;
use App\Http\Requests\Authentication\StoreRegisterRequest;

class AuthenticationController extends Controller
{
    public function register(StoreRegisterRequest $request)
    {
        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'activation_code' => Str::random(6),
                'is_active' => false
            ]);
    
            return response()->json([
                'success' => true,
                'message' => 'Registration successful. Please check your email for the activation code.',
                'activation_code' => $user->activation_code 
            ], 201);
    
        } catch (\Exception $e) {
            Log::error('Error during registration: ' . $e->getMessage());
    
            return response()->json([
                'success' => false,
                'message' => 'Registration failed. Please try again later.',
                'error' => $e->getMessage() 
            ], 500);
        }
    }   

    public function activate(StoreActivationCodeRequest $request)
    {
        $user = User::where('email', $request->email)
            ->where('activation_code', $request->activation_code)
            ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid activation code'
            ], 400);
        }

        if ($user->is_active) {
            return response()->json([
                'message' => 'Account is already activated'
            ], 400);
        }

        $user->is_active = true;
        $user->save();

        return response()->json([
            'message' => 'Account activated successfully',
            'user' => $user
        ], 200);
    }
    
    public function login(StoreLoginRequest $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            if (!$user->is_active) {
                Auth::logout();
                return response()->json([
                    'message' => 'Account not activated. Please activate your account.'
                ], 403);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
            ], 200);
        }

        return response()->json([
            'message' => 'Invalid login credentials'
        ], 400);
    }

    public function logout()
    {
        if (Auth::check()) {
            Auth::user()->currentAccessToken()->delete();
            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out'
            ]);
        }

        return response()->json([
            'success' =>false,
            'message' => 'No active session'
        ], 401);
    }
}
