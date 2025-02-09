<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class AuthenticationController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'activation_code' => Str::random(40), // Generate activation code
        ]);

        // You'd typically send an email here, but for this assessment:
        $request->session()->put('activation_code', $user->activation_code);
        $request->session()->put('user_id', $user->id);

        return response()->json(['message' => 'Registration successful.  Activation code stored in session.', 'userId' => $user->id], 201);
    }

    public function activate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'activation_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }


        $storedActivationCode = $request->session()->get('activation_code');
        $userId = $request->session()->get('user_id');

        if (!$storedActivationCode || !$userId) {
            return response()->json(['message' => 'Invalid activation request.'], 400);
        }


        if ($request->activation_code !== $storedActivationCode) {
            return response()->json(['message' => 'Invalid activation code.'], 400);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }


        $user->is_active = true;
        $user->activation_code = null;
        $user->save();

        $request->session()->forget('activation_code');
        $request->session()->forget('user_id');


        return response()->json(['message' => 'Account activated successfully.'], 200);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            if (!$user->is_active) {
                Auth::logout();
                return response()->json(['message' => 'Account not activated. Please activate your account.'], 403);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
            ], 200);
        }

        return response()->json(['message' => 'Invalid login credentials'], 401);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Successfully logged out'], 200);
    }

    public function profile()
    {
        return response()->json(Auth::user());
    }
}
