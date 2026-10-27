<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Shift;
use App\Models\Product;

class OrderController extends Controller
{
    /**
     * List Orders: Kasir only sees active shift & their own orders. Owner sees all or filtered.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Order::where('tenant_id', $user->tenant_id)->with('items');

        // Check active shift for the logged-in user
        $activeShift = Shift::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        if ($user->isCashier()) {
            // Kasir: Terkunci murni ke User ID kasir dan ID Shift aktif
            $query->where('user_id', $user->id);
            if ($activeShift) {
                $query->where('shift_id', $activeShift->id);
            } else {
                $query->whereDate('created_at', Carbon::today());
            }
        } else {
            // Owner / Non-cashier
            if ($request->boolean('active_shift_only')) {
                $query->where('user_id', $user->id);
                if ($activeShift) {
                    $query->where('shift_id', $activeShift->id);
                } else {
                    $query->whereDate('created_at', Carbon::today());
                }
            } else {
                if ($request->filled('shift_id')) {
                    $query->where('shift_id', $request->shift_id);
                }
                if ($request->filled('user_id')) {
                    $query->where('user_id', $request->user_id);
                }
                if ($request->filled('date')) {
                    $query->whereDate('created_at', $request->date);
                }
            }
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['data' => $orders]);
    }

    /**
     * Show single order with items & tenant footer
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::where('tenant_id', $user->tenant_id)
            ->with(['items', 'user:id,name', 'shift:id,started_at'])
            ->findOrFail($id);

        return response()->json([
            'order'    => $order,
            'tenant'   => $user->tenant,
            'settings' => $user->tenant?->setting,
        ]);
    }

    /**
     * Create Order with Dine-In / Takeaway calculation and stock/receipt logic
     */
    public function store(Request $request)
    {
        $request->validate([
            'order_type'     => 'required|in:dine_in,takeaway',
            'customer_name'  => 'nullable|string|max:100',
            'table_number'   => 'nullable|string|max:20',
            'payment_method' => 'required|in:cash,qris',
            'cash_amount'    => 'nullable|numeric|min:0',
            'notes'          => 'nullable|string',
            'items'          => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.notes'      => 'nullable|string',
            'items.*.portion'    => 'nullable|string',
        ]);

        $user = $request->user();
        $tenant = $user->tenant;
        $settings = $tenant->setting;

        // Check active shift
        $activeShift = Shift::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        if (! $activeShift) {
            return response()->json([
                'message' => 'Kasir belum membuka shift. Harap buka shift kasir terlebih dahulu.',
            ], 422);
        }

        return DB::transaction(function () use ($request, $user, $tenant, $settings, $activeShift) {
            $subtotal = 0;
            $totalCostPrice = 0;
            $orderItemsData = [];

            foreach ($request->items as $itemInput) {
                $product = Product::findOrFail($itemInput['product_id']);
                $qty = (int) $itemInput['quantity'];
                $itemSubtotal = $product->price * $qty;
                $itemCostSubtotal = $product->cost_price * $qty;

                $subtotal += $itemSubtotal;
                $totalCostPrice += $itemCostSubtotal;

                $orderItemsData[] = [
                    'product_id'    => $product->id,
                    'name'          => $product->name,
                    'portion'       => $itemInput['portion'] ?? 'Standard',
                    'price'         => $product->price,
                    'cost_price'    => $product->cost_price,
                    'quantity'      => $qty,
                    'subtotal'      => $itemSubtotal,
                    'subtotal_cost' => $itemCostSubtotal,
                    'notes'         => $itemInput['notes'] ?? null,
                ];
            }

            // Fee calculations based on store settings
            $serviceFee = 0;
            $packagingFee = 0;

            if ($request->order_type === 'dine_in' && ($settings->is_dine_in_enabled ?? true)) {
                if ($settings && $settings->dine_in_fee_type === 'percent') {
                    $serviceFee = round(($subtotal * $settings->dine_in_fee_value) / 100);
                } else {
                    $serviceFee = (float) ($settings->dine_in_fee_value ?? 0);
                }
            }

            if ($request->order_type === 'takeaway' && ($settings->is_takeaway_enabled ?? true)) {
                if ($settings && $settings->takeaway_fee_type === 'per_item') {
                    $totalQty = array_sum(array_column($orderItemsData, 'quantity'));
                    $packagingFee = (float) ($settings->takeaway_fee_value ?? 2000) * $totalQty;
                } else {
                    $packagingFee = (float) ($settings->takeaway_fee_value ?? 2000); // flat per nota
                }
            }

            $totalAmount = $subtotal + $serviceFee + $packagingFee;
            $changeAmount = 0;

            if ($request->payment_method === 'cash') {
                $cashAmount = (float) $request->cash_amount;
                if ($cashAmount < $totalAmount) {
                    return response()->json([
                        'message' => 'Uang tunai kurang dari total tagihan.',
                    ], 422);
                }
                $changeAmount = $cashAmount - $totalAmount;
            } else {
                $cashAmount = $totalAmount;
            }

            // Queue and invoice generation
            $today = Carbon::today()->format('Ymd');
            $todayCount = Order::where('tenant_id', $tenant->id)
                ->whereDate('created_at', Carbon::today())
                ->count();
            $queueNumber = $todayCount + 1;
            $invoiceNumber = 'TRX-' . $today . '-' . str_pad($queueNumber, 4, '0', STR_PAD_LEFT);

            $order = Order::create([
                'tenant_id'        => $tenant->id,
                'shift_id'         => $activeShift->id,
                'user_id'          => $user->id,
                'cashier_name'     => $user->name,
                'invoice_number'   => $invoiceNumber,
                'queue_number'     => $queueNumber,
                'order_type'       => $request->order_type,
                'customer_name'    => $request->customer_name ?: 'Pelanggan Walk-In',
                'table_number'     => $request->table_number,
                'subtotal'         => $subtotal,
                'total_cost_price' => $totalCostPrice,
                'service_fee'      => $serviceFee,
                'packaging_fee'    => $packagingFee,
                'total_amount'     => $totalAmount,
                'gross_profit'     => $totalAmount - $totalCostPrice,
                'payment_method'   => $request->payment_method,
                'cash_amount'      => $cashAmount,
                'change_amount'    => $changeAmount,
                'notes'            => $request->notes,
            ]);

            foreach ($orderItemsData as $item) {
                $order->items()->create($item);
            }

            return response()->json([
                'message' => 'Transaksi berhasil diproses.',
                'order'   => $order->load('items'),
            ], 201);
        });
    }
}
