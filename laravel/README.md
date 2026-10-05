# KasirKu Digital - Laravel 12 REST API Backend & MariaDB Architecture

## 1. Spesifikasi Teknis Backend
- **Framework**: Laravel 12
- **Database Engine**: MariaDB 10.6+ / 11+
- **Authentication**: Laravel Sanctum (Bearer Token)
- **Architecture**: Multi-Role Multi-Tenant Ready F&B POS System

---

## 2. Struktur Database MariaDB
1. `tenants`: Menyimpan identitas restoran, cabang, alamat, kontak, dan footer struk.
2. `users`: Menyimpan kredensial owner & kasir dengan enkripsi bcrypt/argon2 dan enum status (active/inactive).
3. `store_settings`: Menyimpan konfigurasi toggle Dine-In (fee % / flat) & Takeaway (flat per nota / per item porsi).
4. `categories`: Kategori hidangan makanan, minuman, cemilan.
5. `products`: Katalog menu hidangan, harga jual, dan harga modal (HPP) untuk kalkulasi laba bersih.
6. `shifts`: Rekap shift laci kasir (modal awal, total tunai, fisik closing, dan selisih seimbang/minus/lebih).
7. `orders` & `order_items`: Transaksi penjualan lengkap rincian item, tipe layanan, biaya kemasan/layanan, dan pembayaran.

---

## 3. Langkah Instalasi di Server Laravel
```bash
# 1. Masuk ke direktori laravel & install vendor
composer install

# 2. Konfigurasi .env MariaDB
cp .env.example .env
php artisan key:generate

# Setting koneksi MariaDB di file .env:
# DB_CONNECTION=mariadb
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=kasirku_db
# DB_USERNAME=root
# DB_PASSWORD=your_password

# 3. Jalankan Migrasi & Seeder Minimalis
php artisan migrate --seed

# 4. Jalankan Server API
php artisan serve --port=8000
```

---

## 4. Akun Default Seeder
Sesuai rancangan cetak biru spesifikasi:
- **Tenant**: "Restoran Berkah Nusantara" (Cabang Utama)
- **Akun Owner**: `owner@kasirku.com` / Password: `password`
- **Akun Kasir**: `kasir@kasirku.com` / Password: `password`
- **Pengaturan Toko**: Dine-in ON 0%, Takeaway ON Rp 2.000.
- **Database Produk & Transaksi**: Murni kosong (zero mock data).
