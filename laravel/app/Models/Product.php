<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'category_id',
        'name',
        'description',
        'price',
        'cost_price',
        'image_url',
        'is_available',
    ];

    protected $casts = [
        'price'        => 'decimal:2',
        'cost_price'   => 'decimal:2',
        'is_available' => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Profit margin per item
     */
    public function getMarginAttribute(): float
    {
        return (float) ($this->price - $this->cost_price);
    }
}
