<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Shift;
use App\Models\Order;

class ShiftController extends Controller
{
    /**
     * Get active shift for current cashier/owner
     */
    public function active(Request $request)
    {
        $user = $request->user();
        $shift = Shift::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        if (! $shift) {
            return response()->json(['active_shift' => null]);
        }

        // Live shift calculations
        $cashSales = Order::where('shift_id', $shift->id)
            ->where('payment_method', 'cash')
            ->sum('total_amount');

        $totalSales = Order::where('shift_id', $shift->id)
            ->sum('total_amount');

        $orderCount = Order::where('shift_id', $shift->id)->count();

        $shift->current_cash_sales = (float) $cashSales;
        $shift->current_total_sales = (float) $totalSales;
        $shift->current_orders_count = $orderCount;
        $shift->expected_cash_in_drawer = (float) ($shift->starting_cash + $cashSales);

        return response()->json(['active_shift' => $shift]);
    }

    /**
     * Open Shift: Input Modal Awal Laci Kasir
     */
    public function open(Request $request)
    {
        $request->validate([
            'starting_cash' => 'required|numeric|min:0',
        ]);

        $user = $request->user();

        // Check if there is already an open shift
        $existing = Shift::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Anda masih memiliki shift aktif yang belum ditutup.',
            ], 422);
        }

        $shift = Shift::create([
            'tenant_id'     => $user->tenant_id,
            'user_id'       => $user->id,
            'user_name'     => $user->name,
            'starting_cash' => $request->starting_cash,
            'started_at'    => Carbon::now(),
            'status'        => 'open',
        ]);

        return response()->json([
            'message' => 'Shift kasir berhasil dibuka. Selamat bertugas!',
            'shift'   => $shift,
        ], 201);
    }

    /**
     * Close Shift: Input uang fisik laci di akhir shift + Rekap selisih
     */
    public function close(Request $request)
    {
        $request->validate([
            'actual_ending_cash' => 'required|numeric|min:0',
            'notes'              => 'nullable|string',
        ]);

        $user = $request->user();
        $shift = Shift::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        if (! $shift) {
            return response()->json([
                'message' => 'Tidak ditemukan shift aktif untuk kasir ini.',
            ], 404);
        }

        $cashSales = Order::where('shift_id', $shift->id)
            ->where('payment_method', 'cash')
            ->sum('total_amount');

        $startingCash = (float) $shift->starting_cash;
        $expectedEnding = $startingCash + (float) $cashSales;
        $actualEnding = (float) $request->actual_ending_cash;
        $difference = $actualEnding - $expectedEnding;

        $differenceStatus = 'balanced';
        if ($difference > 0) $differenceStatus = 'surplus';
        if ($difference < 0) $differenceStatus = 'shortage';

        $shift->update([
            'ended_at'             => Carbon::now(),
            'expected_ending_cash' => $expectedEnding,
            'actual_ending_cash'   => $actualEnding,
            'difference'           => $difference,
            'difference_status'    => $differenceStatus,
            'notes'                => $request->notes,
            'status'               => 'closed',
        ]);

        return response()->json([
            'message' => 'Shift kasir berhasil ditutup.',
            'recap'   => [
                'shift_id'             => $shift->id,
                'cashier_name'         => $shift->user_name,
                'started_at'           => $shift->started_at,
                'ended_at'             => $shift->ended_at,
                'starting_cash'        => $startingCash,
                'cash_sales'           => (float) $cashSales,
                'expected_ending_cash' => $expectedEnding,
                'actual_ending_cash'   => $actualEnding,
                'difference'           => $difference,
                'difference_status'    => $differenceStatus,
                'notes'                => $shift->notes,
            ],
        ]);
    }

    /**
     * History Shifts (Kasir sees own, Owner sees all)
     */
    public function history(Request $request)
    {
        $user = $request->user();
        $query = Shift::where('tenant_id', $user->tenant_id);

        if (! $user->isOwner()) {
            $query->where('user_id', $user->id);
        }

        $shifts = $query->orderBy('started_at', 'desc')->paginate(20);

        return response()->json($shifts);
    }
}
