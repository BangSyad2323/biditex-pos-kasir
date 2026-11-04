import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  DollarSign,
  ShoppingBag,
  ArrowUpRight,
  Calendar,
  FileText,
  Award,
  RefreshCw,
  QrCode,
  Banknote,
  Utensils,
  Package,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  PlusCircle,
  X,
  Trash2,
  Globe,
} from "lucide-react";

export default function FinancialReports({ onOpenOrderDetail }) {
  const getTodayStr = () => new Date().toISOString().split("T")[0];

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Date Filter State
  const [startDate, setStartDate] = useState(getTodayStr());
  const [endDate, setEndDate] = useState(getTodayStr());
  const [activePreset, setActivePreset] = useState("today");

  // Orders Pagination State
  const [page, setPage] = useState(1);

  // Expenses State & Pagination
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [expensePage, setExpensePage] = useState(1);
  const [expensePagination, setExpensePagination] = useState(null);

  // Modal Input Pengeluaran State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Bahan Baku");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [submittingExpense, setSubmittingExpense] = useState(false);

  const fetchReport = async (
    overridePage = page,
    overrideStart = startDate,
    overrideEnd = endDate,
  ) => {
    try {
      setRefreshing(true);
      const res = await api.get("/reports/dashboard", {
        params: {
          start_date: overrideStart,
          end_date: overrideEnd,
          page: overridePage,
          per_page: 10,
        },
      });
      setData(res.data);
      setError(null);
    } catch (err) {
      setError("Gagal memuat laporan keuangan.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchExpenses = async (overrideExpensePage = expensePage) => {
    try {
      setLoadingExpenses(true);
      const res = await api.get("/expenses", {
        params: {
          page: overrideExpensePage,
          per_page: 10,
        },
      });
      setExpenses(res.data.data || []);
      setExpensePagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
        from: res.data.from,
        to: res.data.to,
      });
    } catch (err) {
      console.error("Gagal mengambil data pengeluaran:", err);
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    fetchReport(page, startDate, endDate);
  }, [page, startDate, endDate]);

  useEffect(() => {
    fetchExpenses(expensePage);
  }, [expensePage]);

  const handlePresetChange = (preset) => {
    setActivePreset(preset);
    setPage(1);
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (preset === "all") {
      setStartDate("");
      setEndDate("");
      return;
    } else if (preset === "today") {
      start = today;
      end = today;
    } else if (preset === "yesterday") {
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() - 1);
    } else if (preset === "7days") {
      start.setDate(today.getDate() - 6);
      end = today;
    }

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];
    setStartDate(startStr);
    setEndDate(endStr);
  };

  const handleCustomDateChange = (newStart, newEnd) => {
    setActivePreset("custom");
    setPage(1);
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseAmount || Number(expenseAmount) <= 0) {
      alert("Masukkan jumlah pengeluaran yang valid");
      return;
    }
    try {
      setSubmittingExpense(true);
      await api.post("/expenses", {
        amount: Number(expenseAmount),
        category: expenseCategory,
        description: expenseDescription,
      });
      alert("Pengeluaran berhasil dicatat!");
      setShowExpenseModal(false);
      setExpenseAmount("");
      setExpenseDescription("");
      fetchReport();
      fetchExpenses(1);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan pengeluaran");
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleDeleteExpense = async (id, category, amount) => {
    if (
      !window.confirm(
        `Hapus pengeluaran "${category}" sebesar Rp ${Number(amount).toLocaleString("id-ID")}?`,
      )
    )
      return;
    try {
      await api.delete(`/expenses/${id}`);
      alert("Pengeluaran berhasil dihapus!");
      fetchReport();
      fetchExpenses(expensePage);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus pengeluaran");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm">Menghitung omzet dan laba bersih...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
        <p className="font-semibold mb-2">{error}</p>
        <button
          onClick={() => {
            fetchReport();
            fetchExpenses();
          }}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 cursor-pointer"
        >
          Coba Muat Ulang
        </button>
      </div>
    );
  }

  const {
    summary,
    top_products,
    payment_breakdown,
    order_type_breakdown,
    recent_orders,
    pagination,
  } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner, Filter, Refresh, dan Tombol Tambah Pengeluaran */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Laporan Finansial & Laba Bersih
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dihitung otomatis:{" "}
              <span className="font-semibold text-emerald-600">
                Laba Bersih = Omzet Total - Pengeluaran
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Input Pengeluaran</span>
            </button>
            <button
              onClick={() => {
                fetchReport();
                fetchExpenses();
              }}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-500" : ""}`}
              />
              <span>Segarkan Data</span>
            </button>
          </div>
        </div>

        {/* Global Date Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Periode Filter:</span>
            </span>
            <div className="inline-flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              {["today", "yesterday", "7days", "all"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetChange(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activePreset === preset ? "bg-amber-500 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                >
                  {preset === "today"
                    ? "Hari Ini"
                    : preset === "yesterday"
                      ? "Kemarin"
                      : preset === "7days"
                        ? "7 Hari Terakhir"
                        : "Semua Waktu"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  handleCustomDateChange(e.target.value, endDate)
                }
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              />
              <span className="text-xs text-slate-400 font-bold">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  handleCustomDateChange(startDate, e.target.value)
                }
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>
          </div>
          <div className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {activePreset === "all" ? (
              <span>Menampilkan seluruh data</span>
            ) : (
              <span>
                Filter:{" "}
                <strong className="text-slate-800">{startDate || "..."}</strong>{" "}
                s/d{" "}
                <strong className="text-slate-800">{endDate || "..."}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Omzet Penjualan Riil */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Omzet Penjualan
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-sans tracking-tight">
            Rp{" "}
            {Number(
              summary.total_gross_income ?? summary.sales_revenue ?? 0,
            ).toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>{summary.total_orders} transaksi</span>
          </div>
        </div>

        {/* Biaya Layanan & Kemasan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-orange-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Biaya Layanan
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-sans tracking-tight">
            Rp {Number(summary.service_charges ?? 0).toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Layanan + Kemasan
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Pengeluaran
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-600 font-sans tracking-tight">
            Rp {Number(summary.total_expenses ?? 0).toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Total Kas Keluar
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-2xl text-white shadow-md shadow-emerald-500/20">
          <div className="flex items-center justify-between text-emerald-100 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Laba Bersih
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-sans tracking-tight">
            Rp {Number(summary.net_profit ?? 0).toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-emerald-100 mt-1 font-medium">
            <span>Margin: {summary.profit_margin}%</span>
          </div>
        </div>

        {/* Rata-rata per Nota */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Rata-rata Nota
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-sans tracking-tight">
            Rp{" "}
            {Number(summary.average_order_value ?? 0).toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Avg basket size</div>
        </div>
      </div>

      {/* Middle Row: Menu Terlaris, Metode Pembayaran, & Distribusi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Menu Terlaris
                </h3>
                <p className="text-xs text-slate-500">
                  Berdasarkan total porsi terjual
                </p>
              </div>
            </div>
          </div>
          {top_products.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <p className="text-sm font-medium">
                Belum ada transaksi menu tercatat.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {top_products.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? "bg-amber-500 text-white" : index === 1 ? "bg-slate-300 text-slate-800" : index === 2 ? "bg-amber-700/60 text-white" : "bg-slate-200 text-slate-600"}`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.quantity} porsi terjual
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">
                      Rp {Number(item.revenue).toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Breakdown Pembayaran & Tipe Layanan */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Metode Pembayaran
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Tunai (Cash)</span>
                </div>
                <span className="text-xs font-bold text-emerald-900">
                  Rp{" "}
                  {Number(payment_breakdown?.cash || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>QRIS Non-Tunai</span>
                </div>
                <span className="text-xs font-bold text-blue-900">
                  Rp{" "}
                  {Number(payment_breakdown?.qris || 0).toLocaleString("id-ID")}
                </span>
              </div>
              {/* Tambahan Breakdown Online Platform */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>Online Platform (OFD)</span>
                </div>
                <span className="text-xs font-bold text-indigo-900">
                  Rp{" "}
                  {Number(payment_breakdown?.online || 0).toLocaleString(
                    "id-ID",
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Distribusi Pesanan
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <Utensils className="w-3.5 h-3.5 mx-auto text-amber-600 mb-1" />
                <div className="text-[10px] text-slate-500 font-medium">
                  Dine-In
                </div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {order_type_breakdown.dine_in}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <Package className="w-3.5 h-3.5 mx-auto text-orange-600 mb-1" />
                <div className="text-[10px] text-slate-500 font-medium">
                  Takeaway
                </div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {order_type_breakdown.takeaway}
                </div>
              </div>
              {/* Tambahan Distribusi Online Delivery */}
              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200 text-center">
                <Globe className="w-3.5 h-3.5 mx-auto text-blue-600 mb-1" />
                <div className="text-[10px] text-blue-900 font-medium">
                  Online
                </div>
                <div className="text-base font-bold text-blue-950 mt-0.5">
                  {order_type_breakdown.online || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABEL 1: Riwayat Transaksi Penjualan */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            Riwayat Seluruh Transaksi Penjualan
          </h3>
        </div>
        {recent_orders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">
              Belum Ada Riwayat Transaksi
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">No. Nota</th>
                    <th className="py-3 px-3">Waktu</th>
                    <th className="py-3 px-3">Kasir</th>
                    <th className="py-3 px-3">Pelanggan</th>
                    <th className="py-3 px-3">Layanan</th>
                    <th className="py-3 px-3 text-right">Biaya Layanan</th>
                    <th className="py-3 px-3">Metode</th>
                    <th className="py-3 px-3 text-right">Total Tagihan</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recent_orders.map((ord) => {
                    const feeSum =
                      (Number(ord.service_fee) || 0) +
                      (Number(ord.packaging_fee) || 0);
                    return (
                      <tr
                        key={ord.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                          {ord.invoice_number}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          <div>
                            {new Date(ord.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                              },
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(ord.created_at).toLocaleTimeString(
                              "id-ID",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800">
                            {ord.cashier_name}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {ord.customer_name}
                          {ord.table_number && (
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              Meja {ord.table_number}
                            </span>
                          )}
                          {ord.online_order_id && (
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                              {ord.online_order_id}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${ord.order_type === "dine_in" ? "bg-amber-100 text-amber-800" : ord.order_type === "takeaway" ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"}`}
                          >
                            {ord.order_type === "dine_in"
                              ? "Dine-In"
                              : ord.order_type === "takeaway"
                                ? "Takeaway"
                                : ord.online_channel || "Online"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-700">
                          {feeSum > 0
                            ? `+Rp ${feeSum.toLocaleString("id-ID")}`
                            : "-"}
                        </td>
                        <td className="py-3 px-3 uppercase font-semibold text-slate-600">
                          {ord.payment_method}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          Rp {Number(ord.total_amount).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => onOpenOrderDetail(ord.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Detail & Struk
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination && pagination.last_page > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs">
                <div className="text-slate-500">
                  Menampilkan{" "}
                  <span className="font-semibold text-slate-800">
                    {pagination.from || 0}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold text-slate-800">
                    {pagination.to || 0}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-slate-800">
                    {pagination.total}
                  </span>{" "}
                  transaksi
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Sebelumnya</span>
                  </button>
                  <span className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold">
                    {pagination.current_page} / {pagination.last_page}
                  </span>
                  <button
                    type="button"
                    disabled={page >= pagination.last_page}
                    onClick={() =>
                      setPage((p) => Math.min(pagination.last_page, p + 1))
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* TABEL 2: Riwayat Pengeluaran (Kas Keluar) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              Riwayat Pengeluaran (Kas Keluar)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan belanja bahan baku, komisi platform OFD, operasional, dan
              gaji dari laci kasir
            </p>
          </div>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span> Pengeluaran Baru</span>
          </button>
        </div>

        {loadingExpenses ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            Memuat data pengeluaran...
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <TrendingDown className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">
              Belum Ada Catatan Pengeluaran
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">Waktu</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Dicatat Oleh</th>
                    <th className="py-3 px-3">Keterangan / Catatan</th>
                    <th className="py-3 px-3 text-right">Nominal Keluar</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp) => (
                    <tr
                      key={exp.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-3 text-slate-500">
                        <div>
                          {new Date(exp.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                            },
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(exp.created_at).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${exp.category === "Komisi OFD / Platform" ? "bg-blue-100 text-blue-800" : "bg-rose-100 text-rose-800"}`}
                        >
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {exp.user?.name || "Kasir"}
                      </td>
                      <td className="py-3 px-3 text-slate-600 italic">
                        {exp.description || "-"}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-rose-600">
                        -Rp {Number(exp.amount).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() =>
                            handleDeleteExpense(
                              exp.id,
                              exp.category,
                              exp.amount,
                            )
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Pengeluaran"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {expensePagination && expensePagination.last_page > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs">
                <div className="text-slate-500">
                  Menampilkan{" "}
                  <span className="font-semibold text-slate-800">
                    {expensePagination.from || 0}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold text-slate-800">
                    {expensePagination.to || 0}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-slate-800">
                    {expensePagination.total}
                  </span>{" "}
                  pengeluaran
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={expensePage <= 1}
                    onClick={() => setExpensePage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Sebelumnya</span>
                  </button>
                  <span className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                    {expensePagination.current_page} /{" "}
                    {expensePagination.last_page}
                  </span>
                  <button
                    type="button"
                    disabled={expensePage >= expensePagination.last_page}
                    onClick={() =>
                      setExpensePage((p) =>
                        Math.min(expensePagination.last_page, p + 1),
                      )
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Input Pengeluaran Kas Keluar */}
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
    </div>
  );
}
