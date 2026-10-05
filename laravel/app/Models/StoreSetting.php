<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'is_dine_in_enabled',
        'dine_in_fee_type',
        'dine_in_fee_value',
        'is_takeaway_enabled',
        'takeaway_fee_type',
        'takeaway_fee_value',
    ];

    protected $casts = [
        'is_dine_in_enabled'  => 'boolean',
        'is_takeaway_enabled' => 'boolean',
        'dine_in_fee_value'   => 'decimal:2',
        'takeaway_fee_value'  => 'decimal:2',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
