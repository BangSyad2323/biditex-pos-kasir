<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Expense;

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

        // Query Base Order
        $baseQuery = Order::where('tenant_id', $tenantId);

        // Query Base Expense (Pengeluaran)
        $expenseQuery = Expense::where('tenant_id', $tenantId);

        // Apply date filtering
        if ($startDate && $startDate !== 'all') {
            $baseQuery->whereDate('created_at', '>=', $startDate);
            $expenseQuery->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate && $endDate !== 'all') {
            $baseQuery->whereDate('created_at', '<=', $endDate);
            $expenseQuery->whereDate('created_at', '<=', $endDate);
        }

        $orders = (clone $baseQuery)->get();

        // 1. Omzet Penjualan Riil (Memperhitungkan Override Total Tagihan Online)
        $salesRevenue = (float) $orders->sum('subtotal');
        $serviceCharges = (float) $orders->sum('service_fee') + (float) $orders->sum('packaging_fee');
        
        // Total Gross Income riil dari seluruh tagihan (termasuk penyesuaian harga online)
        $totalGrossIncome = (float) $orders->sum('total_amount');

        // Total Pengeluaran (Kas Keluar + Komisi Platform yang diinput manual)
        $totalExpenses = (float) (clone $expenseQuery)->sum('amount');

        // Laba Bersih = Total Pemasukan Riil - Total Pengeluaran
        $netProfit = $totalGrossIncome - $totalExpenses;
        $totalOrders = $orders->count();

        // Top Selling Products
        $topProductsQuery = OrderItem::whereHas('order', function ($q) use ($tenantId, $startDate, $endDate) {
            $q->where('tenant_id', $tenantId);
            if ($startDate && $startDate !== 'all') {
                $q->whereDate('created_at', '>=', $startDate);
            }
            if ($endDate && $endDate !== 'all') {
                $q->whereDate('created_at', '<=', $endDate);
            }
        });

        $topProducts = $topProductsQuery->select('name', DB::raw('SUM(quantity) as quantity'), DB::raw('SUM(subtotal) as revenue'))
            ->groupBy('name')
            ->orderByDesc('quantity')
            ->limit(5)
            ->get();

        // 2. Breakdown Metode Pembayaran (Cash, QRIS, & Online Platform)
        $cashTotal = (float) (clone $baseQuery)->where('payment_method', 'cash')->sum('total_amount');
        $qrisTotal = (float) (clone $baseQuery)->where('payment_method', 'qris')->sum('total_amount');
        $onlineTotal = (float) (clone $baseQuery)->whereIn('payment_method', ['online_platform'])->orWhere('order_type', 'online')->sum('total_amount');

        // 3. Breakdown Distribusi Pesanan (Dine-In, Takeaway, Online)
        $dineInCount = (clone $baseQuery)->where('order_type', 'dine_in')->count();
        $takeawayCount = (clone $baseQuery)->where('order_type', 'takeaway')->count();
        $onlineCount = (clone $baseQuery)->where('order_type', 'online')->count();

        // Paginated orders list
        $perPage = (int) $request->input('per_page', 10);
        $paginatedOrders = (clone $baseQuery)->with('items')->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'summary' => [
                'sales_revenue' => $salesRevenue,
                'service_charges' => $serviceCharges,
                'total_gross_income' => $totalGrossIncome,
                'total_expenses' => $totalExpenses,
                'net_profit' => $netProfit,
                'profit_margin' => $totalGrossIncome > 0 ? round(($netProfit / $totalGrossIncome) * 100) : 0,
                'total_orders' => $totalOrders,
                'average_order_value' => $totalOrders > 0 ? round($totalGrossIncome / $totalOrders) : 0,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'top_products' => $topProducts,
            'payment_breakdown' => [
                'cash' => $cashTotal,
                'qris' => $qrisTotal,
                'online' => $onlineTotal,
            ],
            'order_type_breakdown' => [
                'dine_in' => $dineInCount,
                'takeaway' => $takeawayCount,
                'online' => $onlineCount,
            ],
            'recent_orders' => $paginatedOrders->items(),
            'pagination' => [
                'current_page' => $paginatedOrders->currentPage(),
                'last_page' => $paginatedOrders->lastPage(),
                'per_page' => $paginatedOrders->perPage(),
                'total' => $paginatedOrders->total(),
                'from' => $paginatedOrders->firstItem(),
                'to' => $paginatedOrders->lastItem(),
            ],
        ]);
    }

    public function salesChart(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $period = $request->input('period', 'daily');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = Order::where('tenant_id', $tenantId);

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        switch ($period) {
            case 'monthly':
                $groupExpr = "DATE_FORMAT(created_at, '%Y-%m')";
                break;
            case 'yearly':
                $groupExpr = "YEAR(created_at)";
                break;
            case 'custom':
            case 'daily':
            default:
                $groupExpr = "DATE(created_at)";
                break;
        }

        $data = $query->selectRaw("$groupExpr as label")
            ->selectRaw('SUM(total_amount) as total')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('label')
            ->orderBy('label', 'ASC')
            ->get()
            ->map(function ($item) {
                return [
                    'label' => $item->label,
                    'total' => (float) $item->total,
                    'count' => (int) $item->count,
                ];
            })
            ->toArray();

        return response()->json(['data' => $data]);
    }
}