import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Coins, Clock, AlertTriangle, CheckCircle2, X, ArrowRight, ShieldAlert } from 'lucide-react';

export default function ShiftModal({ isOpen, onClose, onShiftUpdated }) {
  const { user, activeShift, setActiveShift, refreshContext } = useAuth();
  const [startingCash, setStartingCash] = useState('');
  const [actualEndingCash, setActualEndingCash] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [closingRecap, setClosingRecap] = useState(null);

  if (!isOpen) return null;

  // Open Shift
  const handleOpenShift = async (e) => {
    e.preventDefault();
    if (!startingCash || isNaN(Number(startingCash))) {
      setError('Masukkan nominal modal awal kasir.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/shifts/open', { starting_cash: parseFloat(startingCash) });
      setActiveShift(res.data.shift);
      await refreshContext();
      if (onShiftUpdated) onShiftUpdated(res.data.shift);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuka shift kasir.');
    } finally {
      setLoading(false);
    }
  };

  // Close Shift
  const handleCloseShift = async (e) => {
    e.preventDefault();
    if (actualEndingCash === '' || isNaN(Number(actualEndingCash))) {
      setError('Masukkan nominal uang fisik yang dihitung di laci.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/shifts/close', {
        actual_ending_cash: parseFloat(actualEndingCash),
        notes
      });
      setClosingRecap(res.data.recap);
      setActiveShift(null);
      await refreshContext();
      if (onShiftUpdated) onShiftUpdated(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menutup shift kasir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              activeShift ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {activeShift ? 'Tutup Shift Kasir (Closing)' : 'Buka Shift Kasir (Modal Awal)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Kasir: <span className="font-semibold text-slate-700">{user?.name}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="m-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Closing Recap Result Screen */}
        {closingRecap ? (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Shift Kasir Berhasil Ditutup</h4>
              <p className="text-xs text-slate-500 mt-0.5">Rekapitulasi fisik laci kasir telah tercatat di sistem</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Modal Awal:</span>
                <span className="font-medium text-slate-800">
                  Rp {Number(closingRecap.starting_cash).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Penjualan Tunai:</span>
                <span className="font-medium text-slate-800">
                  +Rp {Number(closingRecap.cash_sales).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-800 font-semibold pt-1 border-t border-slate-200">
                <span>Ekspektasi Uang di Laci:</span>
                <span>Rp {Number(closingRecap.expected_ending_cash).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold">
                <span>Uang Fisik Closing:</span>
                <span>Rp {Number(closingRecap.actual_ending_cash).toLocaleString('id-ID')}</span>
              </div>
              
              <div className={`p-2.5 rounded-lg flex items-center justify-between font-bold text-xs mt-2 ${
                closingRecap.difference_status === 'balanced'
                  ? 'bg-emerald-100 text-emerald-800'
                  : closingRecap.difference_status === 'surplus'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                <span>Status Selisih Kas:</span>
                <span>
                  {closingRecap.difference_status === 'balanced' && 'SESUAI (Rp 0)'}
                  {closingRecap.difference_status === 'surplus' && `LEBIH (+Rp ${Number(closingRecap.difference).toLocaleString('id-ID')})`}
                  {closingRecap.difference_status === 'shortage' && `MINUS (Rp ${Number(closingRecap.difference).toLocaleString('id-ID')})`}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setClosingRecap(null);
                onClose();
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Selesai & Keluar
            </button>
          </div>
        ) : !activeShift ? (
          /* FORM BUKA SHIFT */
          <form onSubmit={handleOpenShift} className="p-5 space-y-4">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs flex items-start gap-2">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Sebelum memulai pesanan, masukkan nominal uang tunai modal kembalian awal yang ada di laci kasir.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Modal Awal Laci Kasir (Rp) *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="Contoh: 200000"
                value={startingCash}
                onChange={(e) => setStartingCash(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Quick Denominations */}
            <div className="flex gap-2">
              {[100000, 200000, 300000, 500000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setStartingCash(amt.toString())}
                  className="flex-1 py-1.5 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-600 hover:border-amber-500 hover:text-amber-700 cursor-pointer bg-slate-50"
                >
                  {(amt / 1000).toFixed(0)}k
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Membuka...' : 'Buka Shift Sekarang'}
              </button>
            </div>
          </form>
        ) : (
          /* FORM TUTUP SHIFT */
          <form onSubmit={handleCloseShift} className="p-5 space-y-4">
            {/* Live shift brief */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Dibuka Sejak:</span>
                <span className="font-medium text-slate-700">
                  {new Date(activeShift.started_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Modal Awal Kasir:</span>
                <span className="font-semibold text-slate-800">
                  Rp {Number(activeShift.starting_cash).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Penjualan Tunai ({activeShift.current_orders_count || 0} nota):</span>
                <span className="font-semibold text-slate-800">
                  +Rp {Number(activeShift.current_cash_sales || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-amber-900 font-bold pt-1 border-t border-slate-200">
                <span>Ekspektasi Fisik di Laci:</span>
                <span>
                  Rp {(Number(activeShift.starting_cash) + Number(activeShift.current_cash_sales || 0)).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hitungan Uang Fisik Aktual di Laci (Rp) *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="Masukkan total uang cash fisik..."
                value={actualEndingCash}
                onChange={(e) => setActualEndingCash(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Live Difference preview */}
            {actualEndingCash !== '' && !isNaN(Number(actualEndingCash)) && (
              (() => {
                const exp = Number(activeShift.starting_cash) + Number(activeShift.current_cash_sales || 0);
                const act = Number(actualEndingCash);
                const diff = act - exp;
                return (
                  <div className={`p-2.5 rounded-xl text-xs font-bold flex justify-between ${
                    diff === 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    diff > 0 ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                    'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    <span>Kalkulasi Selisih Kas:</span>
                    <span>
                      {diff === 0 && 'Sesuai (Seimbang)'}
                      {diff > 0 && `Lebih (+Rp ${diff.toLocaleString('id-ID')})`}
                      {diff < 0 && `Minus (Rp ${diff.toLocaleString('id-ID')})`}
                    </span>
                  </div>
                );
              })()
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Catatan Shift (Opsional)</label>
              <textarea
                rows={2}
                placeholder="Keterangan jika terdapat selisih kas atau titipan operasional..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Memproses Closing...' : 'Tutup Shift Kasir'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
