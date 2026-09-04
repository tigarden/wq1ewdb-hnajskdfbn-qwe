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
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ShieldAlert
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
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden bg-[#101726]/80 rounded-3xl border border-white/5 p-5 sm:p-6 card-emboss backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
                Финансовый центр
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Учет клиентов и финансов
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Сводные балансы, дебиторская задолженность, склад запчастей и аналитика маржинальности
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {incomeStats.pendingCount > 0 && (
              <button
                onClick={() => setActiveTab('income')}
                className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all card-emboss animate-pulse"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Очередь цен ({incomeStats.pendingCount})</span>
              </button>
            )}
            
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all card-emboss hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Новая запись</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards: 4 columns grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Сводный баланс"
          value={formatMoney(globalSummary.grandBalance)}
          subtitle={
            globalSummary.grandBalance > 0
              ? 'Клиенты должны нам'
              : globalSummary.grandBalance < 0
              ? 'Мы должны контрагентам'
              : 'Баланс сведен к нулю'
          }
          icon={TrendingUp}
          variant={globalSummary.grandBalance > 0 ? 'emerald' : globalSummary.grandBalance < 0 ? 'rose' : 'blue'}
        />

        <StatCard
          title="Чистый доход"
          value={`+${formatMoney(incomeStats.totalProfit)}`}
          subtitle={`+${incomeStats.marginPercent.toFixed(1)}% наценка на деталях`}
          actionText="К расчету"
          icon={DollarSign}
          variant="emerald"
          onClick={() => setActiveTab('income')}
        />

        <StatCard
          title="Долги клиентов"
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
          subtitle={`${data.otherCounterparties?.length || 0} мастеров/сервисов`}
          actionText="Расчеты"
          icon={UserCheck}
          variant="purple"
          onClick={() => setActiveTab('other')}
        />
      </div>

      {/* Main Content Area: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Recent Activity Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#101726]/80 rounded-2xl border border-white/5 p-5 card-emboss backdrop-blur-sm">
            
            {/* Header with Segmented Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <span>Последние движения</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {data.clientTransactions?.length || 0}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">История закупок и оплат в реальном времени</p>
              </div>

              <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <button
                  onClick={() => setTxFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    txFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setTxFilter('item')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    txFilter === 'item' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Детали
                </button>
                <button
                  onClick={() => setTxFilter('payment')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    txFilter === 'payment' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
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
              <div className="divide-y divide-white/5">
                {filteredTxs.map((tx) => {
                  const cli = (data.clients || []).find((c) => c.id === tx.clientId);
                  const isItem = tx.type === 'item';

                  return (
                    <div 
                      key={tx.id} 
                      className="py-3.5 flex items-center justify-between group hover:bg-white/[0.02] px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
                      onClick={() => {
                        if (cli?.id) {
                          onSelectClient(cli.id);
                          setActiveTab('clients');
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-3">
                        {/* Type Icon */}
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          isItem 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {isItem ? <Package className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
                              {cli?.name || 'Клиент'}
                            </span>
                            
                            <Badge variant={isItem ? 'item' : 'payment'} size="xs">
                              {isItem ? 'Деталь' : 'Оплата'}
                            </Badge>

                            {tx.article && (
                              <button
                                onClick={(e) => handleCopyArticle(tx.article, e)}
                                title="Скопировать артикул"
                                className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-slate-950/80 hover:bg-slate-900 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold transition-colors"
                              >
                                <span>{tx.article}</span>
                                {copiedArticle === tx.article ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5 opacity-60 hover:opacity-100" />
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

                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {tx.description || tx.note || (isItem ? 'Установка автозапчасти' : 'Погашение задолженности')}
                          </p>
                        </div>
                      </div>

                      {/* Right: Amount & Date */}
                      <div className="text-right shrink-0">
                        <div className={`text-sm sm:text-base font-bold font-mono tracking-tight ${
                          isItem ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {isItem ? `+${formatMoney(tx.amount)}` : `-${formatMoney(tx.amount)}`}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
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
        <div className="lg:col-span-5 space-y-6">
          
          {/* Top Debtors Leaderboard */}
          <div className="bg-[#101726]/80 rounded-2xl border border-white/5 p-5 card-emboss backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Топ должников</span>
              </h2>
              <button
                onClick={() => setActiveTab('clients')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-0.5"
              >
                <span>Все клиенты</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {topDebtors.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Задолженностей по клиентам нет! Все счета закрыты.
              </div>
            ) : (
              <div className="space-y-3">
                {topDebtors.map((debtor, idx) => {
                  const percent = Math.min(100, Math.round((debtor.currentDebt / maxDebt) * 100));
                  return (
                    <div
                      key={debtor.id}
                      onClick={() => {
                        onSelectClient(debtor.id);
                        setActiveTab('clients');
                      }}
                      className="group cursor-pointer p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 font-mono font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                            {debtor.name}
                          </span>
                          {debtor.car && (
                            <span className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800 truncate max-w-[100px]">
                              {debtor.car}
                            </span>
                          )}
                        </div>

                        <div className="font-mono font-bold text-amber-400">
                          {formatMoney(debtor.currentDebt)}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-amber-400 h-1.5 rounded-full transition-all duration-500" 
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
          <div className="bg-[#101726]/80 rounded-2xl border border-white/5 p-5 card-emboss backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <Search className="w-4 h-4 text-blue-400" />
                <h2 className="text-base font-bold text-slate-100">
                  Поиск артикула
                </h2>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Мгновенный поиск истории цен и автомобилей по коду запчасти
              </p>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Введите артикул (например: S TL C00117/8)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      setActiveTab('parts');
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-blue-500 input-glow transition-all"
                />
              </div>

              {/* Suggestions */}
              {searchResults.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {searchResults.map((t) => {
                    const cli = (data.clients || []).find((c) => c.id === t.clientId);
                    return (
                      <div 
                        key={t.id} 
                        onClick={() => setActiveTab('parts')}
                        className="cursor-pointer p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-blue-300">{t.article}</span>
                            {t.carName && <span className="text-[10px] text-slate-400">({t.carName})</span>}
                          </div>
                          <span className="text-[11px] text-slate-400 truncate block max-w-[200px]">
                            {t.description || cli?.name}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">
                          {formatMoney(t.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>
                Всего в каталоге: <strong className="text-slate-200 font-mono">{globalSummary.totalItemsCount}</strong>
              </span>
              <button
                onClick={() => setActiveTab('parts')}
                className="text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
              >
                <span>В каталог</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
