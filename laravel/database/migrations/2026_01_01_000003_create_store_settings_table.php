<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            
            // Pengaturan Dine-In
            $table->boolean('is_dine_in_enabled')->default(true);
            $table->enum('dine_in_fee_type', ['percent', 'fixed'])->default('percent');
            $table->decimal('dine_in_fee_value', 12, 2)->default(0.00); // Persentase (%) atau Rupiah (Rp)
            
            // Pengaturan Takeaway
            $table->boolean('is_takeaway_enabled')->default(true);
            $table->enum('takeaway_fee_type', ['flat', 'per_item'])->default('flat'); // flat per nota atau per porsi
            $table->decimal('takeaway_fee_value', 12, 2)->default(2000.00); // Biaya kemasan (default Rp 2.000)

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};
