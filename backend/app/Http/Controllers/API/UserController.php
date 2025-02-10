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
    public function updateProfile($id)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'profile_picture' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048', 
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->hasFile('profile_picture')) {
            // Delete old profile picture if it exists
            if ($user->profile_picture) {
                Storage::delete('public/' . $user->profile_picture);
            }

            $image = $request->file('profile_picture');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('public/profile_pictures', $imageName); // Store in storage/app/public/profile_pictures

            $user->profile_picture = 'profile_pictures/' . $imageName; // Store relative path in database
        }

        if ($request->filled('name')) {
            $user->name = $request->name;
        }

        $user->save();

        return response()->json(['message' => 'Profile updated successfully', 'user' => $user], 200);
    }

public function show($id)
{
    $user = User::find($id);
    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }
    return response()->json($user);
}

public function changePassword(StoreChangePasswordRequest $request, User $user)
{
    Log::info($request->all());

    // No need to validate again; the request has already been validated
    $validated = $request->validated(); // Retrieves the already validated data

    Log::info($validated);

    // Update the user's password
    $user->update([
        'password' => Hash::make($validated['new_password']),
    ]);

    return response()->json(['message' => 'Password updated successfully']);
}


public function update(Request $request)
{
    Log::info($request->all());

    Log::info('Files in request:', $request->allFiles());
    Log::info('Has file?', [$request->hasFile('profile_picture')]);


    $user = Auth::user();
    Log::info($user);
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email,' . $user->id,
        'profile_picture' => 'nullable|image|max:2048' // 2MB Max
    ]);
    
    if ($request->hasFile('profile_picture')) {
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
