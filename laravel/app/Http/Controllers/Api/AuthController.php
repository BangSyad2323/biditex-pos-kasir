<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\Shift;
use App\Models\Order;

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

        // Check active cashier shift with live calculations
        $activeShift = Shift::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        if ($activeShift) {
            $cashSales  = (float) Order::where('shift_id', $activeShift->id)->where('payment_method', 'cash')->sum('total_amount');
            $qrisSales  = (float) Order::where('shift_id', $activeShift->id)->where('payment_method', 'qris')->sum('total_amount');
            $totalSales = (float) Order::where('shift_id', $activeShift->id)->sum('total_amount');
            $orderCount = (int)   Order::where('shift_id', $activeShift->id)->count();

            $activeShift->current_cash_sales      = $cashSales;
            $activeShift->current_qris_sales      = $qrisSales;
            $activeShift->current_total_sales     = $totalSales;
            $activeShift->current_orders_count    = $orderCount;
            $activeShift->expected_cash_in_drawer = (float) $activeShift->starting_cash + $cashSales;
        }

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
        $user        = $request->user();
        $activeShift = Shift::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        if ($activeShift) {
            $cashSales  = (float) Order::where('shift_id', $activeShift->id)->where('payment_method', 'cash')->sum('total_amount');
            $qrisSales  = (float) Order::where('shift_id', $activeShift->id)->where('payment_method', 'qris')->sum('total_amount');
            $totalSales = (float) Order::where('shift_id', $activeShift->id)->sum('total_amount');
            $orderCount = (int)   Order::where('shift_id', $activeShift->id)->count();

            $activeShift->current_cash_sales      = $cashSales;
            $activeShift->current_qris_sales      = $qrisSales;
            $activeShift->current_total_sales     = $totalSales;
            $activeShift->current_orders_count    = $orderCount;
            $activeShift->expected_cash_in_drawer = (float) $activeShift->starting_cash + $cashSales;
        }

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
