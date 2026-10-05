import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Clock, CheckCircle2, AlertTriangle, Coins, Calendar, FileText } from 'lucide-react';

export default function ShiftHistory() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/shifts/history');
        setShifts(res.data.data || res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Riwayat Shift & Rekap Kas Laci Kasir
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit laci kasir: modal awal, total tunai, fisik closing, dan selisih (Sesuai / Minus / Lebih)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-500">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Memuat rekap riwayat shift kasir...</p>
          </div>
        ) : shifts.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">Belum Ada Riwayat Shift</p>
            <p className="text-xs text-slate-400 mt-1">Shift kasir yang telah ditutup akan terdata di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Kasir / Operator</th>
                  <th className="py-3.5 px-4">Waktu Buka</th>
                  <th className="py-3.5 px-4">Waktu Tutup</th>
                  <th className="py-3.5 px-4 text-right">Modal Awal</th>
                  <th className="py-3.5 px-4 text-right">Ekspektasi Kas</th>
                  <th className="py-3.5 px-4 text-right">Fisik Closing</th>
                  <th className="py-3.5 px-4 text-center">Status Selisih</th>
                  <th className="py-3.5 px-4">Status Shift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shifts.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {s.user_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(s.started_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {s.ended_at ? new Date(s.ended_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : (
                        <span className="text-emerald-600 font-semibold italic">Sedang Berjalan</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                      Rp {Number(s.starting_cash).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                      {s.expected_ending_cash ? `Rp ${Number(s.expected_ending_cash).toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {s.actual_ending_cash ? `Rp ${Number(s.actual_ending_cash).toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {s.difference_status === 'balanced' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Sesuai (Rp 0)
                        </span>
                      )}
                      {s.difference_status === 'surplus' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                          Lebih (+Rp {Number(s.difference).toLocaleString('id-ID')})
                        </span>
                      )}
                      {s.difference_status === 'shortage' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                          Minus (Rp {Number(s.difference).toLocaleString('id-ID')})
                        </span>
                      )}
                      {!s.difference_status && <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        s.status === 'open'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.status === 'open' ? 'Buka' : 'Selesai'}
                      </span>
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
