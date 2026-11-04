import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  Search,
  Utensils,
  Package,
  Plus,
  Minus,
  Trash2,
  QrCode,
  Banknote,
  History,
  Printer,
  ChefHat,
  Coins,
  ShoppingBag,
  CheckCircle2,
  X,
  TrendingDown,
  Globe,
  Edit3,
  ShoppingCart,
  ChevronUp,
} from "lucide-react";
import ShiftModal from "./ShiftModal";
import CustomerReceiptModal from "./CustomerReceiptModal";
import KitchenReceiptModal from "./KitchenReceiptModal";
import CashierHistoryModal from "./CashierHistoryModal";
import DualReceiptPrintModal from "./DualReceiptPrintModal";

export default function PosScreen() {
  const {
    user,
    tenant,
    settings,
    activeShift,
    setActiveShift,
    refreshContext,
    isOwner,
  } = useAuth();

  // Menu data
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Cart state
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("dine_in");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [onlineOrderId, setOnlineOrderId] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [customGrandTotal, setCustomGrandTotal] = useState("");

  // Mobile Bottom Sheet Cart State
  const [showMobileCartModal, setShowMobileCartModal] = useState(false);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashGiven, setCashGiven] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Completed Order & Receipts
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCustomerReceipt, setShowCustomerReceipt] = useState(false);
  const [showKitchenReceipt, setShowKitchenReceipt] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);

  // Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Bahan Baku");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Item customization modal
  const [customizingItem, setCustomizingItem] = useState(null);
  const [customPortion, setCustomPortion] = useState("Standard");
  const [customNotes, setCustomNotes] = useState("");

  const fetchMenu = async () => {
    try {
      setLoadingMenu(true);
      const [catRes, prodRes] = await Promise.all([
        api.get("/categories"),
        api.get("/products"),
      ]);
      setCategories(catRes.data.data || []);
      setProducts(prodRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMenu(false);
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("/storage/")) {
      const backendUrl =
        import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
        "http://localhost:8000";
      return `${backendUrl}${url}`;
    }
    return url;
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    if (settings) {
      if (!settings.is_dine_in_enabled && settings.is_takeaway_enabled) {
        setOrderType("takeaway");
      } else if (settings.is_dine_in_enabled && !settings.is_takeaway_enabled) {
        setOrderType("dine_in");
      }
    }
  }, [settings]);

  const activeChannels =
    settings?.is_online_integration_enabled &&
    Array.isArray(settings?.online_channels)
      ? settings.online_channels.filter((c) => c.is_active)
      : [];

  const addToCart = (product) => {
    if (!product.is_available) return;
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.product_id === product.id &&
          item.portion === "Standard" &&
          !item.notes,
      );
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
          quantity: 1,
          portion: "Standard",
          notes: "",
        },
      ];
    });
  };

  const openCustomizeModal = (product) => {
    setCustomizingItem(product);
    setCustomPortion("Standard");
    setCustomNotes("");
  };

  const saveCustomizedItem = () => {
    if (!customizingItem) return;
    setCart((prev) => [
      ...prev,
      {
        product_id: customizingItem.id,
        name: customizingItem.name,
        price: customizingItem.price,
        quantity: 1,
        portion: customPortion,
        notes: customNotes.trim(),
      },
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
    setCustomerName("");
    setTableNumber("");
    setOnlineOrderId("");
    setOrderNotes("");
    setCustomGrandTotal("");
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0,
  );
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  let serviceFee = 0;
  if (orderType === "dine_in" && (settings?.is_dine_in_enabled ?? true)) {
    const feeVal = Number(settings?.dine_in_fee_value) || 0;
    if (settings?.dine_in_fee_type === "percent") {
      serviceFee = Math.round((subtotal * feeVal) / 100);
    } else {
      serviceFee = feeVal;
    }
  }

  let packagingFee = 0;
  if (orderType === "takeaway" && (settings?.is_takeaway_enabled ?? true)) {
    const feeVal = Number(settings?.takeaway_fee_value) || 2000;
    if (settings?.takeaway_fee_type === "per_item") {
      packagingFee = feeVal * totalItemsCount;
    } else {
      packagingFee = feeVal;
    }
  }

  const calculatedGrandTotal = subtotal + serviceFee + packagingFee;
  const grandTotal =
    orderType === "online" && customGrandTotal !== ""
      ? Number(customGrandTotal)
      : calculatedGrandTotal;

  const parsedCash = parseFloat(cashGiven) || 0;
  const changeAmount =
    paymentMethod === "cash" ? Math.max(0, parsedCash - grandTotal) : 0;

  const handleSelectOnlineChannel = (ch) => {
    setOrderType("online");
    setSelectedChannel(ch);
    setPaymentMethod("online_platform");
  };

  const handleProceedPayment = () => {
    if (!activeShift) {
      setShowShiftModal(true);
      return;
    }
    if (cart.length === 0) {
      alert("Keranjang pesanan masih kosong.");
      return;
    }
    if (orderType === "online") {
      setPaymentMethod("online_platform");
    } else {
      setPaymentMethod("cash");
      setCashGiven(grandTotal.toString());
    }
    setShowMobileCartModal(false);
    setShowPaymentModal(true);
  };

  const handleFinalizeTransaction = async () => {
    if (paymentMethod === "cash" && parsedCash < grandTotal) {
      alert(
        `Uang tunai kurang. Total tagihan Rp ${grandTotal.toLocaleString("id-ID")}, diterima Rp ${parsedCash.toLocaleString("id-ID")}.`,
      );
      return;
    }

    try {
      setSubmittingOrder(true);
      const payload = {
        order_type: orderType,
        online_channel: orderType === "online" ? selectedChannel?.label : null,
        online_order_id: orderType === "online" ? onlineOrderId : null,
        customer_name:
          customerName ||
          (orderType === "online"
            ? `Driver ${selectedChannel?.label}`
            : "Pelanggan Walk-In"),
        table_number: orderType === "dine_in" ? tableNumber : null,
        notes: orderNotes,
        payment_method: paymentMethod,
        cash_amount:
          Number(paymentMethod === "cash" ? parsedCash : grandTotal) || 0,
        custom_grand_total:
          orderType === "online" && customGrandTotal !== ""
            ? Number(customGrandTotal)
            : null,
        items: cart.map((item) => ({
          product_id: Number(item.product_id),
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 0,
          portion: item.portion,
          notes: item.notes,
        })),
      };

      const res = await api.post("/orders", payload);
      const newOrder = res.data.order;
      setCompletedOrder(newOrder);
      setShowPaymentModal(false);
      clearCart();
      setShowSuccessModal(true);

      setTimeout(() => {
        const receiptEl = document.getElementById("dual-receipt-print-wrapper");
        if (receiptEl) {
          window.print();
        } else {
          setTimeout(() => {
            window.print();
          }, 500);
        }
        refreshContext();
      }, 500);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memproses transaksi.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!activeShift) {
      alert(
        "Shift laci kasir harus dibuka terlebih dahulu sebelum mencatat pengeluaran.",
      );
      setShowShiftModal(true);
      return;
    }
    if (!expenseAmount || Number(expenseAmount) <= 0) {
      alert("Masukkan nominal pengeluaran yang valid.");
      return;
    }

    try {
      setSubmittingExpense(true);
      await api.post("/expenses", {
        amount: Number(expenseAmount),
        category: expenseCategory,
        description: expenseDescription,
      });
      alert("Pengeluaran berhasil dicatat dari laci kasir!");
      setShowExpenseModal(false);
      setExpenseAmount("");
      setExpenseDescription("");
      refreshContext();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mencatat pengeluaran.");
    } finally {
      setSubmittingExpense(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCat =
      selectedCategory === "all" ||
      p.category_id === parseInt(selectedCategory, 10);
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  // Komponen Reusable untuk Sidebar Keranjang
  const CartSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Order Type Toggle */}
      <div className="mb-4 space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Tipe Layanan Pesanan
        </label>
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            disabled={!settings?.is_dine_in_enabled}
            onClick={() => {
              setOrderType("dine_in");
              setSelectedChannel(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${orderType === "dine_in" ? "bg-amber-500 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 disabled:opacity-40"}`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Dine-In</span>
          </button>
          <button
            type="button"
            disabled={!settings?.is_takeaway_enabled}
            onClick={() => {
              setOrderType("takeaway");
              setSelectedChannel(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${orderType === "takeaway" ? "bg-orange-500 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 disabled:opacity-40"}`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Takeaway</span>
          </button>
        </div>

        {activeChannels.length > 0 && (
          <div className="pt-1">
            <div className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-500" />
              <span>Channel Pesanan Online (OFD)</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {activeChannels.map((ch) => (
                <button
                  key={ch.key}
                  type="button"
                  onClick={() => handleSelectOnlineChannel(ch)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${orderType === "online" && selectedChannel?.key === ch.key ? "bg-blue-600 text-white border-blue-600 shadow-xs" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
                >
                  <span>{ch.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Details input */}
      <div className="space-y-2 mb-3">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder={
              orderType === "online" ? "Nama Driver (opsional)" : "Nama Pelanggan"
            }
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
          />
          {orderType === "dine_in" && (
            <input
              type="text"
              placeholder="No. Meja"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 font-semibold"
            />
          )}
          {orderType === "online" && (
            <input
              type="text"
              placeholder="ID / Resi (cth: #SPF-9812)"
              value={onlineOrderId}
              onChange={(e) => setOnlineOrderId(e.target.value)}
              className="w-full px-3 py-1.5 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-blue-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
            />
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-[160px] max-h-64 mb-4 pr-1">
        {cart.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-1" />
            <p className="text-xs font-semibold text-slate-600">
              Keranjang Masih Kosong
            </p>
          </div>
        ) : (
          cart.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs text-slate-900 truncate">
                  {item.name}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span>Rp {Number(item.price).toLocaleString("id-ID")}</span>
                  {item.portion !== "Standard" && (
                    <span className="text-amber-700 bg-amber-50 px-1 rounded">
                      [{item.portion}]
                    </span>
                  )}
                </div>
              </div>
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
      <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-600 mt-auto">
        <div className="flex justify-between">
          <span>Subtotal ({totalItemsCount} porsi):</span>
          <span className="font-medium text-slate-900">
            Rp {Number(subtotal).toLocaleString("id-ID")}
          </span>
        </div>

        {orderType === "online" && (
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
              <span className="flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> Edit Total Tagihan{" "}
                {selectedChannel?.label}:
              </span>
            </div>
            <input
              type="number"
              placeholder={`Default: Rp ${calculatedGrandTotal.toLocaleString("id-ID")}`}
              value={customGrandTotal}
              onChange={(e) => setCustomGrandTotal(e.target.value)}
              className="w-full px-2.5 py-1 bg-white border border-blue-300 rounded-lg text-xs font-bold text-blue-900 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-dashed border-slate-200">
          <span>TOTAL TAGIHAN:</span>
          <span className={orderType === "online" ? "text-blue-600" : "text-amber-600"}>
            Rp {Number(grandTotal).toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 flex items-center gap-2">
        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          disabled={cart.length === 0}
          onClick={handleProceedPayment}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${orderType === "online" ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20" : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/20"}`}
        >
          <span>
            {orderType === "online"
              ? `Proses Nota ${selectedChannel?.label || "Online"}`
              : "Bayar & Proses Nota"}
          </span>
          <span className="font-mono text-xs opacity-90">
            (Rp {Number(grandTotal).toLocaleString("id-ID")})
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-24 lg:pb-4">
      {!activeShift && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-500 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg shadow-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Shift Laci Kasir Belum Dibuka</p>
              <p className="text-xs text-amber-100">
                Wajib menginput modal awal kasir sebelum transaksi penjualan dapat
                diproses.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Menu Catalog */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-64 lg:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari hidangan menu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end overflow-x-auto pb-1 md:pb-0 scrollbar-none shrink-0">
              <button
                type="button"
                onClick={() => setShowExpenseModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                <span>Kas Keluar</span>
              </button>
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Riwayat</span>
              </button>
              <button
                type="button"
                onClick={() => setShowShiftModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>{activeShift ? "Tutup Shift" : "Buka Shift"}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${selectedCategory === "all" ? "bg-amber-500 text-white shadow-xs" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              Semua Menu ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${selectedCategory === cat.id.toString() ? "bg-amber-500 text-white shadow-xs" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loadingMenu ? (
            <div className="py-20 text-center text-slate-500">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs">Memuat katalog hidangan...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
              <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">Tidak Ada Menu</h4>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => prod.is_available && addToCart(prod)}
                  className={`bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-col justify-between transition-all select-none ${prod.is_available ? "hover:border-amber-400 hover:shadow-md cursor-pointer active:scale-98" : "opacity-60 cursor-not-allowed bg-slate-50"}`}
                >
                  <div>
                    <div className="h-28 w-full bg-slate-100 rounded-xl overflow-hidden mb-2.5 relative">
                      {prod.image_url ? (
                        <img
                          src={getFullImageUrl(prod.image_url)}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Utensils className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2 mb-1">
                      {prod.name}
                    </h5>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-1">
                    <span className="font-bold text-xs text-amber-700">
                      Rp {Number(prod.price).toLocaleString("id-ID")}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCustomizeModal(prod);
                      }}
                      className="text-[10px] font-semibold text-slate-500 hover:text-amber-600 px-1.5 py-0.5 rounded hover:bg-amber-50 cursor-pointer"
                    >
                      +Catatan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Order Cart Sidebar (Dekstop / Tablet) */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-md p-4 sm:p-5 min-h-[580px] lg:sticky lg:top-20">
          <CartSidebarContent />
        </div>
      </div>

      {/* FLOATING CART BAR (Khusus Layar Mobile HP) */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 left-3 right-3 z-40 lg:hidden">
          <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {totalItemsCount}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Total Keranjang
                </p>
                <p className="text-sm font-bold font-sans text-amber-400">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMobileCartModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>Keranjang</span>
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MOBILE CART BOTTOM SHEET MODAL */}
      {showMobileCartModal && (
        <div className="fixed bottom-20 inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end lg:hidden">
          <div className="bg-white rounded-t-3xl border-t border-slate-200 w-full max-h-[85vh] p-5 flex flex-col shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-500" />
                Rincian Pesanan
              </h3>
              <button
                type="button"
                onClick={() => setShowMobileCartModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <CartSidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* MODALS LAINNYA */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="font-bold text-slate-900 text-sm">
                Pembayaran Pesanan
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="p-3.5 rounded-xl bg-slate-900 text-white text-center">
                <span className="text-xs uppercase tracking-wider text-slate-400">
                  Total Pembayaran
                </span>
                <div className="text-2xl font-black font-sans text-amber-400 mt-0.5">
                  Rp {Number(grandTotal).toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  {orderType === "online"
                    ? `Platform Online (${selectedChannel?.label})`
                    : orderType === "dine_in"
                    ? `Dine-In ${tableNumber ? `(Meja ${tableNumber})` : ""}`
                    : "Takeaway"}
                </div>
              </div>

              {orderType === "online" ? (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
                  <span className="font-bold block">
                    Metode Pembayaran: Non-Tunai Platform
                  </span>
                  <p>
                    Pesanan akan dicatat sebagai omzet online. Uang tunai laci kasir
                    tidak akan bertambah/selisih saat closing shift.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Pilih Metode Pembayaran
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold cursor-pointer ${paymentMethod === "cash" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white"}`}
                    >
                      <Banknote className="w-5 h-5 text-emerald-600" />
                      <span>Tunai (Cash)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("qris")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold cursor-pointer ${paymentMethod === "qris" ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 bg-white"}`}
                    >
                      <QrCode className="w-5 h-5 text-blue-600" />
                      <span>QRIS (Statis)</span>
                    </button>
                  </div>
                </div>
              )}

              {paymentMethod === "cash" && orderType !== "online" && (
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">
                      Kembalian:
                    </span>
                    <span
                      className={`font-bold text-sm ${parsedCash >= grandTotal ? "text-emerald-600" : "text-rose-500"}`}
                    >
                      {parsedCash >= grandTotal
                        ? `Rp ${changeAmount.toLocaleString("id-ID")}`
                        : `Kurang Rp ${(grandTotal - parsedCash).toLocaleString("id-ID")}`}
                    </span>
                  </div>
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
                  disabled={
                    submittingOrder ||
                    (paymentMethod === "cash" && parsedCash < grandTotal)
                  }
                  onClick={handleFinalizeTransaction}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submittingOrder ? "Memproses..." : "Selesaikan Transaksi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && completedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-center p-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Transaksi Berhasil!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Nota{" "}
                <span className="font-mono font-bold text-slate-800">
                  {completedOrder.invoice_number}
                </span>{" "}
                berhasil disimpan.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomerReceipt(true)}
                className="py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk Pelanggan</span>
              </button>
              <button
                type="button"
                onClick={() => setShowKitchenReceipt(true)}
                className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer"
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

      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-500" />
                Catat Pengeluaran (Kas Keluar)
              </h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Pengeluaran (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="Contoh: 50000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Pengeluaran
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Bahan Baku">
                    Belanja Bahan Baku (Beras, Es, Minyak, dll)
                  </option>
                  <option value="Komisi OFD / Platform">
                    Biaya Komisi Platform / Diskon OFD (ShopeeFood, GoFood)
                  </option>
                  <option value="Operasional">
                    Operasional (Listrik, Air, Gas, Tisu)
                  </option>
                  <option value="Gaji & Bonus">Gaji & Staf Kasir</option>
                  <option value="Lainnya">Lain-Lain</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Keterangan
                </label>
                <textarea
                  rows="2"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="Contoh: Potongan komisi pencairan ShopeeFood bulan ini..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
                >
                  {submittingExpense ? "Simpan..." : "Simpan Pengeluaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ShiftModal
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        onShiftUpdated={() => refreshContext()}
      />
      <CustomerReceiptModal
        isOpen={showCustomerReceipt}
        onClose={() => setShowCustomerReceipt(false)}
        order={completedOrder}
        tenant={tenant}
        settings={settings}
      />
      <KitchenReceiptModal
        isOpen={showKitchenReceipt}
        onClose={() => setShowKitchenReceipt(false)}
        order={completedOrder}
      />
      <CashierHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        activeShift={activeShift}
        user={user}
        onSelectReceipt={(ord) => {
          setCompletedOrder(ord);
          setShowCustomerReceipt(true);
        }}
        onSelectKitchen={(ord) => {
          setCompletedOrder(ord);
          setShowKitchenReceipt(true);
        }}
      />
      <DualReceiptPrintModal
        isOpen={!!completedOrder}
        onClose={() => {}}
        order={completedOrder}
        tenant={tenant}
        settings={settings}
      />
    </div>
  );
}