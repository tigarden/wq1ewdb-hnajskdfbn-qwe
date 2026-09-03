import React, { useState } from 'react';
import Navbar from './components/Navbar';
import QuickAddModal from './components/QuickAddModal';
import LockScreen from './components/LockScreen';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import OtherSettlements from './pages/OtherSettlements';
import PartsCatalog from './pages/PartsCatalog';
import Settings from './pages/Settings';
import { useData } from './context/DataContext';

export default function App() {
  const { isUnlocked, unlockApp } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // If locked, show LockScreen
  if (!isUnlocked) {
    return <LockScreen onUnlock={unlockApp} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        Debet.auto — Учет клиентов: Тотус, Тотус 2, Эрик, Витя • Защищено AES-256
      </footer>
    </div>
  );
}
