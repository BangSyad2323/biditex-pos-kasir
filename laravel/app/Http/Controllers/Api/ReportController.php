<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderItem;

class ReportController extends Controller
{
    /**
     * Dashboard financial analytics & net profit report (Owner only)
     */
    public function dashboard(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $orders = Order::where('tenant_id', $tenantId)->get();

        $totalRevenue = (float) $orders->sum('total_amount');
        $totalHpp = (float) $orders->sum('total_cost_price');
        $netProfit = $totalRevenue - $totalHpp;
        $totalOrders = $orders->count();

        // Top Selling Products
        $topProducts = OrderItem::whereHas('order', function ($q) use ($tenantId) {
                $q->where('tenant_id', $tenantId);
            })
            ->select(
                'name',
                DB::raw('SUM(quantity) as quantity'),
                DB::raw('SUM(subtotal) as revenue'),
                DB::raw('SUM(subtotal - subtotal_cost) as profit')
            )
            ->groupBy('name')
            ->orderByDesc('quantity')
            ->limit(5)
            ->get();

        // Payment breakdown
        $cashTotal = (float) Order::where('tenant_id', $tenantId)->where('payment_method', 'cash')->sum('total_amount');
        $qrisTotal = (float) Order::where('tenant_id', $tenantId)->where('payment_method', 'qris')->sum('total_amount');
        $debitTotal = (float) Order::where('tenant_id', $tenantId)->where('payment_method', 'debit')->sum('total_amount');

        // Order type breakdown
        $dineInCount = Order::where('tenant_id', $tenantId)->where('order_type', 'dine_in')->count();
        $takeawayCount = Order::where('tenant_id', $tenantId)->where('order_type', 'takeaway')->count();

        // Recent orders
        $recentOrders = Order::where('tenant_id', $tenantId)
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'summary' => [
                'total_revenue'       => $totalRevenue,
                'total_hpp'           => $totalHpp,
                'net_profit'          => $netProfit,
                'profit_margin'       => $totalRevenue > 0 ? round(($netProfit / $totalRevenue) * 100) : 0,
                'total_orders'        => $totalOrders,
                'average_order_value' => $totalOrders > 0 ? round($totalRevenue / $totalOrders) : 0,
            ],
            'top_products'          => $topProducts,
            'payment_breakdown'     => [
                'cash'  => $cashTotal,
                'qris'  => $qrisTotal,
                'debit' => $debitTotal,
            ],
            'order_type_breakdown'  => [
                'dine_in'  => $dineInCount,
                'takeaway' => $takeawayCount,
            ],
            'recent_orders'         => $recentOrders,
        ]);
    }
}
