import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { History, X, Printer, ChefHat, Eye, RefreshCw } from 'lucide-react';

export default function CashierHistoryModal({ isOpen, onClose, onSelectReceipt, onSelectKitchen, activeShift, user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { active_shift_only: 1 };
      if (activeShift?.id) {
        params.shift_id = activeShift.id;
      }
      if (user?.id) {
        params.user_id = user.id;
      }

      const res = await api.get('/orders', { params });
      let data = res.data.data || [];

      // Filter ketat berdasarkan User ID kasir yang login dan Shift ID aktif
      if (user?.id) {
        data = data.filter((ord) => Number(ord.user_id) === Number(user.id));
      }
      if (activeShift?.id) {
        data = data.filter((ord) => Number(ord.shift_id) === Number(activeShift.id));
      }

      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen, activeShift?.id, user?.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Riwayat Transaksi Hari Ini (Shift Kasir)
              </h3>
              <p className="text-[11px] text-slate-500">
                Menampilkan transaksi yang diproses pada shift hari ini
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              title="Segarkan"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs">Memuat transaksi shift hari ini...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-semibold text-slate-600">Belum ada transaksi di hari ini.</p>
              <p className="text-xs text-slate-400 mt-1">Transaksi yang Anda buat akan muncul di sini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{ord.invoice_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        ord.order_type === 'dine_in' ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {ord.order_type === 'dine_in' ? 'Dine-In' : 'Takeaway'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ord.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      Pelanggan: <span className="font-medium text-slate-800">{ord.customer_name}</span>
                      {ord.table_number && ` • Meja ${ord.table_number}`}
                    </div>

                    <div className="text-[11px] text-slate-500">
                      {ord.items?.length || 0} menu • {ord.payment_method.toUpperCase()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Total Tagihan</div>
                      <div className="text-sm font-bold text-slate-900">
                        Rp {Number(ord.total_amount).toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectReceipt(ord)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="Cetak Struk Pelanggan"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSelectKitchen(ord)}
                        className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
                        title="Cetak Struk Dapur"
                      >
                        <ChefHat className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
