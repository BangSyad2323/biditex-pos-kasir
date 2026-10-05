import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { UserCheck, Plus, Edit3, Trash2, ShieldCheck, Power, X, AlertCircle } from 'lucide-react';

export default function CashierManagement() {
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchCashiers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cashiers');
      setCashiers(res.data.data || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Gagal memuat daftar kasir.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashiers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || (!form.id && !form.password)) {
      alert('Nama, email, dan kata sandi wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      if (form.id) {
        await api.put(`/cashiers/${form.id}`, form);
        setMessage({ type: 'success', text: 'Data kasir berhasil diperbarui.' });
      } else {
        await api.post('/cashiers', form);
        setMessage({ type: 'success', text: 'Akun kasir baru berhasil dibuat.' });
      }
      setShowModal(false);
      setForm({ id: null, name: '', email: '', password: '' });
      await fetchCashiers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menyimpan akun kasir.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (cashier) => {
    const nextStatus = cashier.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/cashiers/${cashier.id}/status`, { status: nextStatus });
      setMessage({ type: 'success', text: `Status kasir "${cashier.name}" diubah menjadi ${nextStatus}.` });
      await fetchCashiers();
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal mengubah status kasir.' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus akun kasir "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await api.delete(`/cashiers/${id}`);
      setMessage({ type: 'success', text: 'Akun kasir berhasil dihapus.' });
      await fetchCashiers();
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal menghapus kasir.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert message */}
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

      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Kelola Akun Staf Kasir (POS Operator)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftarkan staf kasir yang bertugas di laci POS, atur hak akses, atau nonaktifkan akun saat staf cuti/berhenti.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({ id: null, name: '', email: '', password: '' });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Akun Kasir</span>
        </button>
      </div>

      {/* Cashier Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-500">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Memuat data staf kasir...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Nama Staf</th>
                  <th className="py-3.5 px-4">Email Login</th>
                  <th className="py-3.5 px-4">Peran</th>
                  <th className="py-3.5 px-4">Status Akun</th>
                  <th className="py-3.5 px-4">Terdaftar</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cashiers.map((cashier) => (
                  <tr key={cashier.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {cashier.name.charAt(0)}
                      </div>
                      <span>{cashier.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {cashier.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        Kasir POS
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(cashier)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                          cashier.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Klik untuk mengubah status aktif/non-aktif"
                      >
                        <Power className="w-3 h-3" />
                        <span>{cashier.status === 'active' ? 'Aktif' : 'Non-Aktif'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(cashier.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setForm({ id: cashier.id, name: cashier.name, email: cashier.email, password: '' });
                            setShowModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Kasir"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cashier.id, cashier.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Kasir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal CRUD Kasir */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {form.id ? 'Edit Akun Kasir' : 'Daftarkan Staf Kasir Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Lengkap Kasir *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Login Kasir *</label>
                <input
                  type="email"
                  required
                  placeholder="budi@kasirku.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kata Sandi {form.id ? '(Kosongkan jika tidak diubah)' : '*'}
                </label>
                <input
                  type="password"
                  required={!form.id}
                  placeholder="Minimal 6 karakter"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Akun Kasir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
