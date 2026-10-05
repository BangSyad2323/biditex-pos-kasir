import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Search, 
  Utensils, 
  Package, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  QrCode, 
  Banknote, 
  History, 
  Printer, 
  ChefHat, 
  Coins, 
  AlertCircle,
  FileText,
  User,
  ShoppingBag,
  CheckCircle2,
  X
} from 'lucide-react';
import ShiftModal from './ShiftModal';
import CustomerReceiptModal from './CustomerReceiptModal';
import KitchenReceiptModal from './KitchenReceiptModal';
import CashierHistoryModal from './CashierHistoryModal';

export default function PosScreen() {
  const { user, tenant, settings, activeShift, setActiveShift, refreshContext, isOwner } = useAuth();

  // Menu data
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Cart state
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('dine_in'); // 'dine_in' | 'takeaway'
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'qris' | 'debit'
  const [cashGiven, setCashGiven] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Completed Order & Receipts
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCustomerReceipt, setShowCustomerReceipt] = useState(false);
  const [showKitchenReceipt, setShowKitchenReceipt] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);

  // Item customization modal (notes & portion)
  const [customizingItem, setCustomizingItem] = useState(null);
  const [customPortion, setCustomPortion] = useState('Standard');
  const [customNotes, setCustomNotes] = useState('');

  // Fetch menu
  const fetchMenu = async () => {
    try {
      setLoadingMenu(true);
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products')
      ]);
      setCategories(catRes.data.data || []);
      setProducts(prodRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMenu(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Ensure default orderType follows settings if one is disabled
  useEffect(() => {
    if (settings) {
      if (!settings.is_dine_in_enabled && settings.is_takeaway_enabled) {
        setOrderType('takeaway');
      } else if (settings.is_dine_in_enabled && !settings.is_takeaway_enabled) {
        setOrderType('dine_in');
      }
    }
  }, [settings]);

  // Cart helpers
  const addToCart = (product) => {
    if (!product.is_available) return;

    // Check if item already in cart with same portion & notes
    setCart((prev) => {
      const existingIdx = prev.findIndex(item => item.product_id === product.id && item.portion === 'Standard' && !item.notes);
      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          cost_price: product.cost_price,
          quantity: 1,
          portion: 'Standard',
          notes: ''
        }
      ];
    });
  };

  const openCustomizeModal = (product) => {
    setCustomizingItem(product);
    setCustomPortion('Standard');
    setCustomNotes('');
  };

  const saveCustomizedItem = () => {
    if (!customizingItem) return;
    setCart((prev) => [
      ...prev,
      {
        product_id: customizingItem.id,
        name: customizingItem.name,
        price: customizingItem.price,
        cost_price: customizingItem.cost_price,
        quantity: 1,
        portion: customPortion,
        notes: customNotes.trim()
      }
    ]);
    setCustomizingItem(null);
  };

  const updateQuantity = (index, delta) => {
    setCart((prev) => {
      const next = [...prev];
      const newQty = next[index].quantity + delta;
      if (newQty <= 0) {
        next.splice(index, 1);
      } else {
        next[index].quantity = newQty;
      }
      return next;
    });
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setTableNumber('');
    setOrderNotes('');
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  let serviceFee = 0;
  if (orderType === 'dine_in' && (settings?.is_dine_in_enabled ?? true)) {
    if (settings?.dine_in_fee_type === 'percent') {
      serviceFee = Math.round((subtotal * (settings?.dine_in_fee_value || 0)) / 100);
    } else {
      serviceFee = settings?.dine_in_fee_value || 0;
    }
  }

  let packagingFee = 0;
  if (orderType === 'takeaway' && (settings?.is_takeaway_enabled ?? true)) {
    if (settings?.takeaway_fee_type === 'per_item') {
      packagingFee = (settings?.takeaway_fee_value || 2000) * totalItemsCount;
    } else {
      packagingFee = settings?.takeaway_fee_value || 2000; // Flat per nota
    }
  }

  const grandTotal = subtotal + serviceFee + packagingFee;
  const parsedCash = parseFloat(cashGiven) || 0;
  const changeAmount = paymentMethod === 'cash' ? Math.max(0, parsedCash - grandTotal) : 0;

  // Submit Order to API
  const handleProceedPayment = () => {
    if (!activeShift) {
      setShowShiftModal(true);
      return;
    }
    if (cart.length === 0) {
      alert('Keranjang pesanan masih kosong.');
      return;
    }
    setCashGiven(grandTotal.toString());
    setShowPaymentModal(true);
  };

  const handleFinalizeTransaction = async () => {
    if (paymentMethod === 'cash' && parsedCash < grandTotal) {
      alert(`Uang tunai kurang. Total tagihan Rp ${grandTotal.toLocaleString('id-ID')}, diterima Rp ${parsedCash.toLocaleString('id-ID')}.`);
      return;
    }

    try {
      setSubmittingOrder(true);
      const payload = {
        order_type: orderType,
        customer_name: customerName || 'Pelanggan Walk-In',
        table_number: orderType === 'dine_in' ? tableNumber : null,
        notes: orderNotes,
        payment_method: paymentMethod,
        cash_amount: paymentMethod === 'cash' ? parsedCash : grandTotal,
        items: cart
      };

      const res = await api.post('/orders', payload);
      setCompletedOrder(res.data.order);
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      clearCart();
      await refreshContext();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memproses transaksi.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Filtered menu
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'all' || p.category_id === parseInt(selectedCategory, 10);
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Shift Alert Banner if Not Open */}
      {!activeShift && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-500 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg shadow-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Shift Laci Kasir Belum Dibuka</p>
              <p className="text-xs text-amber-100">
                Wajib menginput modal awal kasir sebelum transaksi penjualan dapat diproses.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowShiftModal(true)}
            className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            Buka Shift Sekarang
          </button>
        </div>
      )}

      {/* Main Grid: Left Catalog (8 Cols) & Right Cart (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Menu Catalog & Categories */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Top Actions: Search + Quick Tools */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari hidangan menu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setShowHistoryModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                title="Riwayat transaksi shift hari ini"
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Riwayat Hari Ini</span>
              </button>

              <button
                onClick={() => setShowShiftModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>{activeShift ? 'Tutup Shift' : 'Buka Shift'}</span>
              </button>
            </div>
          </div>

          {/* Categories Pill Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Semua Menu ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id.toString()
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loadingMenu ? (
            <div className="py-20 text-center text-slate-500">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs">Memuat katalog hidangan...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
              <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">Tidak Ada Menu</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Database produk murni kosong saat inisiasi seeder. Owner dapat menambahkan produk di Dashboard Owner.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => prod.is_available && addToCart(prod)}
                  className={`bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-col justify-between transition-all select-none ${
                    prod.is_available
                      ? 'hover:border-amber-400 hover:shadow-md cursor-pointer active:scale-98'
                      : 'opacity-60 cursor-not-allowed bg-slate-50'
                  }`}
                >
                  <div>
                    {/* Image / Thumbnail */}
                    <div className="h-28 w-full bg-slate-100 rounded-xl overflow-hidden mb-2.5 relative">
                      {prod.image_url ? (
                        <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Utensils className="w-6 h-6" />
                        </div>
                      )}
                      {!prod.is_available && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-rose-600 px-2 py-0.5 rounded-full">
                            Habis
                          </span>
                        </div>
                      )}
                    </div>

                    <h5 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2 mb-1">
                      {prod.name}
                    </h5>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-1">
                    <span className="font-bold text-xs text-amber-700">
                      Rp {Number(prod.price).toLocaleString('id-ID')}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCustomizeModal(prod);
                      }}
                      className="text-[10px] font-semibold text-slate-500 hover:text-amber-600 px-1.5 py-0.5 rounded hover:bg-amber-50 cursor-pointer"
                      title="Kustomisasi porsi & catatan"
                    >
                      +Catatan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Order Cart & Billing Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-md p-4 sm:p-5 flex flex-col min-h-[580px] sticky top-20">
          {/* Order Type Toggle: Dine-In vs Takeaway */}
          <div className="mb-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Tipe Layanan Pesanan
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                disabled={!settings?.is_dine_in_enabled}
                onClick={() => setOrderType('dine_in')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  orderType === 'dine_in'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Dine-In</span>
                {settings?.dine_in_fee_value > 0 && (
                  <span className="text-[10px] opacity-80">
                    (+{settings.dine_in_fee_type === 'percent' ? `${settings.dine_in_fee_value}%` : `Rp ${settings.dine_in_fee_value}`})
                  </span>
                )}
              </button>

              <button
                type="button"
                disabled={!settings?.is_takeaway_enabled}
                onClick={() => setOrderType('takeaway')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  orderType === 'takeaway'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Takeaway</span>
                {settings?.takeaway_fee_value > 0 && (
                  <span className="text-[10px] opacity-80">
                    (+Rp {Number(settings.takeaway_fee_value).toLocaleString('id-ID')})
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Customer & Table details */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <input
                type="text"
                placeholder="Nama Pelanggan (opsional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
            {orderType === 'dine_in' ? (
              <div>
                <input
                  type="text"
                  placeholder="Nomor Meja (cth: 04)"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 italic flex items-center px-2">
                Bungkus bawa pulang
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-64 mb-4 pr-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                <p className="text-xs font-semibold text-slate-600">Keranjang Masih Kosong</p>
                <p className="text-[11px] text-slate-400">Pilih menu dari katalog di sebelah kiri.</p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-slate-900 truncate">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span>Rp {Number(item.price).toLocaleString('id-ID')}</span>
                      {item.portion !== 'Standard' && (
                        <span className="text-amber-700 bg-amber-50 px-1 rounded">[{item.portion}]</span>
                      )}
                    </div>
                    {item.notes && (
                      <div className="text-[10px] text-amber-800 italic mt-0.5">
                        * {item.notes}
                      </div>
                    )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(idx, -1)}
                      className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(idx, 1)}
                      className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(idx)}
                      className="w-6 h-6 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center ml-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal ({totalItemsCount} porsi):</span>
              <span className="font-medium text-slate-900">
                Rp {Number(subtotal).toLocaleString('id-ID')}
              </span>
            </div>

            {orderType === 'dine_in' && serviceFee > 0 && (
              <div className="flex justify-between text-amber-800">
                <span>Biaya Layanan Dine-In:</span>
                <span>+Rp {Number(serviceFee).toLocaleString('id-ID')}</span>
              </div>
            )}

            {orderType === 'takeaway' && packagingFee > 0 && (
              <div className="flex justify-between text-orange-800">
                <span>Biaya Kemasan Takeaway:</span>
                <span>+Rp {Number(packagingFee).toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-dashed border-slate-200">
              <span>TOTAL TAGIHAN:</span>
              <span className="text-amber-600">
                Rp {Number(grandTotal).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Action Button: Bayar Sekarang */}
          <div className="pt-4 flex items-center gap-2">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Kosongkan Keranjang"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleProceedPayment}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Bayar & Proses Nota</span>
              <span className="font-mono text-xs opacity-90">
                (Rp {Number(grandTotal).toLocaleString('id-ID')})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Payment Checkout Modal (Cash / QRIS / Debit + Kalkulasi Kembalian) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="font-bold text-slate-900 text-sm">Pembayaran Pesanan</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Total Due Banner */}
              <div className="p-4 rounded-xl bg-slate-900 text-white text-center">
                <span className="text-xs uppercase tracking-wider text-slate-400">Total Pembayaran</span>
                <div className="text-2xl font-black font-sans text-amber-400 mt-0.5">
                  Rp {Number(grandTotal).toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  {orderType === 'dine_in' ? `Dine-In ${tableNumber ? `(Meja ${tableNumber})` : ''}` : 'Takeaway (Bungkus)'} • {totalItemsCount} Porsi
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pilih Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span>Tunai (Cash)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                      paymentMethod === 'qris'
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-blue-600" />
                    <span>QRIS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('debit')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                      paymentMethod === 'debit'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <span>Debit / EDC</span>
                  </button>
                </div>
              </div>

              {/* Cash Input & Change Calculation */}
              {paymentMethod === 'cash' ? (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Uang Tunai Diterima (Rp)
                    </label>
                    <input
                      type="number"
                      min={grandTotal}
                      value={cashGiven}
                      onChange={(e) => setCashGiven(e.target.value)}
                      placeholder="Masukkan jumlah uang tunai..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Quick Denomination Buttons */}
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCashGiven(grandTotal.toString())}
                      className="py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-amber-50 hover:border-amber-400 cursor-pointer"
                    >
                      Uang Pas
                    </button>
                    {[50000, 100000, 200000].map((nominal) => (
                      <button
                        key={nominal}
                        type="button"
                        onClick={() => setCashGiven(nominal.toString())}
                        className="py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-amber-50 hover:border-amber-400 cursor-pointer"
                      >
                        {(nominal / 1000).toFixed(0)}rb
                      </button>
                    ))}
                  </div>

                  {/* Change Preview */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Kembalian:</span>
                    <span className={`font-bold text-sm ${parsedCash >= grandTotal ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {parsedCash >= grandTotal
                        ? `Rp ${changeAmount.toLocaleString('id-ID')}`
                        : `Kurang Rp ${(grandTotal - parsedCash).toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 text-center">
                  <p className="font-semibold mb-1">Pembayaran Non-Tunai ({paymentMethod.toUpperCase()})</p>
                  <p className="text-[11px] text-blue-600">
                    Pastikan pembayaran senilai <strong>Rp {Number(grandTotal).toLocaleString('id-ID')}</strong> telah berhasil divalidasi pada terminal QRIS/Mesin EDC.
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={submittingOrder || (paymentMethod === 'cash' && parsedCash < grandTotal)}
                  onClick={handleFinalizeTransaction}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {submittingOrder ? 'Memproses...' : 'Selesaikan Transaksi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Success Prompt & Print Options */}
      {showSuccessModal && completedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-center p-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Transaksi Berhasil!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Nota <span className="font-mono font-bold text-slate-800">{completedOrder.invoice_number}</span> berhasil disimpan di database.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between font-semibold">
              <span className="text-slate-600">Total Transaksi:</span>
              <span className="text-slate-900">Rp {Number(completedOrder.total_amount).toLocaleString('id-ID')}</span>
            </div>

            {/* Print Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCustomerReceipt(true);
                }}
                className="py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk Pelanggan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowKitchenReceipt(true);
                }}
                className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <ChefHat className="w-4 h-4 text-amber-400" />
                <span>Cetak Struk Dapur</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                setCompletedOrder(null);
              }}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Kembali ke Layar Kasir
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Customization (Portion & Notes) */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900">{customizingItem.name}</h4>
                <p className="text-xs text-amber-700 font-semibold">Rp {Number(customizingItem.price).toLocaleString('id-ID')}</p>
              </div>
              <button onClick={() => setCustomizingItem(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pilihan Porsi</label>
              <div className="grid grid-cols-3 gap-2">
                {['Standard', 'Jumbo', 'Separuh'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCustomPortion(p)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      customPortion === p
                        ? 'border-amber-500 bg-amber-50 text-amber-800'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Catatan Khusus Porsi</label>
              <textarea
                rows={2}
                placeholder="Contoh: Sangat pedas cabai 10, tanpa bawang goreng, es sedikit..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCustomizingItem(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveCustomizedItem}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
              >
                Tambahkan ke Pesanan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Shift Modal (Buka / Tutup Kasir) */}
      <ShiftModal
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        onShiftUpdated={() => refreshContext()}
      />

      {/* MODAL 5: Struk Pelanggan */}
      <CustomerReceiptModal
        isOpen={showCustomerReceipt}
        onClose={() => setShowCustomerReceipt(false)}
        order={completedOrder}
        tenant={tenant}
        settings={settings}
      />

      {/* MODAL 6: Struk Dapur (Tanpa Harga) */}
      <KitchenReceiptModal
        isOpen={showKitchenReceipt}
        onClose={() => setShowKitchenReceipt(false)}
        order={completedOrder}
      />

      {/* MODAL 7: Riwayat Kasir Hari Ini */}
      <CashierHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onSelectReceipt={(ord) => {
          setCompletedOrder(ord);
          setShowCustomerReceipt(true);
        }}
        onSelectKitchen={(ord) => {
          setCompletedOrder(ord);
          setShowKitchenReceipt(true);
        }}
      />
    </div>
  );
}
