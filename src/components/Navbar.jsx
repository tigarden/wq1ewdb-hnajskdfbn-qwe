import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  UserCheck, 
  Search, 
  Settings, 
  Plus, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  FileSpreadsheet, 
  Lock,
  Smartphone
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePWA } from '../hooks/usePWA';

export default function Navbar({ activeTab, setActiveTab, onOpenQuickAdd, onOpenInstallModal }) {
  const { syncStatus, lastSyncTime, pushToGitHub, exportToExcel, lockApp, incomeStats } = useData();
  const { isStandalone } = usePWA();

  const navItems = [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { id: 'clients', label: 'Клиенты', icon: Users },
    { id: 'income', label: 'Очередь', icon: DollarSign, badge: incomeStats?.pendingCount },
    { id: 'other', label: 'Контрагенты', icon: UserCheck },
    { id: 'parts', label: 'Каталог', icon: Search },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <>
      {/* Top Header Command Bar (Desktop & Mobile Header) */}
      <header className="sticky top-0 z-40 bg-[#080b12]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Brand */}
            <div 
              className="flex items-center space-x-2.5 cursor-pointer select-none group" 
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/25 border border-white/20 group-hover:scale-105 transition-transform">
                D
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tracking-tight text-white uppercase font-mono">
                  Debet<span className="text-blue-400">.auto</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 font-mono border border-white/10 shadow-inner">
                  ₴ UAH
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs (Segmented Glass Pills) */}
            <nav className="hidden md:flex items-center space-x-1 p-1 rounded-xl bg-slate-950/70 border border-white/[0.08] backdrop-blur-md shadow-inner">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center space-x-1.5 transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-xs border border-white/15'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="h-4 min-w-[16px] px-1 rounded-full text-[10px] font-bold font-mono inline-flex items-center justify-center bg-amber-500 text-slate-950 shadow-xs animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Quick Controls */}
            <div className="flex items-center space-x-2">
              
              {/* Cloud Sync Status Pill */}
              <div className="flex items-center">
                {syncStatus === 'syncing' ? (
                  <div className="h-8 px-2.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/25 text-xs font-medium inline-flex items-center space-x-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                    <span className="hidden sm:inline text-[11px] font-mono">Обновление...</span>
                  </div>
                ) : syncStatus === 'synced' ? (
                  <button 
                    onClick={() => pushToGitHub()} 
                    title={`Синхронизировано: ${lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString('ru-RU') : 'только что'}`}
                    className="h-8 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-xs font-medium hover:bg-emerald-500/20 transition-colors inline-flex items-center space-x-1.5 font-mono text-[11px]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                    <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Синхронно</span>
                  </button>
                ) : syncStatus === 'unsaved' ? (
                  <button
                    onClick={() => pushToGitHub()}
                    className="h-8 px-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs inline-flex items-center space-x-1.5 shadow-sm shadow-amber-500/20 active:scale-95 transition-transform"
                    title="Есть несохраненные данные в облако"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Сохранить</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="h-8 px-2.5 rounded-lg bg-slate-950 text-slate-400 border border-white/10 text-[11px] font-medium hover:text-slate-200 transition-colors inline-flex items-center space-x-1.5"
                    title="Оффлайн режим"
                  >
                    <CloudOff className="w-3 h-3 text-slate-500" />
                    <span className="hidden sm:inline font-mono">Оффлайн</span>
                  </button>
                )}
              </div>

              {/* Export to Excel (.xlsx) */}
              <button
                onClick={exportToExcel}
                title="Экспорт в Excel (.xlsx)"
                className="h-8 px-2.5 rounded-lg text-slate-300 hover:text-white bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-xs font-medium inline-flex items-center space-x-1.5 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xl:inline">Excel</span>
              </button>

              {/* Install PWA Button (only if not running in standalone mode) */}
              {!isStandalone && onOpenInstallModal && (
                <button
                  onClick={onOpenInstallModal}
                  title="Добавить приложение на рабочий стол"
                  className="h-8 px-2 sm:px-2.5 rounded-lg text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 border border-blue-500/25 text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">На экран</span>
                </button>
              )}

              {/* Lock Button */}
              <button
                onClick={lockApp}
                title="Заблокировать экран"
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-400 bg-slate-950/80 hover:bg-slate-900 border border-white/10 flex items-center justify-center transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>

              {/* Primary Quick Add Button (Desktop) */}
              <button
                onClick={onOpenQuickAdd}
                className="hidden sm:inline-flex btn-sm btn-primary font-bold shadow-md shadow-blue-500/25"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Запись</span>
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Mobile Floating Glass Dock (Concept A) */}
      <div className="md:hidden fixed bottom-3 inset-x-3 z-50">
        <div className="glass-dock rounded-2xl px-2 py-1.5 flex items-center justify-between shadow-2xl">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            // Put prominent "+" button right in the middle (after item 2)
            const isMiddle = index === 2;

            return (
              <React.Fragment key={item.id}>
                {isMiddle && (
                  <button
                    onClick={onOpenQuickAdd}
                    aria-label="Быстро добавить запись"
                    className="w-11 h-11 -my-2 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 border border-white/25 active:scale-95 transition-transform"
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </button>
                )}

                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
                    isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-4 h-4 mb-0.5" />
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-2 px-1 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950 font-mono">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="truncate max-w-[50px]">{item.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </>
  );
}

