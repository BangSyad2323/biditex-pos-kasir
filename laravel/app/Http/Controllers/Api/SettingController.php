<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function show(Request $request)
    {
        $tenant = $request->user()->tenant;
        $setting = $tenant->setting;

        return response()->json([
            'tenant' => $tenant,
            'settings' => $setting,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'restaurant_name' => 'sometimes|string|max:150',
            'branch' => 'sometimes|string|max:100',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string',
            'receipt_footer' => 'nullable|string',
            'is_dine_in_enabled' => 'sometimes|boolean',
            'dine_in_fee_type' => 'sometimes|in:percent,fixed',
            'dine_in_fee_value' => 'sometimes|numeric|min:0',
            'is_takeaway_enabled' => 'sometimes|boolean',
            'takeaway_fee_type' => 'sometimes|in:flat,per_item',
            'takeaway_fee_value' => 'sometimes|numeric|min:0',
            'is_online_integration_enabled' => 'sometimes|boolean',
            'online_channels' => 'nullable|array',
        ]);

        $tenant = $request->user()->tenant;
        $setting = $tenant->setting;

        // Update Profil Tenant
        $tenant->update([
            'name' => $request->input('restaurant_name', $tenant->name),
            'branch' => $request->input('branch', $tenant->branch),
            'phone' => $request->input('phone', $tenant->phone),
            'address' => $request->input('address', $tenant->address),
            'receipt_footer' => $request->input('receipt_footer', $tenant->receipt_footer),
        ]);

        // Update Pengaturan Operasional (Gunakan fill() + save() agar perubahan boolean & json selalu tersimpan)
        $setting->is_dine_in_enabled = $request->boolean('is_dine_in_enabled');
        $setting->dine_in_fee_type = $request->input('dine_in_fee_type', $setting->dine_in_fee_type);
        $setting->dine_in_fee_value = $request->input('dine_in_fee_value', $setting->dine_in_fee_value);

        $setting->is_takeaway_enabled = $request->boolean('is_takeaway_enabled');
        $setting->takeaway_fee_type = $request->input('takeaway_fee_type', $setting->takeaway_fee_type);
        $setting->takeaway_fee_value = $request->input('takeaway_fee_value', $setting->takeaway_fee_value);

        $setting->is_online_integration_enabled = $request->boolean('is_online_integration_enabled');
        
        if ($request->has('online_channels')) {
            $setting->online_channels = $request->input('online_channels');
        }

        $setting->save();

        return response()->json([
            'message' => 'Pengaturan toko berhasil diperbarui.',
            'tenant' => $tenant->fresh(),
            'settings' => $setting->fresh(),
        ]);
    }
}