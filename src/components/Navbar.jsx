import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UtensilsCrossed, 
  LogOut, 
  Store, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  Terminal, 
  LayoutDashboard, 
  Laptop,
  Coins
} from 'lucide-react';

export default function Navbar({ currentView, setCurrentView}) {
  const { user, tenant, activeShift, logout, isOwner } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      await logout();
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base font-sans">
                  KasirKu Digital
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  F&B POS
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Store className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-700">{tenant?.name || 'Restoran Berkah Nusantara'}</span>
                <span className="text-slate-300">•</span>
                <span>{tenant?.branch || 'Cabang Utama'}</span>
              </div>
            </div>
          </div>

      

            {/* Owner Master Access Switcher */}
            {isOwner && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => setCurrentView('owner')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'owner'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setCurrentView('pos')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'pos'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Owner Master Access: Akses Langsung Kasir POS"
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Buka POS</span>
                </button>
              </div>
            )}

            {/* User Profile Tag */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden lg:block">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {user?.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {isOwner ? 'Owner (Master Access)' : 'Staf Kasir'}
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                isOwner ? 'bg-amber-600 ring-2 ring-amber-200' : 'bg-blue-600 ring-2 ring-blue-200'
              }`}>
                {isOwner ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Keluar dari Akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
    </header>
  );
}
