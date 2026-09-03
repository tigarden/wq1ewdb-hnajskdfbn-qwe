import React, { useState } from 'react';
import Navbar from './components/Navbar';
import QuickAddModal from './components/QuickAddModal';
import LockScreen from './components/LockScreen';
import Dashboard from './pages/Dashboard';
import Suppliers from './pages/Suppliers';
import CarOrders from './pages/CarOrders';
import OtherSettlements from './pages/OtherSettlements';
import PartsCatalog from './pages/PartsCatalog';
import Settings from './pages/Settings';
import { useData } from './context/DataContext';

export default function App() {
  const { isUnlocked, unlockApp } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // If not authenticated, show PIN Lock Screen
  if (!isUnlocked) {
    return <LockScreen onUnlock={unlockApp} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onSelectSupplier={(id) => setSelectedSupplierId(id)}
            onSelectCar={(id) => setSelectedCarId(id)}
          />
        )}

        {activeTab === 'suppliers' && (
          <Suppliers
            selectedSupplierId={selectedSupplierId}
            onSelectSupplier={(id) => setSelectedSupplierId(id)}
          />
        )}

        {activeTab === 'cars' && (
          <CarOrders
            selectedCarId={selectedCarId}
            onSelectCar={(id) => setSelectedCarId(id)}
          />
        )}

        {activeTab === 'other' && (
          <OtherSettlements />
        )}

        {activeTab === 'parts' && (
          <PartsCatalog />
        )}

        {activeTab === 'settings' && (
          <Settings />
        )}
      </main>

      {/* Global Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        Debet.auto — Защищено сквозным шифрованием AES-256 • Синхронизация @tigarden
      </footer>
    </div>
  );
}
