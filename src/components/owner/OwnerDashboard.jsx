import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  UtensilsCrossed,
  Users,
  Settings,
  Clock,
  Laptop,
  ChevronRight
} from 'lucide-react';
import FinancialReports from './FinancialReports';
import MenuManagement from './MenuManagement';
import CashierManagement from './CashierManagement';
import StoreSettings from './StoreSettings';
import ShiftHistory from './ShiftHistory';
import AnalyticsScreen from './AnalyticsScreen';

export default function OwnerDashboard({ onOpenPOS, onOpenOrderDetail, activeTab = 'reports', setActiveTab }) {
  const [internalTab, setInternalTab] = useState('reports');
  const currentTab = setActiveTab ? activeTab : internalTab;
  const changeTab = setActiveTab || setInternalTab;

  const navItems = [
    { id: 'reports', label: 'Laporan & Laba Bersih', icon: BarChart3 },
    { id: 'analytics', label: 'Grafik & Analitik', icon: TrendingUp },
    { id: 'menu', label: 'Menu & Katalog HPP', icon: UtensilsCrossed },
    { id: 'cashiers', label: 'Kelola Staf Kasir', icon: Users },
    { id: 'settings', label: 'Pengaturan Toko', icon: Settings },
    { id: 'shifts', label: 'Audit Shift Laci', icon: Clock },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  py-6 space-y-6">
      {/* Top Welcome & Navigation Bar (Desktop Only) */}
      <div className="hidden md:flex bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Navigation Tabs (Desktop) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => changeTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isActive
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>


      {/* Main Tab Content */}
      <div className="transition-all duration-200">
        {currentTab === 'reports' && <FinancialReports onOpenOrderDetail={onOpenOrderDetail} />}
        {currentTab === 'analytics' && <AnalyticsScreen />}
        {currentTab === 'menu' && <MenuManagement />}
        {currentTab === 'cashiers' && <CashierManagement />}
        {currentTab === 'settings' && <StoreSettings />}
        {currentTab === 'shifts' && <ShiftHistory />}
      </div>
    </div>
  );
}

