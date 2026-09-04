import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { formatMoney, pluralize } from '../utils/format';
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
  Car,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';

export default function Dashboard({ setActiveTab, onOpenQuickAdd, onSelectClient }) {
  const { data, globalSummary, getClientStats, incomeStats } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [txFilter, setTxFilter] = useState('all'); // 'all' | 'item' | 'payment'
  const [copiedArticle, setCopiedArticle] = useState(null);

  // Filtered recent transactions
  const filteredTxs = useMemo(() => {
    let txs = [...(data.clientTransactions || [])];
    if (txFilter === 'item') txs = txs.filter((t) => t.type === 'item');
    if (txFilter === 'payment') txs = txs.filter((t) => t.type === 'payment');

    return txs
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .slice(0, 10);
  }, [data.clientTransactions, txFilter]);

  // Top Debtors list with stats
  const topDebtors = useMemo(() => {
    return (data.clients || [])
      .map((cli) => {
        const stats = getClientStats(cli.id);
        return {
          ...cli,
          currentDebt: stats?.currentDebt || 0,
          itemsCount: stats?.itemsCount || 0,
        };
      })
      .filter((cli) => cli.currentDebt > 0)
      .sort((a, b) => b.currentDebt - a.currentDebt)
      .slice(0, 5);
  }, [data.clients, getClientStats]);

  const maxDebt = topDebtors[0]?.currentDebt || 1;

  // Search results for parts
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return (data.clientTransactions || [])
      .filter((t) => t.type === 'item' && t.article && t.article.toLowerCase().includes(q))
      .slice(0, 5);
  }, [data.clientTransactions, searchQuery]);

  const handleCopyArticle = (article, e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(article);
    setCopiedArticle(article);
    setTimeout(() => setCopiedArticle(null), 1500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Top Header Strip: Minimalist, functional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Финансовая сводка</span>
            <span className="text-[11px] font-mono text-slate-400 font-normal">
              • {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
            </span>
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {incomeStats.pendingCount > 0 && (
            <button
              onClick={() => setActiveTab('income')}
              className="btn-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Очередь цен: {incomeStats.pendingCount}</span>
            </button>
          )}

          <button
            onClick={onOpenQuickAdd}
            className="btn-sm bg-blue-600 hover:bg-blue-500 text-white font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Новая запись</span>
          </button>
        </div>
      </div>

      {/* Precision Metric Tiles (4 columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Сводный баланс"
          value={formatMoney(globalSummary.grandBalance)}
          subtitle={
            globalSummary.grandBalance > 0
              ? 'Остаток долга клиентов'
              : globalSummary.grandBalance < 0
              ? 'Задолженность перед контрагентами'
              : 'Все счета закрыты'
          }
          icon={TrendingUp}
          variant={globalSummary.grandBalance > 0 ? 'amber' : globalSummary.grandBalance < 0 ? 'rose' : 'slate'}
        />

        <StatCard
          title="Чистая прибыль"
          value={`+${formatMoney(incomeStats.totalProfit)}`}
          subtitle={`+${incomeStats.marginPercent.toFixed(1)}% средняя маржа`}
          actionText="Расчет"
          icon={DollarSign}
          variant="emerald"
          onClick={() => setActiveTab('income')}
        />

        <StatCard
          title="Дебет клиентов"
          value={formatMoney(globalSummary.totalClientDebt)}
          subtitle={`${globalSummary.clientsCount} ${pluralize(globalSummary.clientsCount, ['клиент', 'клиента', 'клиентов'])}`}
          actionText="Клиенты"
          icon={Users}
          variant="amber"
          onClick={() => setActiveTab('clients')}
        />

        <StatCard
          title="Контрагенты"
          value={formatMoney(globalSummary.totalOtherBalance)}
          subtitle={`${data.otherCounterparties?.length || 0} субподрядчиков`}
          actionText="Взаиморасчеты"
          icon={UserCheck}
          variant="blue"
          onClick={() => setActiveTab('other')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (7 cols): Recent Activity Feed */}
        <div className="lg:col-span-7">
          <div className="surface-card rounded-lg p-4 space-y-3">
            
            {/* Header with Segmented Filters */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Последние операции
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {data.clientTransactions?.length || 0}
                </span>
              </div>

              {/* Strict Button Switcher */}
              <div className="flex items-center space-x-1 p-0.5 rounded-md bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setTxFilter('all')}
                  className={`h-6 px-2 rounded text-[11px] font-semibold transition-colors ${
                    txFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setTxFilter('item')}
                  className={`h-6 px-2 rounded text-[11px] font-semibold transition-colors ${
                    txFilter === 'item' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Детали
                </button>
                <button
                  onClick={() => setTxFilter('payment')}
                  className={`h-6 px-2 rounded text-[11px] font-semibold transition-colors ${
                    txFilter === 'payment' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Оплаты
                </button>
              </div>
            </div>

            {/* List */}
            {filteredTxs.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Нет операций в этом фильтре"
                description="Добавьте деталь или оплату нажатием кнопки «Новая запись»."
                actionLabel="Новая запись"
                onAction={onOpenQuickAdd}
              />
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {filteredTxs.map((tx) => {
                  const cli = (data.clients || []).find((c) => c.id === tx.clientId);
                  const isItem = tx.type === 'item';

                  return (
                    <div 
                      key={tx.id} 
                      className="py-2.5 px-2 flex items-center justify-between hover:bg-white/[0.02] rounded-md transition-colors cursor-pointer group"
                      onClick={() => {
                        if (cli?.id) {
                          onSelectClient(cli.id);
                          setActiveTab('clients');
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        {/* Status Bar */}
                        <span className={`w-1 h-8 rounded-full shrink-0 ${
                          isItem ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />

                        {/* Details */}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                              {cli?.name || 'Клиент'}
                            </span>
                            
                            <Badge variant={isItem ? 'item' : 'payment'} size="xs">
                              {isItem ? 'Деталь' : 'Оплата'}
                            </Badge>

                            {tx.article && (
                              <button
                                onClick={(e) => handleCopyArticle(tx.article, e)}
                                title="Скопировать артикул"
                                className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-950 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold hover:border-blue-400 transition-colors"
                              >
                                <span>{tx.article}</span>
                                {copiedArticle === tx.article ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5 opacity-50" />
                                )}
                              </button>
                            )}

                            {(tx.carName || cli?.car) && (
                              <Badge variant="car" size="xs">
                                <Car className="w-2.5 h-2.5 mr-0.5 text-slate-400" />
                                <span>{tx.carName || cli?.car}</span>
                              </Badge>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {tx.description || tx.note || (isItem ? 'Автозапчасть' : 'Оплата')}
                          </p>
                        </div>
                      </div>

                      {/* Right: Amount & Date */}
                      <div className="text-right shrink-0">
                        <div className={`text-xs sm:text-sm font-bold font-mono tracking-tight ${
                          isItem ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {isItem ? `+${formatMoney(tx.amount)}` : `-${formatMoney(tx.amount)}`}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          {tx.date || new Date(tx.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Top Debtors & Fast Part Search */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Top Debtors Leaderboard */}
          <div className="surface-card rounded-lg p-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Топ должников
              </span>
              <button
                onClick={() => setActiveTab('clients')}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center space-x-1"
              >
                <span>Все клиенты</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {topDebtors.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                Задолженностей по клиентам нет
              </div>
            ) : (
              <div className="space-y-2">
                {topDebtors.map((debtor, idx) => {
                  const percent = Math.min(100, Math.round((debtor.currentDebt / maxDebt) * 100));
                  return (
                    <div
                      key={debtor.id}
                      onClick={() => {
                        onSelectClient(debtor.id);
                        setActiveTab('clients');
                      }}
                      className="cursor-pointer p-2.5 rounded-md bg-slate-950/70 hover:bg-slate-900 border border-slate-800/80 transition-colors group"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="w-4 h-4 rounded bg-slate-800 text-slate-400 font-mono font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                            {debtor.name}
                          </span>
                          {debtor.car && (
                            <span className="text-[10px] text-slate-400 bg-slate-900 px-1 py-0.5 rounded border border-slate-800 truncate max-w-[90px]">
                              {debtor.car}
                            </span>
                          )}
                        </div>

                        <div className="font-mono font-bold text-amber-400 text-xs">
                          {formatMoney(debtor.currentDebt)}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                        <div 
                          className="bg-amber-500 h-1 rounded-full transition-all duration-300" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fast Part Code Finder */}
          <div className="surface-card rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Поиск артикула
              </span>
              <button
                onClick={() => setActiveTab('parts')}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center space-x-1"
              >
                <span>В каталог</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Поиск кода (напр. S TL C00117/8)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setActiveTab('parts');
                  }
                }}
                className="w-full h-9 pl-9 pr-3 bg-slate-950 border border-slate-800 rounded-md text-slate-100 text-xs font-mono focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Suggestions */}
            {searchResults.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {searchResults.map((t) => {
                  const cli = (data.clients || []).find((c) => c.id === t.clientId);
                  return (
                    <div 
                      key={t.id} 
                      onClick={() => setActiveTab('parts')}
                      className="cursor-pointer p-2 rounded-md bg-slate-950 hover:bg-slate-900 border border-slate-800 flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-blue-400">{t.article}</span>
                          {t.carName && <span className="text-[10px] text-slate-500">({t.carName})</span>}
                        </div>
                        <span className="text-[10px] text-slate-400 truncate block max-w-[180px]">
                          {t.description || cli?.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-amber-400 text-xs">
                        {formatMoney(t.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
