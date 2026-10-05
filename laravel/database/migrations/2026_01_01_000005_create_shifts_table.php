<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('user_name', 100);
            $table->decimal('starting_cash', 14, 2); // Modal awal laci kasir
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->decimal('expected_ending_cash', 14, 2)->nullable(); // Modal awal + total penjualan tunai
            $table->decimal('actual_ending_cash', 14, 2)->nullable();   // Uang fisik yang dihitung kasir saat closing
            $table->decimal('difference', 14, 2)->nullable();           // actual - expected
            $table->enum('difference_status', ['balanced', 'surplus', 'shortage'])->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shifts');
    }
};
