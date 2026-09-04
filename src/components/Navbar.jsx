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
  Sparkles
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Navbar({ activeTab, setActiveTab, onOpenQuickAdd }) {
  const { syncStatus, lastSyncTime, pushToGitHub, exportToExcel, lockApp, incomeStats } = useData();

  const navItems = [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { id: 'clients', label: 'Клиенты', icon: Users },
    { id: 'income', label: 'Доход & Очередь', icon: DollarSign, badge: incomeStats?.pendingCount },
    { id: 'other', label: 'Контрагенты', icon: UserCheck },
    { id: 'parts', label: 'База артикулов', icon: Search },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#090d16]/85 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand / Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group select-none" 
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-600/25 font-black text-lg card-emboss group-hover:scale-105 transition-transform">
                  Д
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#090d16]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    Debet.auto
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono uppercase tracking-wide">
                    грн
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline-block">
                  Учет взаиморасчетов & запчастей
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1 p-1 rounded-2xl bg-[#101726]/60 border border-white/5 backdrop-blur-md">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 card-emboss'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono transition-colors ${
                        isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Quick Controls */}
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              
              {/* Cloud Sync Status */}
              <div className="flex items-center">
                {syncStatus === 'syncing' ? (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span className="hidden sm:inline">Синхронизация...</span>
                  </div>
                ) : syncStatus === 'synced' ? (
                  <button 
                    onClick={() => pushToGitHub()} 
                    title={`Синхронизировано с GitHub: ${lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString('ru-RU') : 'только что'}`}
                    className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 transition-all card-emboss"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <Cloud className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline font-mono text-[11px]">GitHub Synced</span>
                  </button>
                ) : syncStatus === 'unsaved' ? (
                  <button
                    onClick={() => pushToGitHub()}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/40 text-xs font-medium hover:bg-blue-600/30 transition-all animate-pulse"
                    title="Нажмите, чтобы отправить локальные данные в репозиторий"
                  >
                    <Cloud className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold">Сохранить</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 text-slate-400 border border-slate-700/50 text-xs font-medium hover:text-slate-200 transition-colors"
                    title="Оффлайн-режим. Нажмите для подключения токена GitHub"
                  >
                    <CloudOff className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Оффлайн</span>
                  </button>
                )}
              </div>

              {/* Export to Excel (.xlsx) */}
              <button
                onClick={exportToExcel}
                title="Экспорт всех таблиц в Excel (.xlsx)"
                className="p-2 sm:px-2.5 sm:py-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition-all border border-emerald-500/20 card-emboss flex items-center space-x-1 text-xs font-medium"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden xl:inline">Excel</span>
              </button>

              {/* Lock Button */}
              <button
                onClick={lockApp}
                title="Заблокировать систему (PIN)"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-slate-800 hover:border-rose-500/30"
              >
                <Lock className="w-4 h-4" />
              </button>

              {/* Desktop Quick Add Button */}
              <button
                onClick={onOpenQuickAdd}
                className="hidden sm:flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all card-emboss hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Новая запись</span>
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Dock */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-all ${
                isActive ? 'text-blue-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950 font-mono">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Prominent Center Action Button on Mobile */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={onOpenQuickAdd}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-600/40 flex items-center justify-center card-emboss active:scale-95 transition-transform"
            title="Быстрое добавление"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {navItems.slice(2, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-all ${
                isActive ? 'text-blue-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950 font-mono">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="tracking-tight">{item.id === 'income' ? 'Доход' : item.label}</span>
            </button>
          );
        })}

        {/* More / Settings tab on mobile */}
        <button
          onClick={() => setActiveTab(activeTab === 'settings' ? 'parts' : 'settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-all ${
            activeTab === 'settings' || activeTab === 'parts' ? 'text-blue-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'settings' ? (
            <>
              <Settings className="w-5 h-5 mb-0.5" />
              <span>Опции</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mb-0.5" />
              <span>Поиск</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
