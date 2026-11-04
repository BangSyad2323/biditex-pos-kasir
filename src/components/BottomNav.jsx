import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  Laptop,
  BarChart3,
  TrendingUp,
  UtensilsCrossed,
  Users,
  Settings,
  Clock,
} from "lucide-react";

export default function BottomNav({
  currentView,
  setCurrentView,
  ownerActiveTab,
  setOwnerActiveTab,
}) {
  const { isOwner } = useAuth();

  // Jika yang login KASIR, jangan tampilkan BottomNav sama sekali
  if (!isOwner) {
    return null;
  }

  // 6 Menu Owner Utama
  const leftNavItems = [
    { id: "reports", label: "Laporan", icon: BarChart3 },
    { id: "analytics", label: "Grafik", icon: TrendingUp },
    { id: "menu", label: "Menu", icon: UtensilsCrossed },
  ];

  const rightNavItems = [
    { id: "cashiers", label: "Staf", icon: Users },
    { id: "shifts", label: "Shift", icon: Clock },
    { id: "settings", label: "Setelan", icon: Settings },
  ];

  const handleTabClick = (tabId) => {
    setCurrentView("owner");
    if (setOwnerActiveTab) {
      setOwnerActiveTab(tabId);
    }
  };

  const isPosActive = currentView === "pos";

  return (
    <div className="md:hidden fixed bottom-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-1 py-1 flex items-center justify-between">
      {/* 3 Menu Kiri: Laporan, Grafik, Menu */}
      <div className="flex items-center justify-around flex-1">
        {leftNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentView === "owner" && ownerActiveTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "text-amber-600 font-bold bg-amber-50/80"
                  : "text-slate-500 font-medium hover:text-slate-900"
              }`}
            >
              <Icon
                className={`w-4 h-4 mb-0.5 ${
                  isActive ? "text-amber-600 stroke-[2.5]" : "text-slate-500"
                }`}
              />
              <span className="text-[9px] tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tombol Tengah Rahasia: Buka POS */}
      <div className="px-1 shrink-0">
        <button
          onClick={() => setCurrentView("pos")}
          className="flex flex-col items-center justify-center -mt-5 transition-transform cursor-pointer active:scale-95"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isPosActive
                ? "bg-amber-500 text-white ring-4 ring-amber-100 shadow-amber-500/30"
                : "bg-amber-500 text-white shadow-amber-500/20"
            }`}
          >
            <Laptop className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span
            className={`text-[9px] font-bold mt-0.5 ${
              isPosActive ? "text-amber-600" : "text-slate-700"
            }`}
          >
            POS
          </span>
        </button>
      </div>

      {/* 3 Menu Kanan: Staf, Shift, Setelan */}
      <div className="flex items-center justify-around flex-1">
        {rightNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentView === "owner" && ownerActiveTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "text-amber-600 font-bold bg-amber-50/80"
                  : "text-slate-500 font-medium hover:text-slate-900"
              }`}
            >
              <Icon
                className={`w-4 h-4 mb-0.5 ${
                  isActive ? "text-amber-600 stroke-[2.5]" : "text-slate-500"
                }`}
              />
              <span className="text-[9px] tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
