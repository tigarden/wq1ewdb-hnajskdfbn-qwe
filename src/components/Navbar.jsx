import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Car, 
  Users, 
  Search, 
  Settings, 
  Plus, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Menu, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Navbar({ activeTab, setActiveTab, onOpenQuickAdd }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { syncStatus, lastSyncTime, pushToGitHub, pullFromGitHub, exportToExcel } = useData();

  const navItems = [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { id: 'suppliers', label: 'Поставщики', icon: Truck },
    { id: 'cars', label: 'Авто & Заказы', icon: Car },
    { id: 'other', label: 'Другие', icon: Users },
    { id: 'parts', label: 'Артикулы', icon: Search },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Debet.auto
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/50">
                v1.0
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Sync Badge */}
            <div className="hidden lg:flex items-center">
              {syncStatus === 'syncing' ? (
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Синхронизация...</span>
                </div>
              ) : syncStatus === 'synced' ? (
                <div 
                  onClick={() => pushToGitHub()} 
                  title={`Синхронизировано: ${lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString('ru-RU') : 'только что'}`}
                  className="cursor-pointer flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>В сети GitHub</span>
                </div>
              ) : syncStatus === 'unsaved' ? (
                <button
                  onClick={() => pushToGitHub()}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium hover:bg-blue-500/30 transition-colors"
                  title="Нажмите, чтобы отправить локальные изменения в GitHub"
                >
                  <Cloud className="w-3.5 h-3.5 text-amber-400" />
                  <span>Сохранить в GitHub</span>
                </button>
              ) : (
                <div 
                  onClick={() => setActiveTab('settings')}
                  className="cursor-pointer flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-medium hover:text-slate-200"
                  title="Токен GitHub не указан. Нажмите для настройки"
                >
                  <CloudOff className="w-3.5 h-3.5 text-slate-500" />
                  <span>Оффлайн (Локально)</span>
                </div>
              )}
            </div>

            {/* Quick Export Excel */}
            <button
              onClick={exportToExcel}
              title="Выгрузить в Excel (.xlsx)"
              className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 rounded-xl transition-colors border border-emerald-500/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>

            {/* Quick Add Button */}
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Действие</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900/98 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-2">
            <span>Статус:</span>
            {syncStatus === 'synced' ? (
              <span className="text-emerald-400">Синхронизировано с GitHub</span>
            ) : syncStatus === 'unsaved' ? (
              <button onClick={() => pushToGitHub()} className="text-blue-400 underline">
                Сохранить в GitHub
              </button>
            ) : (
              <span>Только локальный кэш</span>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
