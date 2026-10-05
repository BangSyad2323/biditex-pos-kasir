<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CashierController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ShiftController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SettingController;

/*
|--------------------------------------------------------------------------
| API Routes - KasirKu Digital (Laravel 12 + Laravel Sanctum)
|--------------------------------------------------------------------------
| Seluruh endpoint REST API terlindungi oleh Laravel Sanctum tokens,
| dengan role-based authorization (Owner Master Access & Kasir POS).
*/

// ======================= PUBLIC ROUTES =======================
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('api.auth.login');
});

// ================== PROTECTED SANCTUM ROUTES =================
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth context & token revocation
    Route::get('/auth/user', [AuthController::class, 'user'])->name('api.auth.user');
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('api.auth.logout');

    // Kategori Menu (Read by all, CRUD by Owner)
    Route::get('/categories', [CategoryController::class, 'index']);
    
    // Katalog Produk & Menu (Read by all, CRUD by Owner)
    Route::get('/products', [ProductController::class, 'index']);

    // Manajemen Shift Kasir (Buka/Tutup Kasir)
    Route::prefix('shifts')->group(function () {
        Route::get('/active', [ShiftController::class, 'active']);
        Route::post('/open', [ShiftController::class, 'open']);
        Route::post('/close', [ShiftController::class, 'close']);
        Route::get('/history', [ShiftController::class, 'history']);
    });

    // Pemesanan & Transaksi Kasir
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/{id}', [OrderController::class, 'show']);
    });

    // Profile & Pengaturan Toko (Read by cashier & owner)
    Route::get('/settings', [SettingController::class, 'show']);

    // ================= OWNER RESTRICTED ROUTES =================
    Route::middleware('can:owner-access')->group(function () {
        // Kelola Staf Kasir (CRUD)
        Route::apiResource('cashiers', CashierController::class)->except(['show']);
        Route::patch('/cashiers/{id}/status', [CashierController::class, 'toggleStatus']);

        // Kelola Kategori (Create, Update, Delete)
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Kelola Produk & HPP (Create, Update, Delete)
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        // Pengaturan Toko & Layanan
        Route::put('/settings', [SettingController::class, 'update']);

        // Laporan Keuangan, Omzet, & Laba Bersih
        Route::get('/reports/dashboard', [ReportController::class, 'dashboard']);
    });
});
