import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import OwnerDashboard from './components/owner/OwnerDashboard';
import PosScreen from './components/pos/PosScreen';
import ShiftModal from './components/pos/ShiftModal';
import CustomerReceiptModal from './components/pos/CustomerReceiptModal';
import api from './services/api';

function MainLayout() {
  const { user, loading, isOwner, tenant, settings } = useAuth();
  const [currentView, setCurrentView] = useState('pos'); // 'owner' | 'pos'
  const [ownerActiveTab, setOwnerActiveTab] = useState('reports');
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showArchitectureModal, setShowArchitectureModal] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);

  // Role-based automatic redirect (HANYA saat pertama kali login):
  // Owner -> Redirection otomatis ke Dashboard Owner
  // Kasir -> Redirection otomatis ke Layar POS Kasir
  // TIDAK BOLEH re-redirect saat refreshContext() dipanggil setelah transaksi,
  // karena akan memindahkan Owner dari POS dan struk gagal dicetak.
  const initialRedirectDone = React.useRef(false);
  useEffect(() => {
    if (user && !initialRedirectDone.current) {
      initialRedirectDone.current = true;
      if (user.role === 'owner') {
        setCurrentView('owner');
      } else {
        setCurrentView('pos');
      }
    }
    if (!user) {
      initialRedirectDone.current = false;
    }
  }, [user]);

  const handleOpenOrderDetail = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setSelectedOrderDetail(res.data.order);
      setShowOrderDetailModal(true);
    } catch (err) {
      console.error('Failed to load order detail:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold tracking-wide text-slate-300">Memuat Sistem KasirKu Digital...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={(loggedUser) => {
      if (loggedUser.role === 'owner') {
        setCurrentView('owner');
      } else {
        setCurrentView('pos');
      }
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col pb-16 md:pb-0">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenShiftModal={() => setShowShiftModal(true)}
        onOpenArchitectureModal={() => setShowArchitectureModal(true)}
      />

      {/* Main View: Owner Dashboard or POS Screen */}
      <main className="flex-1">
        {currentView === 'owner' && isOwner ? (
          <OwnerDashboard
            onOpenPOS={() => setCurrentView('pos')}
            onOpenOrderDetail={handleOpenOrderDetail}
            activeTab={ownerActiveTab}
            setActiveTab={setOwnerActiveTab}
          />
        ) : (
          <PosScreen />
        )}
      </main>

      {/* Bottom Mobile/Tablet Navigation Bar */}
      <BottomNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        ownerActiveTab={ownerActiveTab}
        setOwnerActiveTab={setOwnerActiveTab}
      />

      {/* Shift Modal (Buka / Tutup Kasir) */}
      <ShiftModal
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
      />

      {/* Order Detail & Receipt Modal for Reports */}
      {showOrderDetailModal && selectedOrderDetail && (
        <CustomerReceiptModal
          isOpen={showOrderDetailModal}
          onClose={() => setShowOrderDetailModal(false)}
          order={selectedOrderDetail}
          tenant={tenant}
          settings={settings}
        />
      )}
    </div>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
