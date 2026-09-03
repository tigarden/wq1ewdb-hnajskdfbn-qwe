import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  TrendingUp, 
  Users, 
  UserCheck, 
  Search, 
  Plus, 
  ChevronRight,
  CreditCard,
  Package,
  DollarSign,
  Clock,
  Car
} from 'lucide-react';

export default function Dashboard({ setActiveTab, onOpenQuickAdd, onSelectClient }) {
  const { data, globalSummary, getClientStats, incomeStats } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const formatMoney = (val) => {
    return (val || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' грн';
  };

  const recentTxs = [...(data.clientTransactions || [])]
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, 8);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
            Учет клиентов и финансов
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Тотус, Тотус 2, Эрик, Витя • Балансы, закупки и статистика дохода
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {incomeStats.pendingCount > 0 && (
            <button
              onClick={() => setActiveTab('income')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Очередь цен ({incomeStats.pendingCount})</span>
            </button>
          )}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Новая запись</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: 4 cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Grand Balance */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-blue-500/30 shadow-xl shadow-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Общий баланс
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
              globalSummary.grandBalance > 0 ? 'text-rose-400' : globalSummary.grandBalance < 0 ? 'text-emerald-400' : 'text-slate-200'
            }`}>
              {formatMoney(globalSummary.grandBalance)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Клиенты + Другие (ячейка B15)
            </p>
          </div>
        </div>

        {/* Card 2: Чистый Доход */}
        <div 
          onClick={() => setActiveTab('income')}
          className="cursor-pointer group bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-emerald-500/30 hover:border-emerald-500/50 shadow-xl shadow-emerald-950/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 group-hover:text-emerald-300">
              Чистый доход
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-emerald-400">
              +{formatMoney(incomeStats.totalProfit)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>+{incomeStats.marginPercent.toFixed(1)}% наценка</span>
              <span className="text-emerald-400 flex items-center">
                Очередь &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Main Clients Total Debt */}
        <div 
          onClick={() => setActiveTab('clients')}
          className="cursor-pointer group bg-slate-900/80 hover:bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-300">
              Долги клиентов
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-amber-400">
              {formatMoney(globalSummary.totalClientDebt)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>{globalSummary.clientsCount} клиентов</span>
              <span className="text-blue-400 flex items-center">
                Перейти &rarr;
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
              Другие расчеты
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-purple-300">
              {formatMoney(globalSummary.totalOtherBalance)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>{data.otherCounterparties?.length || 0} персон</span>
              <span className="text-blue-400 flex items-center">
                Перейти &rarr;
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Clients Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Балансы клиентов</span>
          </h2>
          <button
            onClick={() => setActiveTab('clients')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            Все клиенты &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(data.clients || []).map((cli) => {
            const stats = getClientStats(cli.id);
            return (
              <div
                key={cli.id}
                onClick={() => {
                  onSelectClient(cli.id);
                  setActiveTab('clients');
                }}
                className="cursor-pointer bg-slate-900/90 hover:bg-slate-800/80 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-100 text-sm">{cli.name}</h3>
                    <span className="text-[10px] text-slate-500">
                      {stats?.itemsCount || 0} детал.
                    </span>
                  </div>
                  {cli.car && (
                    <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-1">
                      <Car className="w-3 h-3 text-blue-400" />
                      <span className="truncate">{cli.car}</span>
                    </div>
                  )}
                  {cli.phone && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {cli.phone}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800 text-right">
                  <div className="text-base font-bold font-mono text-amber-400">
                    {formatMoney(stats?.currentDebt || 0)}
                  </div>
                  <span className="text-[10px] text-slate-500">долг клиента</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Parts Search */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Recent Activity */}
        <div className="bg-slate-900/70 rounded-2xl border border-slate-800 p-5">
          <h2 className="text-base font-bold text-slate-200 mb-4">
            Последние движения
          </h2>

          {recentTxs.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              Нет операций. Добавьте первую деталь или оплату кнопкой «Новая запись».
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {recentTxs.map((tx) => {
                const cli = (data.clients || []).find((c) => c.id === tx.clientId);
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
                            {cli?.name || 'Клиент'}
                          </span>
                          {tx.article && (
                            <span className="text-xs font-mono font-bold text-blue-300">
                              {tx.article}
                            </span>
                          )}
                          {(tx.carName || cli?.car) && (
                            <span className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">
                              {tx.carName || cli?.car}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {tx.description || (isItem ? 'Деталь' : 'Оплата')}
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
              Поиск кода детали: кому ставилась, цены и даты
            </p>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Поиск по артикулу (напр. S TL C00117/8)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setActiveTab('parts');
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono"
              />
            </div>

            {searchQuery.trim() && (
              <div className="mt-3 divide-y divide-slate-800">
                {(data.clientTransactions || [])
                  .filter((t) => t.type === 'item' && t.article && t.article.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 4)
                  .map((t) => {
                    const cli = (data.clients || []).find((c) => c.id === t.clientId);
                    return (
                      <div key={t.id} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-bold text-blue-400 mr-2">{t.article}</span>
                          <span className="text-slate-400">{t.description || cli?.name}</span>
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
              Всего позиций в базе: <strong className="text-slate-200">{globalSummary.totalItemsCount}</strong>
            </span>
            <button
              onClick={() => setActiveTab('parts')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
            >
              <span>Поиск в каталоге</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
