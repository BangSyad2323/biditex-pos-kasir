import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Lock, Mail, Store, ShieldCheck, UserCheck, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Mohon lengkapi email dan kata sandi.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await login(email, password);
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail, userPassword) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 flex items-center justify-center p-4">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100/20 overflow-hidden p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 mb-4 transform hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              KasirKu Digital
            </h1>
            <p className="text-xs uppercase tracking-wider font-semibold text-amber-600 mt-1">
              Restoran Berkah Nusantara
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Sistem Manajemen POS & Keuangan Restoran
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-semibold">Autentikasi Gagal</p>
                <p className="text-rose-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@kasirku.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Fillers for Seeder Demo */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
              Akun Default Database Seeder
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillCredentials('owner@kasirku.com', 'password')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-500/40 bg-slate-50/70 hover:bg-amber-50/50 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Owner Resto</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate group-hover:text-slate-700">owner@kasirku.com</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">pass: password</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('kasir@kasirku.com', 'password')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500/40 bg-slate-50/70 hover:bg-blue-50/50 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 mb-0.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Kasir Syafira</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate group-hover:text-slate-700">kasir@kasirku.com</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">pass: password</div>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-3">
              Role Owner otomatis ke Dashboard, Role Kasir otomatis ke POS.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-400 flex items-center justify-center gap-2">
          <span>MariaDB & Laravel Sanctum Ready</span>
          <span>•</span>
          <span>Single Entry Point</span>
        </div>
      </div>
    </div>
  );
}
