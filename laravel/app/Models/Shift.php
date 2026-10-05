<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shift extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'user_name',
        'starting_cash',
        'started_at',
        'ended_at',
        'expected_ending_cash',
        'actual_ending_cash',
        'difference',
        'difference_status',
        'notes',
        'status',
    ];

    protected $casts = [
        'starting_cash'        => 'decimal:2',
        'expected_ending_cash' => 'decimal:2',
        'actual_ending_cash'   => 'decimal:2',
        'difference'           => 'decimal:2',
        'started_at'           => 'datetime',
        'ended_at'             => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
