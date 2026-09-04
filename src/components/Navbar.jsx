import React, { useState } from 'react';
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
  Smartphone,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePWA } from '../hooks/usePWA';

export default function Navbar({ activeTab, setActiveTab, onOpenQuickAdd, onOpenInstallModal }) {
  const { syncStatus, lastSyncTime, pushToGitHub, exportToExcel, lockApp, incomeStats, settings } = useData();
  const { isStandalone } = usePWA();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { id: 'clients', label: 'Клиенты', icon: Users },
    { id: 'income', label: 'Очередь', icon: DollarSign, badge: incomeStats?.pendingCount },
    { id: 'other', label: 'Контрагенты', icon: UserCheck },
    { id: 'parts', label: 'Каталог', icon: Search },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setIsMoreMenuOpen(false);
  };

  const isMoreActive = ['other', 'parts', 'settings'].includes(activeTab);

  return (
    <>
      {/* Top Header Command Bar (Desktop & Mobile Header) with Dynamic Island Safe Area */}
      <header className="sticky top-0 z-40 bg-[#080b12]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-xs dynamic-island-header">
        <div className="max-w-[1680px] 2xl:max-w-[1880px] mx-auto px-3 sm:px-6 lg:px-8 2xl:px-10">
          <div className="flex items-center justify-between h-14 2xl:h-16">
            
            {/* Brand */}
            <div 
              className="flex items-center space-x-2.5 cursor-pointer select-none group" 
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-8 h-8 2xl:w-8 2xl:h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white font-black text-xs 2xl:text-sm shadow-md shadow-blue-500/25 border border-white/20 group-hover:scale-105 transition-transform">
                D
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-base 2xl:text-base font-bold tracking-tight text-white uppercase font-mono">
                  Debet<span className="text-blue-400">.auto</span>
                </span>
                <span className="hidden sm:inline-block text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono border border-white/10 shadow-inner">
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
                    className={`relative h-8 2xl:h-9 px-3 2xl:px-4 rounded-lg text-xs 2xl:text-sm font-semibold inline-flex items-center space-x-1.5 transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-xs border border-white/15'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="h-4.5 min-w-[18px] px-1.5 rounded-full text-xs font-bold font-mono inline-flex items-center justify-center bg-amber-500 text-slate-950 shadow-xs animate-pulse">
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
                  <div className="h-9 px-2.5 sm:px-3 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/25 text-xs font-medium inline-flex items-center space-x-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    <span className="hidden sm:inline font-mono">Сохранение...</span>
                  </div>
                ) : syncStatus === 'synced' ? (
                  <button 
                    onClick={() => pushToGitHub()} 
                    title={`Синхронизировано: ${lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString('ru-RU') : 'только что'}`}
                    className="h-9 px-2.5 sm:px-3 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-xs font-medium hover:bg-emerald-500/20 transition-colors inline-flex items-center space-x-1.5 font-mono active:scale-95"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <Cloud className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">Синхронно</span>
                  </button>
                ) : syncStatus === 'unsaved' ? (
                  <button
                    onClick={() => pushToGitHub()}
                    className="h-9 px-2.5 sm:px-3 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs inline-flex items-center space-x-1.5 shadow-sm shadow-amber-500/20 active:scale-95 transition-transform"
                    title="Есть несохраненные правки. Нажмите для немедленной отправки"
                  >
                    <Cloud className="w-4 h-4" />
                    <span>Сохранить</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="h-9 px-2.5 sm:px-3 rounded-xl bg-slate-900 text-slate-400 border border-white/10 text-xs font-medium hover:text-slate-200 transition-colors inline-flex items-center space-x-1.5 active:scale-95"
                    title="Оффлайн режим (локальное сохранение)"
                  >
                    <CloudOff className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline font-mono">Оффлайн</span>
                  </button>
                )}
              </div>

              {/* Export to Excel (.xlsx) - Desktop */}
              <button
                onClick={exportToExcel}
                title="Экспорт в Excel (.xlsx)"
                className="hidden sm:inline-flex h-9 px-3 rounded-xl text-slate-300 hover:text-white bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-xs 2xl:text-sm font-medium items-center space-x-1.5 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-emerald-400" />
                <span className="hidden xl:inline">Excel</span>
              </button>

              {/* Install PWA Button - Desktop */}
              {!isStandalone && onOpenInstallModal && (
                <button
                  onClick={onOpenInstallModal}
                  title="Добавить приложение на рабочий стол"
                  className="hidden sm:inline-flex h-9 px-3 rounded-xl text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 border border-blue-500/25 text-xs 2xl:text-sm font-semibold items-center space-x-1.5 transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
                  <span className="hidden sm:inline">На экран</span>
                </button>
              )}

              {/* Lock Button (Touch-optimized minimum 44px on mobile) */}
              <button
                onClick={lockApp}
                title="Заблокировать экран"
                aria-label="Заблокировать экран"
                className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl text-slate-400 hover:text-rose-400 active:text-rose-400 bg-slate-950/80 hover:bg-slate-900 border border-white/10 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              >
                <Lock className="w-4.5 h-4.5 sm:w-4 sm:h-4" />
              </button>

              {/* Primary Quick Add Button (Desktop) */}
              <button
                onClick={onOpenQuickAdd}
                className="hidden sm:inline-flex btn-md btn-primary font-bold shadow-md shadow-blue-500/25"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Запись</span>
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Modern iOS Bottom Tab Bar (5-Control Ergonomic Layout) */}
      <nav 
        aria-label="Мобильная навигация" 
        className="md:hidden fixed bottom-0 inset-x-0 z-50 mobile-tab-bar pb-[max(env(safe-area-inset-bottom,0px),12px)] pt-2 px-3"
      >
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => handleSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 flex-1 min-h-[50px] touch-manipulation transition-colors ${
              activeTab === 'dashboard' ? 'text-blue-400' : 'text-slate-400 active:text-slate-200'
            }`}
          >
            <div className="relative">
              <LayoutDashboard className={`w-5.5 h-5.5 mb-1 ${activeTab === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
            </div>
            <span className={`text-[12px] leading-tight tracking-tight ${activeTab === 'dashboard' ? 'font-bold' : 'font-medium'}`}>
              Дашборд
            </span>
          </button>

          {/* Tab 2: Clients */}
          <button
            onClick={() => handleSelectTab('clients')}
            className={`flex flex-col items-center justify-center py-1 flex-1 min-h-[50px] touch-manipulation transition-colors ${
              activeTab === 'clients' ? 'text-blue-400' : 'text-slate-400 active:text-slate-200'
            }`}
          >
            <div className="relative">
              <Users className={`w-5.5 h-5.5 mb-1 ${activeTab === 'clients' ? 'stroke-[2.5]' : ''}`} />
            </div>
            <span className={`text-[12px] leading-tight tracking-tight ${activeTab === 'clients' ? 'font-bold' : 'font-medium'}`}>
              Клиенты
            </span>
          </button>

          {/* Tab 3: Center Elevated Prominent Quick Add (+) Button */}
          <div className="flex flex-col items-center justify-center px-1 -mt-6">
            <button
              onClick={onOpenQuickAdd}
              aria-label="Быстро добавить деталь или оплату"
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-blue-500 text-white flex items-center justify-center shadow-xl shadow-blue-500/45 border-[3px] border-[#080b12] active:scale-90 transition-transform cursor-pointer"
            >
              <Plus className="w-7 h-7 stroke-[3]" />
            </button>
            <span className="text-[11px] font-bold text-slate-300 mt-0.5 tracking-tight">
              Запись
            </span>
          </div>

          {/* Tab 4: Price Queue */}
          <button
            onClick={() => handleSelectTab('income')}
            className={`flex flex-col items-center justify-center py-1 flex-1 min-h-[50px] touch-manipulation transition-colors ${
              activeTab === 'income' ? 'text-blue-400' : 'text-slate-400 active:text-slate-200'
            }`}
          >
            <div className="relative">
              <DollarSign className={`w-5.5 h-5.5 mb-1 ${activeTab === 'income' ? 'stroke-[2.5]' : ''}`} />
              {incomeStats?.pendingCount > 0 && (
                <span className="absolute -top-1 -right-2.5 px-1.5 min-w-[17px] h-4.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 font-mono flex items-center justify-center shadow-md animate-pulse">
                  {incomeStats.pendingCount}
                </span>
              )}
            </div>
            <span className={`text-[12px] leading-tight tracking-tight ${activeTab === 'income' ? 'font-bold' : 'font-medium'}`}>
              Очередь
            </span>
          </button>

          {/* Tab 5: More (Ещё) */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 flex-1 min-h-[50px] touch-manipulation transition-colors ${
              isMoreActive || isMoreMenuOpen ? 'text-blue-400' : 'text-slate-400 active:text-slate-200'
            }`}
          >
            <div className="relative">
              <Menu className={`w-5.5 h-5.5 mb-1 ${isMoreActive ? 'stroke-[2.5]' : ''}`} />
              {isMoreActive && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-400" />
              )}
            </div>
            <span className={`text-[12px] leading-tight tracking-tight ${isMoreActive ? 'font-bold' : 'font-medium'}`}>
              Ещё
            </span>
          </button>

        </div>
      </nav>

      {/* Mobile "More" (Ещё) Bottom Action Sheet */}
      {isMoreMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div 
            className="w-full bg-[#0d1322] border-t border-white/10 rounded-t-3xl p-5 pb-[max(env(safe-area-inset-bottom,0px),20px)] shadow-2xl space-y-4 animate-in slide-in-from-bottom-5 duration-200 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle & Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Все разделы и сервисы</h3>
              </div>
              <button 
                onClick={() => setIsMoreMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 active:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of Navigation Actions */}
            <div className="grid grid-cols-1 gap-2.5">
              
              {/* Counterparties */}
              <button
                onClick={() => handleSelectTab('other')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                  activeTab === 'other'
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-900/80 hover:bg-slate-800/80 border-white/5 text-slate-200 active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Контрагенты</div>
                    <div className="text-xs text-slate-400">Поставщики, автосервисы, мастера</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>

              {/* Parts Catalog */}
              <button
                onClick={() => handleSelectTab('parts')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                  activeTab === 'parts'
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-900/80 hover:bg-slate-800/80 border-white/5 text-slate-200 active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Каталог запчастей</div>
                    <div className="text-xs text-slate-400">Поиск по кодам, авто и история замен</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>

              {/* Settings */}
              <button
                onClick={() => handleSelectTab('settings')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                  activeTab === 'settings'
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-900/80 hover:bg-slate-800/80 border-white/5 text-slate-200 active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Настройки</div>
                    <div className="text-xs text-slate-400">Безопасность, 2FA, синхронизация базы</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>

              {/* Export to Excel */}
              <button
                onClick={() => {
                  exportToExcel();
                  setIsMoreMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/5 text-slate-200 active:scale-[0.98] transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Экспорт в Excel (.xlsx)</div>
                    <div className="text-xs text-slate-400">Выгрузка всех клиентов и балансов</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>

              {/* Install PWA Button if available */}
              {!isStandalone && onOpenInstallModal && (
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onOpenInstallModal();
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 active:scale-[0.98] transition-all text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">Добавить на рабочий стол</div>
                      <div className="text-xs text-blue-300/80">Установка иконки приложения в iOS</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-400" />
                </button>
              )}

              {/* Lock Screen */}
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  lockApp();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 active:scale-[0.98] transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Заблокировать экран</div>
                    <div className="text-xs text-rose-300/80">Быстрая блокировка доступа</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-rose-400" />
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

