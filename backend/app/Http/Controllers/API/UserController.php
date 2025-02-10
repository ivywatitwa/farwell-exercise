<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Http\Controllers\Controller;

use App\Http\Requests\Authentication\StoreChangePasswordRequest;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
   public function show($id)
    {
        $logUser = Auth::user();

        if ($logUser->id != $id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    public function changePassword(StoreChangePasswordRequest $request, User $user)
    {
        try {
            $validated = $request->validated();
    
            Log::info($validated);
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'The current password is incorrect.',
                ], 422);
            }
            $user->update([
                'password' => Hash::make($validated['new_password']),
            ]);
    
            return response()->json([
                'message' => 'Password updated successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating password: ' . $e->getMessage());
    
            return response()->json([
                'message' => 'An unexpected error occurred. Please try again later.',
            ], 500);
        }
    }

    public function update(Request $request)
    {
        $request->merge(['_method' => 'PUT']);
    
        $user = Auth::user();
    
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'profile_picture' => 'nullable|image|max:2048'
        ]);
    
        if ($request->hasFile('profile_picture')) {
            Log::info("File received:", [
                'name' => $request->file('profile_picture')->getClientOriginalName(),
                'type' => $request->file('profile_picture')->getMimeType(),
                'size' => $request->file('profile_picture')->getSize()
            ]);
    
            if ($user->profile_picture) {
                Storage::delete($user->profile_picture);
            }
    
            $path = $request->file('profile_picture')->store('profile-pictures', 'public');
            $validated['profile_picture'] = $path;
        }
    
        $user->update($validated);
    
        return response()->json($user);
    }
}
