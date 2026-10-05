<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\Shift;

class AuthController extends Controller
{
    /**
     * Single Login Entry Point for Owner and Cashier.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial email atau password tidak sesuai.'],
            ]);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Akun dinonaktifkan oleh Owner. Silakan hubungi manajemen.',
            ], 403);
        }

        // Revoke older tokens for clean session (optional)
        $user->tokens()->delete();

        // Create Sanctum Token with role ability
        $token = $user->createToken('kasirku_token', [$user->role])->plainTextToken;

        // Check active cashier shift
        $activeShift = Shift::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        return response()->json([
            'message'      => 'Login berhasil',
            'token'        => $token,
            'user'         => [
                'id'     => $user->id,
                'name'   => $user->name,
                'email'  => $user->email,
                'role'   => $user->role,
                'status' => $user->status,
            ],
            'tenant'       => $user->tenant,
            'settings'     => $user->tenant?->setting,
            'active_shift' => $activeShift,
        ]);
    }

    /**
     * Get Current Authenticated User & Context
     */
    public function user(Request $request)
    {
        $user = $request->user();
        $activeShift = Shift::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        return response()->json([
            'user'         => $user,
            'tenant'       => $user->tenant,
            'settings'     => $user->tenant?->setting,
            'active_shift' => $activeShift,
        ]);
    }

    /**
     * Logout & Revoke Sanctum Token
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil. Token Sanctum dicabut.',
        ]);
    }
}
