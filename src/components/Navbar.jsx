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
    { id: 'income', label: 'Очередь цен', icon: DollarSign, badge: incomeStats?.pendingCount },
    { id: 'other', label: 'Контрагенты', icon: UserCheck },
    { id: 'parts', label: 'Каталог', icon: Search },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <>
      {/* Top Header Toolbar */}
      <header className="sticky top-0 z-40 bg-[#080b12]/95 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Brand */}
            <div 
              className="flex items-center space-x-2.5 cursor-pointer select-none" 
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                D
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tracking-tight text-white uppercase font-mono">
                  Debet<span className="text-blue-400">.auto</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-400 font-mono border border-slate-700">
                  ₴ UAH
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1 p-1 rounded-lg bg-[#0d121d] border border-white/[0.06]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`h-8 px-3 rounded-md text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-xs border border-white/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="h-4 min-w-[16px] px-1 rounded-full text-[10px] font-bold font-mono inline-flex items-center justify-center bg-amber-500 text-slate-950">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Quick Controls */}
            <div className="flex items-center space-x-2">
              
              {/* Cloud Sync Status */}
              <div className="flex items-center">
                {syncStatus === 'syncing' ? (
                  <div className="h-8 px-2.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium inline-flex items-center space-x-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span className="hidden sm:inline text-[11px]">Обновление...</span>
                  </div>
                ) : syncStatus === 'synced' ? (
                  <button 
                    onClick={() => pushToGitHub()} 
                    title={`Синхронизировано: ${lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString('ru-RU') : 'только что'}`}
                    className="h-8 px-2.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 transition-colors inline-flex items-center space-x-1.5 font-mono text-[11px]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <Cloud className="w-3 h-3" />
                    <span className="hidden sm:inline">Синхронно</span>
                  </button>
                ) : syncStatus === 'unsaved' ? (
                  <button
                    onClick={() => pushToGitHub()}
                    className="h-8 px-2.5 rounded-md bg-amber-500 text-slate-950 font-bold text-xs inline-flex items-center space-x-1.5 shadow-sm"
                    title="Есть несохраненные данные в облако"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Сохранить</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="h-8 px-2.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800 text-[11px] font-medium hover:text-slate-200 transition-colors inline-flex items-center space-x-1.5"
                    title="Оффлайн"
                  >
                    <CloudOff className="w-3 h-3 text-slate-500" />
                    <span className="hidden sm:inline">Оффлайн</span>
                  </button>
                )}
              </div>

              {/* Export to Excel (.xlsx) */}
              <button
                onClick={exportToExcel}
                title="Экспорт в Excel (.xlsx)"
                className="h-8 px-2.5 rounded-md text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium inline-flex items-center space-x-1.5 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xl:inline">Excel</span>
              </button>

              {/* Install PWA Button (only if not running in standalone mode) */}
              {!isStandalone && onOpenInstallModal && (
                <button
                  onClick={onOpenInstallModal}
                  title="Добавить приложение на рабочий стол"
                  className="h-8 px-2 sm:px-2.5 rounded-md text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 border border-blue-500/20 text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">На экран</span>
                </button>
              )}

              {/* Lock Button */}
              <button
                onClick={lockApp}
                title="Заблокировать экран"
                className="h-8 w-8 rounded-md text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>

              {/* Primary Quick Add Button */}
              <button
                onClick={onOpenQuickAdd}
                className="btn-sm bg-blue-600 hover:bg-blue-500 text-white shadow-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Запись</span>
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d121d]/98 backdrop-blur-xl border-t border-white/[0.08] px-1 py-1 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
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
              <span className="truncate max-w-[56px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

