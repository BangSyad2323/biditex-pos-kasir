<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class CashierController extends Controller
{
    /**
     * List all cashiers (Owner only)
     */
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $cashiers = User::where('tenant_id', $tenantId)
            ->where('role', 'cashier')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name', 'email', 'role', 'status', 'created_at']);

        return response()->json(['data' => $cashiers]);
    }

    /**
     * Store new cashier
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $cashier = User::create([
            'tenant_id' => $request->user()->tenant_id,
            'name'      => $request->name,
            'email'     => strtolower($request->email),
            'password'  => Hash::make($request->password),
            'role'      => 'cashier',
            'status'    => 'active',
        ]);

        return response()->json([
            'message' => 'Akun kasir berhasil didaftarkan.',
            'data'    => $cashier,
        ], 201);
    }

    /**
     * Update cashier details
     */
    public function update(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $cashier = User::where('tenant_id', $tenantId)
            ->where('role', 'cashier')
            ->findOrFail($id);

        $request->validate([
            'name'     => 'sometimes|string|max:100',
            'email'    => 'sometimes|email|unique:users,email,' . $cashier->id,
            'password' => 'nullable|string|min:6',
        ]);

        if ($request->filled('name')) {
            $cashier->name = $request->name;
        }
        if ($request->filled('email')) {
            $cashier->email = strtolower($request->email);
        }
        if ($request->filled('password')) {
            $cashier->password = Hash::make($request->password);
        }

        $cashier->save();

        return response()->json([
            'message' => 'Data kasir berhasil diperbarui.',
            'data'    => $cashier,
        ]);
    }

    /**
     * Toggle status active/inactive
     */
    public function toggleStatus(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $cashier = User::where('tenant_id', $tenantId)
            ->where('role', 'cashier')
            ->findOrFail($id);

        $request->validate([
            'status' => 'required|in:active,inactive',
        ]);

        $cashier->status = $request->status;
        $cashier->save();

        return response()->json([
            'message' => "Status kasir diubah menjadi {$cashier->status}.",
            'data'    => $cashier,
        ]);
    }

    /**
     * Delete cashier account
     */
    public function destroy(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $cashier = User::where('tenant_id', $tenantId)
            ->where('role', 'cashier')
            ->findOrFail($id);

        $cashier->delete();

        return response()->json([
            'message' => 'Akun kasir berhasil dihapus.',
        ]);
    }
}
