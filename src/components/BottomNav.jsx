import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Laptop, 
  BarChart3, 
  UtensilsCrossed, 
  Users, 
  Settings,
  Clock
} from 'lucide-react';

export default function BottomNav({ currentView, setCurrentView, ownerActiveTab, setOwnerActiveTab }) {
  const { isOwner } = useAuth();

  const ownerNavItems = [
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'menu', label: 'Produk', icon: UtensilsCrossed },
    { id: 'pos', label: 'Buka POS', icon: Laptop, isPos: true, isCenter: true },
    { id: 'cashiers', label: 'Staf', icon: Users },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  const cashierNavItems = [
    { id: 'pos', label: 'Buka POS', icon: Laptop, isPos: true, isCenter: true },
    { id: 'shifts', label: 'Shift', icon: Clock }
  ];

  const items = isOwner ? ownerNavItems : cashierNavItems;

  const handleItemClick = (item) => {
    if (item.isPos) {
      setCurrentView('pos');
    } else {
      setCurrentView('owner');
      if (setOwnerActiveTab) {
        setOwnerActiveTab(item.id);
      }
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-2 py-1 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.isPos 
          ? currentView === 'pos' 
          : currentView === 'owner' && ownerActiveTab === item.id;

        if (item.isCenter) {
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="flex flex-col items-center justify-center -mt-5 transition-transform cursor-pointer active:scale-95"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isActive 
                  ? 'bg-amber-500 text-white ring-4 ring-amber-100 shadow-amber-500/30' 
                  : 'bg-amber-500 text-white shadow-amber-500/20'
              }`}>
                <Icon className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className={`text-[10px] font-bold mt-1 ${isActive ? 'text-amber-600' : 'text-slate-700'}`}>
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              isActive 
                ? 'text-amber-600 font-bold bg-amber-50/80' 
                : 'text-slate-500 font-medium hover:text-slate-900'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-amber-600 stroke-[2.5]' : 'text-slate-500'}`} />
            <span className="text-[10px] tracking-tight truncate max-w-full">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
