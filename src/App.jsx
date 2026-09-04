import React, { useState } from 'react';
import Navbar from './components/Navbar';
import QuickAddModal from './components/QuickAddModal';
import LockScreen from './components/LockScreen';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import IncomeAndQueue from './pages/IncomeAndQueue';
import OtherSettlements from './pages/OtherSettlements';
import PartsCatalog from './pages/PartsCatalog';
import Settings from './pages/Settings';
import { useData } from './context/DataContext';

export default function App() {
  const { isUnlocked, unlockApp } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  if (!isUnlocked) {
    return <LockScreen onUnlock={unlockApp} />;
  }

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 pb-20 md:pb-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onSelectClient={(id) => setSelectedClientId(id)}
          />
        )}

        {activeTab === 'clients' && (
          <Clients
            selectedClientId={selectedClientId}
            onSelectClient={(id) => setSelectedClientId(id)}
          />
        )}

        {activeTab === 'income' && (
          <IncomeAndQueue />
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

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-500 mb-14 md:mb-0">
        Debet.auto — Учет взаиморасчетов, запчастей и доходов • Защита AES-256
      </footer>
    </div>
  );
}
