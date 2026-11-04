<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'shift_id',
        'user_id',
        'cashier_name',
        'invoice_number',
        'queue_number',
        'order_type',
        'online_channel',
        'online_order_id',
        'customer_name',
        'table_number',
        'subtotal',
        'total_cost_price',
        'service_fee',
        'packaging_fee',
        'total_amount',
        'gross_profit',
        'payment_method',
        'cash_amount',
        'change_amount',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'total_cost_price' => 'decimal:2',
        'service_fee' => 'decimal:2',
        'packaging_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'gross_profit' => 'decimal:2',
        'cash_amount' => 'decimal:2',
        'change_amount' => 'decimal:2',
    ];

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}