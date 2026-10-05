<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $query = Product::where('tenant_id', $tenantId)->with('category');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_available')) {
            $query->where('is_available', filter_var($request->is_available, FILTER_VALIDATE_BOOLEAN));
        }

        $products = $query->orderBy('name')->get();

        return response()->json(['data' => $products]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'         => 'required|string|max:150',
            'category_id'  => 'nullable|exists:categories,id',
            'price'        => 'required|numeric|min:0',
            'cost_price'   => 'required|numeric|min:0',
            'image_url'    => 'nullable|url',
            'description'  => 'nullable|string',
            'is_available' => 'nullable|boolean',
        ]);

        $product = Product::create([
            'tenant_id'    => $request->user()->tenant_id,
            'category_id'  => $request->category_id,
            'name'         => trim($request->name),
            'price'        => $request->price,
            'cost_price'   => $request->cost_price,
            'image_url'    => $request->image_url,
            'description'  => $request->description,
            'is_available' => $request->boolean('is_available', true),
        ]);

        return response()->json([
            'message' => 'Produk menu berhasil dibuat.',
            'data'    => $product->load('category'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $product = Product::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'name'         => 'sometimes|string|max:150',
            'category_id'  => 'nullable|exists:categories,id',
            'price'        => 'sometimes|numeric|min:0',
            'cost_price'   => 'sometimes|numeric|min:0',
            'image_url'    => 'nullable|url',
            'description'  => 'nullable|string',
            'is_available' => 'sometimes|boolean',
        ]);

        $product->update($request->only([
            'name', 'category_id', 'price', 'cost_price', 'image_url', 'description', 'is_available'
        ]));

        return response()->json([
            'message' => 'Produk berhasil diperbarui.',
            'data'    => $product->load('category'),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $product = Product::where('tenant_id', $tenantId)->findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Produk berhasil dihapus.']);
    }
}
