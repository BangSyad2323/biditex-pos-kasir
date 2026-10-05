import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Utensils, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Tag, 
  Sparkles, 
  Check, 
  X, 
  AlertCircle,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';

export default function MenuManagement() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: null, name: '', icon: 'Utensils' });

  // Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    category_id: '',
    price: '',
    cost_price: '',
    description: '',
    image_url: '',
    is_available: true
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products')
      ]);
      setCategories(catRes.data.data || []);
      setProducts(prodRes.data.data || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Gagal mengambil data katalog.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick Seed Sample Menu
  

  // Category Actions
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    try {
      setSaving(true);
      if (categoryForm.id) {
        await api.put(`/categories/${categoryForm.id}`, categoryForm);
        setMessage({ type: 'success', text: 'Kategori berhasil diperbarui.' });
      } else {
        await api.post('/categories', categoryForm);
        setMessage({ type: 'success', text: 'Kategori baru berhasil ditambahkan.' });
      }
      setShowCategoryModal(false);
      setCategoryForm({ id: null, name: '', icon: 'Utensils' });
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menyimpan kategori.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Hapus kategori "${name}"? Kategori yang memiliki produk tidak dapat dihapus.`)) return;
    try {
      await api.delete(`/categories/${id}`);
      setMessage({ type: 'success', text: 'Kategori berhasil dihapus.' });
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menghapus kategori.' });
    }
  };

  // Product Actions
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || productForm.price === '' || productForm.cost_price === '') {
      alert('Nama, harga jual, dan harga modal (HPP) wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: productForm.name,
        category_id: productForm.category_id ? parseInt(productForm.category_id, 10) : null,
        price: parseFloat(productForm.price),
        cost_price: parseFloat(productForm.cost_price),
        description: productForm.description,
        image_url: productForm.image_url,
        is_available: productForm.is_available
      };

      if (productForm.id) {
        await api.put(`/products/${productForm.id}`, payload);
        setMessage({ type: 'success', text: 'Produk menu berhasil diperbarui.' });
      } else {
        await api.post('/products', payload);
        setMessage({ type: 'success', text: 'Produk menu baru berhasil ditambahkan.' });
      }
      setShowProductModal(false);
      setProductForm({
        id: null,
        name: '',
        category_id: '',
        price: '',
        cost_price: '',
        description: '',
        image_url: '',
        is_available: true
      });
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menyimpan produk.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Hapus produk menu "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      setMessage({ type: 'success', text: 'Produk menu berhasil dihapus.' });
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal menghapus produk.' });
    }
  };

  const openEditProduct = (prod) => {
    setProductForm({
      id: prod.id,
      name: prod.name,
      category_id: prod.category_id || '',
      price: prod.price,
      cost_price: prod.cost_price,
      description: prod.description || '',
      image_url: prod.image_url || '',
      is_available: prod.is_available
    });
    setShowProductModal(true);
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'all' || p.category_id === parseInt(selectedCategory, 10);
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Alert banner */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm ${
          message.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="cursor-pointer text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header bar & quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Kelola Menu & Katalog Restoran
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur kategori, harga jual konsumen, serta Harga Pokok Penjualan (HPP) untuk kalkulasi laba bersih.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
        

          <button
            onClick={() => {
              setCategoryForm({ id: null, name: '', icon: 'Utensils' });
              setShowCategoryModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <span>+ Kategori</span>
          </button>

          <button
            onClick={() => {
              setProductForm({
                id: null,
                name: '',
                category_id: categories.length > 0 ? categories[0].id : '',
                price: '',
                cost_price: '',
                description: '',
                image_url: '',
                is_available: true
              });
              setShowProductModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Menu Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama menu atau deskripsi hidangan..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Semua ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id.toString())}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id.toString()
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{cat.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(cat.id, cat.name);
                }}
                className="opacity-40 hover:opacity-100 hover:text-rose-500 ml-1"
                title="Hapus Kategori"
              >
                ×
              </button>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Memuat katalog hidangan...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
          <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Katalog Menu Masih Kosong</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Sesuai cetak biru seeder, database produk murni kosong tanpa data dummy. Silakan tambahkan menu secara manual atau gunakan tombol sampel cepat.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowProductModal(true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              + Tambah Manual
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((prod) => {
            const margin = prod.price - prod.cost_price;
            const marginPct = prod.price > 0 ? Math.round((margin / prod.price) * 100) : 0;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:border-amber-300 transition-all group"
              >
                {/* Product Image & Badge */}
                <div className="h-40 bg-slate-100 relative overflow-hidden">
                  {prod.image_url ? (
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon className="w-8 h-8 mb-1" />
                      <span className="text-[11px]">Tanpa Foto</span>
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-slate-700 shadow-xs">
                      {prod.category_name}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-xs ${
                      prod.is_available
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}>
                      {prod.is_available ? 'Tersedia' : 'Habis'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm tracking-tight mb-1">
                      {prod.name}
                    </h4>
                    {prod.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                        {prod.description}
                      </p>
                    )}
                  </div>

                  {/* Financial Metrics */}
                  <div className="pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Harga Jual:</span>
                      <span className="font-bold text-slate-900">
                        Rp {Number(prod.price).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Harga Modal (HPP):</span>
                      <span className="font-medium text-slate-600">
                        Rp {Number(prod.cost_price).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-dashed border-slate-100">
                      <span className="text-emerald-700 font-medium">Laba Bersih / Porsi:</span>
                      <span className="font-bold text-emerald-600">
                        +Rp {Number(margin).toLocaleString('id-ID')} ({marginPct}%)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditProduct(prod)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Menu"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Menu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Tambah Kategori Menu</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Makanan Utama, Minuman, Camilan"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {productForm.id ? 'Edit Menu Hidangan' : 'Tambah Menu Hidangan Baru'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Menu / Hidangan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Nasi Goreng Spesial Nusantara"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kategori Menu</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Pilih Kategori...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status Ketersediaan</label>
                  <select
                    value={productForm.is_available ? 'true' : 'false'}
                    onChange={(e) => setProductForm({ ...productForm, is_available: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="true">Tersedia (Siap Jual)</option>
                    <option value="false">Habis / Kosong</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Harga Jual Konsumen (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="25000"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Harga Modal / HPP (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="12000"
                    value={productForm.cost_price}
                    onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {productForm.price && productForm.cost_price && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <span>Estimasi Laba Bersih per Porsi:</span>
                  <span className="font-bold">
                    +Rp {(parseFloat(productForm.price || 0) - parseFloat(productForm.cost_price || 0)).toLocaleString('id-ID')}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">URL Foto Menu (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Deskripsi Menu (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Bahan rempah pilihan disajikan dengan lalapan segar..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
