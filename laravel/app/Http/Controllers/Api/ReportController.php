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

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Query Base
        $baseQuery = Order::where('tenant_id', $tenantId);

        // Apply date filtering if provided and not 'all'
        if ($startDate && $startDate !== 'all') {
            $baseQuery->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate && $endDate !== 'all') {
            $baseQuery->whereDate('created_at', '<=', $endDate);
        }

        $orders = (clone $baseQuery)->get();

        $totalRevenue = (float) $orders->sum('total_amount');
        $totalHpp = (float) $orders->sum('total_cost_price');
        $netProfit = $totalRevenue - $totalHpp;
        $totalOrders = $orders->count();

        // Top Selling Products in Date Range
        $topProductsQuery = OrderItem::whereHas('order', function ($q) use ($tenantId, $startDate, $endDate) {
                $q->where('tenant_id', $tenantId);
                if ($startDate && $startDate !== 'all') {
                    $q->whereDate('created_at', '>=', $startDate);
                }
                if ($endDate && $endDate !== 'all') {
                    $q->whereDate('created_at', '<=', $endDate);
                }
            });

        $topProducts = $topProductsQuery
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

        // Payment breakdown in Date Range
        $cashTotal = (float) (clone $baseQuery)->where('payment_method', 'cash')->sum('total_amount');
        $qrisTotal = (float) (clone $baseQuery)->where('payment_method', 'qris')->sum('total_amount');
        $debitTotal = (float) (clone $baseQuery)->where('payment_method', 'debit')->sum('total_amount');

        // Order type breakdown in Date Range
        $dineInCount = (clone $baseQuery)->where('order_type', 'dine_in')->count();
        $takeawayCount = (clone $baseQuery)->where('order_type', 'takeaway')->count();

        // Paginated orders list
        $perPage = (int) $request->input('per_page', 10);
        $paginatedOrders = (clone $baseQuery)
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);


        return response()->json([
            'summary' => [
                'total_revenue'       => $totalRevenue,
                'total_hpp'           => $totalHpp,
                'net_profit'          => $netProfit,
                'profit_margin'       => $totalRevenue > 0 ? round(($netProfit / $totalRevenue) * 100) : 0,
                'total_orders'        => $totalOrders,
                'average_order_value' => $totalOrders > 0 ? round($totalRevenue / $totalOrders) : 0,
                'start_date'          => $startDate,
                'end_date'            => $endDate,
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
            'recent_orders'         => $paginatedOrders->items(),
            'pagination'            => [
                'current_page' => $paginatedOrders->currentPage(),
                'last_page'    => $paginatedOrders->lastPage(),
                'per_page'     => $paginatedOrders->perPage(),
                'total'        => $paginatedOrders->total(),
                'from'         => $paginatedOrders->firstItem(),
                'to'           => $paginatedOrders->lastItem(),
            ],
        ]);
    }

}
