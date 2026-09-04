import React, { useState } from 'react';
import Navbar from './components/Navbar';
import QuickAddModal from './components/QuickAddModal';
import InstallAppModal from './components/InstallAppModal';
import InstallAppBanner from './components/InstallAppBanner';
import LockScreen from './components/LockScreen';
import { useData } from './context/DataContext';

import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import IncomeAndQueue from './pages/IncomeAndQueue';
import OtherSettlements from './pages/OtherSettlements';
import PartsCatalog from './pages/PartsCatalog';
import Settings from './pages/Settings';

export default function App() {
  const { isUnlocked, isCheckingSession, unlockApp } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [partsQuery, setPartsQuery] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Prevent lock screen flash while verifying crypto session token
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#080b12] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isUnlocked) {
    return <LockScreen onUnlock={unlockApp} />;
  }

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      <main className="flex-1 max-w-[1680px] 2xl:max-w-[1880px] w-full mx-auto px-3.5 sm:px-6 lg:px-8 2xl:px-10 py-4 sm:py-5 pb-[calc(env(safe-area-inset-bottom,0px)+6.5rem)] md:pb-8">
        <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
          <Dashboard
            setActiveTab={setActiveTab}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onSelectClient={(id) => setSelectedClientId(id)}
            onSearchParts={(q) => setPartsQuery(q)}
          />
        </div>

        <div className={activeTab === 'clients' ? 'block' : 'hidden'}>
          <Clients
            selectedClientId={selectedClientId}
            onSelectClient={(id) => setSelectedClientId(id)}
          />
        </div>

        <div className={activeTab === 'income' ? 'block' : 'hidden'}>
          <IncomeAndQueue />
        </div>

        <div className={activeTab === 'other' ? 'block' : 'hidden'}>
          <OtherSettlements />
        </div>

        <div className={activeTab === 'parts' ? 'block' : 'hidden'}>
          <PartsCatalog initialQuery={partsQuery} />
        </div>

        <div className={activeTab === 'settings' ? 'block' : 'hidden'}>
          <Settings />
        </div>
      </main>

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      <InstallAppBanner
        onOpenModal={() => setIsInstallModalOpen(true)}
      />

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-500 mb-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] md:mb-0">
        Debet.auto — Учет клиентов, автозапчастей и оплат
      </footer>
    </div>
  );
}
