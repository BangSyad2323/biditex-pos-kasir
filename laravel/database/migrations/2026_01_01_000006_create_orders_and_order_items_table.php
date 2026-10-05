<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('shift_id')->constrained('shifts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('cashier_name', 100);
            $table->string('invoice_number', 50)->unique();
            $table->integer('queue_number');
            $table->enum('order_type', ['dine_in', 'takeaway']);
            $table->string('customer_name', 100)->default('Pelanggan Walk-In');
            $table->string('table_number', 20)->nullable();
            
            // Finansial
            $table->decimal('subtotal', 14, 2);
            $table->decimal('total_cost_price', 14, 2); // Total HPP
            $table->decimal('service_fee', 14, 2)->default(0.00);
            $table->decimal('packaging_fee', 14, 2)->default(0.00);
            $table->decimal('total_amount', 14, 2);
            $table->decimal('gross_profit', 14, 2); // total_amount - total_cost_price
            
            // Pembayaran
            $table->enum('payment_method', ['cash', 'qris', 'debit']);
            $table->decimal('cash_amount', 14, 2)->default(0.00); // Uang yang diterima jika tunai
            $table->decimal('change_amount', 14, 2)->default(0.00); // Kembalian jika tunai
            
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null');
            $table->string('name', 150);
            $table->string('portion', 50)->default('Standard');
            $table->decimal('price', 14, 2);
            $table->decimal('cost_price', 14, 2);
            $table->integer('quantity');
            $table->decimal('subtotal', 14, 2);
            $table->decimal('subtotal_cost', 14, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
