import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Percent, 
  ArrowUpRight, 
  Calendar, 
  FileText, 
  Award,
  RefreshCw,
  CreditCard,
  QrCode,
  Banknote,
  Utensils,
  Package
} from 'lucide-react';

export default function FinancialReports({ onOpenOrderDetail }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReport = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/reports/dashboard');
      setData(res.data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat laporan keuangan.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm">Menghitung analitik omzet dan laba bersih...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
        <p className="font-semibold mb-2">{error}</p>
        <button
          onClick={fetchReport}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 cursor-pointer"
        >
          Coba Muat Ulang
        </button>
      </div>
    );
  }

  const { summary, top_products, payment_breakdown, order_type_breakdown, recent_orders } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner and Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Laporan Finansial & Laba Bersih Otomatis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dihitung otomatis secara realtime: <span className="font-semibold text-emerald-600">Laba Bersih = Omzet Penjualan - HPP (Harga Modal)</span>
          </p>
        </div>
        <button
          onClick={fetchReport}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-500' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omzet Penjualan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Omzet Penjualan</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
            Rp {Number(summary.total_revenue).toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Dari {summary.total_orders} transaksi</span>
          </div>
        </div>

        {/* Total HPP / Modal */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total HPP (Modal)</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-700 font-sans tracking-tight">
            Rp {Number(summary.total_hpp).toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Akumulasi harga pokok bahan
          </div>
        </div>

        {/* Laba Bersih Otomatis */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-2xl text-white shadow-md shadow-emerald-500/20">
          <div className="flex items-center justify-between text-emerald-100 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Laba Bersih (Net)</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans tracking-tight">
            Rp {Number(summary.net_profit).toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-emerald-100 mt-1 flex items-center gap-1.5 font-medium">
            <span>Margin: {summary.profit_margin}%</span>
            <span>•</span>
            <span>Omzet - HPP</span>
          </div>
        </div>

        {/* Rata-rata per Nota */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Nilai Rata-rata Nota</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
            Rp {Number(summary.average_order_value).toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Average basket size pelanggan
          </div>
        </div>
      </div>

      {/* Middle Row: Menu Terlaris & Metode Pembayaran */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Terlaris (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Menu Terlaris (Top Selling Items)</h3>
                <p className="text-xs text-slate-500">Diurutkan berdasarkan total porsi terjual</p>
              </div>
            </div>
          </div>

          {top_products.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <p className="text-sm font-medium">Belum ada transaksi menu tercatat di database.</p>
              <p className="text-xs text-slate-400 mt-1">Katalog dan transaksi murni kosong dari awal sesuai seeder.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {top_products.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-amber-500 text-white' :
                      index === 1 ? 'bg-slate-300 text-slate-800' :
                      index === 2 ? 'bg-amber-700/60 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{item.name}</div>
                      <div className="text-xs text-slate-500">
                        {item.quantity} porsi terjual
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">
                      Rp {Number(item.revenue).toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-600">
                      Laba: +Rp {Number(item.profit).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Breakdown Pembayaran & Tipe Layanan (1 Col) */}
        <div className="space-y-6">
          {/* Metode Pembayaran */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Metode Pembayaran</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Tunai (Cash)</span>
                </div>
                <span className="text-xs font-bold text-emerald-900">
                  Rp {Number(payment_breakdown.cash).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>QRIS Non-Tunai</span>
                </div>
                <span className="text-xs font-bold text-blue-900">
                  Rp {Number(payment_breakdown.qris).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Kartu Debit/Kredit</span>
                </div>
                <span className="text-xs font-bold text-indigo-900">
                  Rp {Number(payment_breakdown.debit).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Tipe Pesanan */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Distribusi Pesanan</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <Utensils className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                <div className="text-xs text-slate-500 font-medium">Dine-In</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {order_type_breakdown.dine_in}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <Package className="w-4 h-4 mx-auto text-orange-600 mb-1" />
                <div className="text-xs text-slate-500 font-medium">Takeaway</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {order_type_breakdown.takeaway}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat Transaksi Terakhir */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Riwayat Seluruh Transaksi Penjualan</h3>
            <p className="text-xs text-slate-500">Termasuk nama pembuat transaksi (Kasir/Owner), tipe pesanan, dan laba kotor</p>
          </div>
        </div>

        {recent_orders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">Belum Ada Riwayat Transaksi</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Buka layar POS Kasir untuk membuat transaksi pertama. Database transaksi murni kosong saat inisiasi seeder.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">No. Nota</th>
                  <th className="py-3 px-3">Waktu</th>
                  <th className="py-3 px-3">Kasir</th>
                  <th className="py-3 px-3">Pelanggan</th>
                  <th className="py-3 px-3">Layanan</th>
                  <th className="py-3 px-3">Metode</th>
                  <th className="py-3 px-3 text-right">Total Tagihan</th>
                  <th className="py-3 px-3 text-right">Laba Bersih</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent_orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                      {ord.invoice_number}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(ord.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800">{ord.cashier_name}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {ord.customer_name}
                      {ord.table_number && (
                        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          Meja {ord.table_number}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                        ord.order_type === 'dine_in'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {ord.order_type === 'dine_in' ? 'Dine-In' : 'Takeaway'}
                      </span>
                    </td>
                    <td className="py-3 px-3 uppercase font-semibold text-slate-600">
                      {ord.payment_method}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      Rp {Number(ord.total_amount).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600">
                      +Rp {Number(ord.gross_profit).toLocaleString('id-ID')}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
