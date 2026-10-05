<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Tenant;
use App\Models\User;
use App\Models\StoreSetting;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * 
     * Sesuai Ketentuan Spesifikasi:
     * - 1 Tenant/Toko ("Restoran Berkah Nusantara") & 1 Cabang Utama.
     * - 1 Akun Owner Default (Email: owner@kasirku.com / Pass: password)
     * - 1 Akun Kasir Default (Email: kasir@kasirku.com / Pass: password)
     * - Konfigurasi Default Pengaturan Toko (Dine-in: ON 0%, Takeaway: ON Rp 2.000).
     * - TIDAK ADA seeder untuk produk, kategori, maupun riwayat transaksi (db murni kosong).
     */
    public function run(): void
    {
        // 1. Tenant / Toko & Cabang Utama
        $tenant = Tenant::create([
            'name'           => 'Restoran Berkah Nusantara',
            'branch'         => 'Cabang Utama',
            'phone'          => '0812-3456-7890',
            'address'        => 'Jl. Malioboro No. 45, Yogyakarta',
            'receipt_footer' => 'Terima kasih atas kunjungan Anda! Selamat menikmati hidangan kami.',
        ]);

        // 2. Akun Owner Default
        User::create([
            'tenant_id' => $tenant->id,
            'name'      => 'Owner Restoran',
            'email'     => 'owner@kasirku.com',
            'password'  => Hash::make('password'),
            'role'      => 'owner',
            'status'    => 'active',
        ]);

        // 3. Akun Kasir Default
        User::create([
            'tenant_id' => $tenant->id,
            'name'      => 'Kasir Syafira',
            'email'     => 'kasir@kasirku.com',
            'password'  => Hash::make('password'),
            'role'      => 'cashier',
            'status'    => 'active',
        ]);

        // 4. Konfigurasi Default Pengaturan Toko
        // Dine-in: ON 0%, Takeaway: ON Rp 2.000
        StoreSetting::create([
            'tenant_id'           => $tenant->id,
            'is_dine_in_enabled'  => true,
            'dine_in_fee_type'    => 'percent', // 'percent' atau 'fixed'
            'dine_in_fee_value'   => 0,         // 0%
            'is_takeaway_enabled' => true,
            'takeaway_fee_type'   => 'flat',    // 'flat' (per nota) atau 'per_item' (per porsi)
            'takeaway_fee_value'  => 2000,      // Rp 2.000
        ]);

        // CATATAN: Kategori, Produk, Shift, dan Transaksi TIDAK di-seed (db produk & transaksi murni kosong)
    }
}
