<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
            'image_url'    => 'nullable|string|max:500',
            'image_file'   => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // Max 2MB
            'description'  => 'nullable|string',
            'is_available' => 'nullable',
        ]);

        $imageUrl = $request->input('image_url');

        // Jika user mengunggah file foto lokal
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('products', 'public');
            $imageUrl = Storage::url($path); // Menghasilkan /storage/products/namafile.jpg
        }

        $product = Product::create([
            'tenant_id'    => $request->user()->tenant_id,
            'category_id'  => $request->category_id ? (int) $request->category_id : null,
            'name'         => trim($request->name),
            'price'        => $request->price,
            'cost_price'   => 0.00,
            'image_url'    => $imageUrl,
            'description'  => $request->description,
            'is_available' => filter_var($request->is_available ?? true, FILTER_VALIDATE_BOOLEAN),
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
            'category_id'  => 'nullable',
            'price'        => 'sometimes|numeric|min:0',
            'image_url'    => 'nullable|string|max:500',
            'image_file'   => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'description'  => 'nullable|string',
            'is_available' => 'sometimes',
        ]);

        $imageUrl = $request->input('image_url', $product->image_url);

        // Jika mengunggah file foto baru
        if ($request->hasFile('image_file')) {
            // Hapus foto lama dari disk jika ada
            if ($product->image_url && str_contains($product->image_url, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $product->image_url);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image_file')->store('products', 'public');
            $imageUrl = Storage::url($path);
        }

        $product->update([
            'name'         => $request->input('name', $product->name),
            'category_id'  => $request->input('category_id') ? (int) $request->input('category_id') : null,
            'price'        => $request->input('price', $product->price),
            'image_url'    => $imageUrl,
            'description'  => $request->input('description', $product->description),
            'is_available' => $request->has('is_available') ? filter_var($request->is_available, FILTER_VALIDATE_BOOLEAN) : $product->is_available,
        ]);

        return response()->json([
            'message' => 'Produk berhasil diperbarui.',
            'data'    => $product->load('category'),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $product = Product::where('tenant_id', $tenantId)->findOrFail($id);

        if ($product->image_url && str_contains($product->image_url, '/storage/')) {
            $oldPath = str_replace('/storage/', '', $product->image_url);
            Storage::disk('public')->delete($oldPath);
        }

        $product->delete();

        return response()->json(['message' => 'Produk berhasil dihapus.']);
    }
}