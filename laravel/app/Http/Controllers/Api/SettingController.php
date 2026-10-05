<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Get Store Profile & Operational Settings
     */
    public function show(Request $request)
    {
        $tenant = $request->user()->tenant;
        $setting = $tenant->setting;

        return response()->json([
            'tenant'   => $tenant,
            'settings' => $setting,
        ]);
    }

    /**
     * Update Store Profile & Operational Settings (Owner only)
     */
    public function update(Request $request)
    {
        $request->validate([
            'restaurant_name'     => 'sometimes|string|max:150',
            'branch'              => 'sometimes|string|max:100',
            'phone'               => 'nullable|string|max:30',
            'address'             => 'nullable|string',
            'receipt_footer'      => 'nullable|string',
            'is_dine_in_enabled'  => 'sometimes|boolean',
            'dine_in_fee_type'    => 'sometimes|in:percent,fixed',
            'dine_in_fee_value'   => 'sometimes|numeric|min:0',
            'is_takeaway_enabled' => 'sometimes|boolean',
            'takeaway_fee_type'   => 'sometimes|in:flat,per_item',
            'takeaway_fee_value'  => 'sometimes|numeric|min:0',
        ]);

        $tenant = $request->user()->tenant;
        $setting = $tenant->setting;

        // Update Tenant Profile
        $tenant->update(array_filter([
            'name'           => $request->restaurant_name,
            'branch'         => $request->branch,
            'phone'          => $request->phone,
            'address'        => $request->address,
            'receipt_footer' => $request->receipt_footer,
        ], fn($v) => ! is_null($v)));

        // Update Operational Settings
        $setting->update(array_filter([
            'is_dine_in_enabled'  => $request->is_dine_in_enabled,
            'dine_in_fee_type'    => $request->dine_in_fee_type,
            'dine_in_fee_value'   => $request->dine_in_fee_value,
            'is_takeaway_enabled' => $request->is_takeaway_enabled,
            'takeaway_fee_type'   => $request->takeaway_fee_type,
            'takeaway_fee_value'  => $request->takeaway_fee_value,
        ], fn($v) => ! is_null($v)));

        return response()->json([
            'message'  => 'Pengaturan toko berhasil diperbarui.',
            'tenant'   => $tenant->fresh(),
            'settings' => $setting->fresh(),
        ]);
    }
}
