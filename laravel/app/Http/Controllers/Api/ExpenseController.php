<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Expense;
use App\Models\Shift;

class ExpenseController extends Controller
{
    /**
     * Ambil daftar pengeluaran per tenant
     */
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        
        $expenses = Expense::where('tenant_id', $tenantId)
            ->with(['user' => function($query) {
                $query->select('id', 'name'); // Select aman untuk nama user
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($expenses);
    }

    /**
     * Simpan pengeluaran baru (Kas Keluar)
     */
    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'category' => 'required|string|max:50',
            'description' => 'nullable|string',
        ]);

        $user = $request->user();

        // Cari shift aktif user jika ada (untuk pencatatan laci kasir)
        $activeShift = Shift::where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        $expense = Expense::create([
            'tenant_id' => $user->tenant_id,
            'shift_id' => $activeShift ? $activeShift->id : null,
            'user_id' => $user->id,
            'amount' => $request->amount,
            'category' => $request->category,
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'Pengeluaran berhasil dicatat',
            'data' => $expense
        ], 201);
    }

    /**
     * Hapus data pengeluaran (Khusus Owner)
     */
    public function destroy(Request $request, $id)
    {
        // Pengecekan keamanan: Hanya owner yang boleh menghapus riwayat pengeluaran
        if ($request->user()->role !== 'owner') {
            return response()->json(['message' => 'Anda tidak memiliki akses untuk menghapus pengeluaran.'], 403);
        }

        $expense = Expense::where('tenant_id', $request->user()->tenant_id)
            ->findOrFail($id);

        $expense->delete();

        return response()->json(['message' => 'Data pengeluaran berhasil dihapus']);
    }
}