<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Tenant;
use App\Models\User;
use App\Models\StoreSetting;
use App\Models\Category;
use App\Models\Product;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
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
        StoreSetting::create([
            'tenant_id'                      => $tenant->id,
            'is_dine_in_enabled'             => true,
            'dine_in_fee_type'               => 'percent',
            'dine_in_fee_value'              => 0,
            'is_takeaway_enabled'            => false,
            'takeaway_fee_type'              => 'flat',
            'takeaway_fee_value'             => 2000,
            'is_online_integration_enabled'  => false,
            'online_channels'                => [
                ['key' => 'shopeefood', 'label' => 'ShopeeFood', 'is_active' => true],
                ['key' => 'gofood',     'label' => 'GoFood',     'is_active' => true],
                ['key' => 'grabfood',   'label' => 'GrabFood',   'is_active' => true],
                ['key' => 'maxim',      'label' => 'Maxim Foods', 'is_active' => false],
            ],
        ]);

        // 5. Seeder Kategori Menu Default
        $catMakanan = Category::create([
            'tenant_id' => $tenant->id,
            'name'      => 'Makanan',
            'icon'      => 'Utensils',
        ]);

        $catMinuman = Category::create([
            'tenant_id' => $tenant->id,
            'name'      => 'Minuman',
            'icon'      => 'Coffee',
        ]);

        // 6. Seeder Produk Menu Default (2 Produk + Foto)
        Product::create([
            'tenant_id'    => $tenant->id,
            'category_id'  => $catMakanan->id,
            'name'         => 'Nasi Goreng Spesial',
            'description'  => 'Nasi goreng dengan bumbu rempah khas, telur mata sapi, dan suwiran ayam.',
            'price'        => 25000.00, // Harga Jual
            'cost_price'   => 15000.00, // HPP / Modal
            'image_url'    => 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
            'is_available' => true,
        ]);

        Product::create([
            'tenant_id'    => $tenant->id,
            'category_id'  => $catMinuman->id,
            'name'         => 'Es Teh Manis Jumbo',
            'description'  => 'Es teh segar dipadu manisnya gula asli porsi jumbo.',
            'price'        => 6000.00,  // Harga Jual
            'cost_price'   => 2000.00,  // HPP / Modal
            'image_url'    => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
            'is_available' => true,
        ]);
    }
}