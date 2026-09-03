import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  TrendingUp, 
  Truck, 
  Car, 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Plus, 
  ChevronRight,
  CreditCard,
  Package
} from 'lucide-react';

export default function Dashboard({ setActiveTab, onOpenQuickAdd, onSelectSupplier, onSelectCar }) {
  const { data, globalSummary, getSupplierStats } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  // Format currency
  const formatMoney = (val) => {
    return (val || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
  };

  // Recent transactions across all suppliers
  const recentSupplierTxs = [...data.supplierTransactions]
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, 8);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Welcome / Quick Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
            Сводка взаиморасчетов
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Контроль долгов поставщикам, деталей и заказов авто
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Новая запись</span>
          </button>
        </div>
      </div>

      {/* Main KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Grand Total Balance */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-blue-500/30 shadow-xl shadow-blue-950/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Общий долг / баланс
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
              globalSummary.grandBalance > 0 ? 'text-rose-400' : globalSummary.grandBalance < 0 ? 'text-emerald-400' : 'text-slate-200'
            }`}>
              {formatMoney(globalSummary.grandBalance)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Поставщики + Другие (как в Excel B15)
            </p>
          </div>
        </div>

        {/* Card 2: Suppliers Debt */}
        <div 
          onClick={() => setActiveTab('suppliers')}
          className="cursor-pointer group bg-slate-900/80 hover:bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-300">
              Долг поставщикам
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-amber-400">
              {formatMoney(globalSummary.totalSupplierDebt)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <span>{globalSummary.suppliersCount} поставщиков</span>
              <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center">
                Перейти <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Client Debt (Car orders) */}
        <div 
          onClick={() => setActiveTab('cars')}
          className="cursor-pointer group bg-slate-900/80 hover:bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-300">
              Долги клиентов (авто)
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
              globalSummary.totalClientDebt > 0 ? 'text-purple-400' : 'text-slate-300'
            }`}>
              {formatMoney(globalSummary.totalClientDebt)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <span>{globalSummary.activeOrdersCount} авто в работе</span>
              <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center">
                Перейти <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Other Counterparties */}
        <div 
          onClick={() => setActiveTab('other')}
          className="cursor-pointer group bg-slate-900/80 hover:bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-300">
              Взаиморасчеты (Другие)
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-400">
              {formatMoney(globalSummary.totalOtherBalance)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <span>{data.otherCounterparties.length} контрагентов</span>
              <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center">
                Перейти <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Suppliers Grid Quick Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2">
            <Truck className="w-4 h-4 text-blue-400" />
            <span>Балансы по поставщикам</span>
          </h2>
          <button
            onClick={() => setActiveTab('suppliers')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            Все поставщики &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.suppliers.map((sup) => {
            const stats = getSupplierStats(sup.id);
            return (
              <div
                key={sup.id}
                onClick={() => {
                  onSelectSupplier(sup.id);
                  setActiveTab('suppliers');
                }}
                className="cursor-pointer bg-slate-900/90 hover:bg-slate-800/80 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-slate-100">{sup.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5 flex space-x-3">
                    <span>Закупок: {stats?.rawItemsCount || 0}</span>
                    <span>Оплат: {stats?.rawPaymentsCount || 0}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-amber-400">
                    {formatMoney(stats?.currentDebt || 0)}
                  </div>
                  <span className="text-[10px] text-slate-400">текущий долг</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two columns: Recent Movement & Quick Search */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Recent Activity */}
        <div className="bg-slate-900/70 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-200">
              Последние операции по закупкам и оплатам
            </h2>
          </div>

          {recentSupplierTxs.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              Нет операций. Добавьте первую закупку или оплату кнопкой «Новая запись».
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {recentSupplierTxs.map((tx) => {
                const sup = data.suppliers.find((s) => s.id === tx.supplierId);
                const isItem = tx.type === 'item';
                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl ${
                        isItem ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {isItem ? <Package className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                            {sup?.name || 'Поставщик'}
                          </span>
                          {tx.article && (
                            <span className="text-xs font-mono font-bold text-blue-300">
                              {tx.article}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {tx.description || (isItem ? 'Закупка детали' : 'Оплата поставщику')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-bold font-mono ${
                        isItem ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {isItem ? `+${formatMoney(tx.amount)}` : `-${formatMoney(tx.amount)}`}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {tx.date || new Date(tx.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Quick Search for Parts */}
        <div className="bg-slate-900/70 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Search className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-slate-200">
                Быстрый поиск артикула
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Введите артикул, чтобы узнать историю цен, у кого покупался и на какое авто ставился
            </p>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Поиск по артикулу (напр. S SF OF1053, CCH9407...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setActiveTab('parts');
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {searchQuery.trim() && (
              <div className="mt-3 divide-y divide-slate-800">
                {data.supplierTransactions
                  .filter((t) => t.type === 'item' && t.article && t.article.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 4)
                  .map((t) => {
                    const sup = data.suppliers.find((s) => s.id === t.supplierId);
                    return (
                      <div key={t.id} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-bold text-blue-400 mr-2">{t.article}</span>
                          <span className="text-slate-400">{t.description || sup?.name}</span>
                        </div>
                        <span className="font-mono font-semibold text-emerald-400">{formatMoney(t.amount)}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Всего артикулов в базе: <strong className="text-slate-200">{globalSummary.totalItemsCount}</strong>
            </span>
            <button
              onClick={() => setActiveTab('parts')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
            >
              <span>Открыть каталог</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
