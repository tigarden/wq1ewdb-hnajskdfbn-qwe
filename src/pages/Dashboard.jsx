import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { formatMoney, pluralize } from '../utils/format';
import { 
  TrendingUp, 
  Users, 
  Search, 
  Plus, 
  ChevronRight, 
  Package, 
  Car, 
  Copy, 
  Check, 
  Clock, 
  DollarSign, 
  UserCheck, 
  ArrowUpRight,
  Sparkles,
  Save
} from 'lucide-react';

export default function Dashboard({ setActiveTab, onOpenQuickAdd, onSelectClient }) {
  const { 
    data, 
    globalSummary, 
    getClientStats, 
    incomeStats, 
    updateItemPurchasePrice 
  } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [txFilter, setTxFilter] = useState('all'); // 'all' | 'item' | 'payment'
  const [copiedArticle, setCopiedArticle] = useState(null);
  const [inlinePriceDrafts, setInlinePriceDrafts] = useState({});
  const [savedPriceId, setSavedPriceId] = useState(null);

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

  // Pending price queue items (items waiting for purchase price)
  const pendingItems = useMemo(() => {
    return (data.clientTransactions || [])
      .filter((t) => t.type === 'item' && (!t.purchasePrice || Number(t.purchasePrice) === 0))
      .slice(0, 3);
  }, [data.clientTransactions]);

  const handleCopyArticle = (article, e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(article);
    setCopiedArticle(article);
    setTimeout(() => setCopiedArticle(null), 1500);
  };

  const handleSaveInlinePrice = (txId) => {
    const priceVal = inlinePriceDrafts[txId];
    if (priceVal === undefined || priceVal === '') return;
    const num = parseFloat(priceVal);
    if (isNaN(num) || num < 0) return;

    updateItemPurchasePrice(txId, num);
    setSavedPriceId(txId);
    setTimeout(() => {
      setSavedPriceId(null);
      setInlinePriceDrafts((prev) => {
        const copy = { ...prev };
        delete copy[txId];
        return copy;
      });
    }, 1200);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Header Command Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl 2xl:text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <span>Финансовый центр</span>
            <span className="text-xs 2xl:text-sm font-mono text-slate-400 font-normal px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/5">
              {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            </span>
          </h1>
          <p className="text-xs 2xl:text-sm text-slate-400 mt-1">
            Контроль дебета, маржинальности запчастей и балансов поставщиков
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {incomeStats.pendingCount > 0 && (
            <button
              onClick={() => setActiveTab('income')}
              className="btn-sm 2xl:btn-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs group"
            >
              <Clock className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
              <span>Очередь цен: <strong className="font-mono">{incomeStats.pendingCount}</strong></span>
            </button>
          )}

          <button
            onClick={onOpenQuickAdd}
            className="btn-sm 2xl:btn-md btn-primary font-bold shadow-md shadow-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 stroke-[2.5]" />
            <span>Новая запись</span>
          </button>
        </div>
      </div>

      {/* 4 Precision Metric Tiles (Concept A) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Сводный баланс"
          value={formatMoney(globalSummary.grandBalance)}
          subtitle={
            globalSummary.grandBalance > 0
              ? 'Остаток долга клиентов'
              : globalSummary.grandBalance < 0
              ? 'Долг перед контрагентами'
              : 'Все счета закрыты'
          }
          icon={TrendingUp}
          variant={globalSummary.grandBalance > 0 ? 'amber' : globalSummary.grandBalance < 0 ? 'rose' : 'slate'}
          badgeText="₴ UAH"
        />

        <StatCard
          title="Чистая прибыль"
          value={`+${formatMoney(incomeStats.totalProfit)}`}
          subtitle={`+${incomeStats.marginPercent.toFixed(1)}% средняя маржа`}
          actionText="В очередь"
          icon={DollarSign}
          variant="emerald"
          badgeText={`+${incomeStats.marginPercent.toFixed(0)}%`}
          onClick={() => setActiveTab('income')}
        />

        <StatCard
          title="Дебет клиентов"
          value={formatMoney(globalSummary.totalClientDebt)}
          subtitle={`${globalSummary.clientsCount} ${pluralize(globalSummary.clientsCount, ['клиент', 'клиента', 'клиентов'])}`}
          actionText="Клиенты"
          icon={Users}
          variant="amber"
          badgeText={`${globalSummary.clientsCount} чел.`}
          onClick={() => setActiveTab('clients')}
        />

        <StatCard
          title="Контрагенты"
          value={formatMoney(globalSummary.totalOtherBalance)}
          subtitle={`${data.otherCounterparties?.length || 0} поставщиков`}
          actionText="Взаиморасчеты"
          icon={UserCheck}
          variant="blue"
          badgeText="Тотус / др."
          onClick={() => setActiveTab('other')}
        />
      </div>

      {/* Main Responsive Grid (12 Columns on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 2xl:grid-cols-12 gap-5">
        
        {/* Left Column: High-Density Operations Journal */}
        <div className="lg:col-span-7 2xl:col-span-8 space-y-3">
          <div className="surface-card rounded-xl p-4 2xl:p-5 space-y-4">
            
            {/* Header with Segmented Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3.5">
              <div className="flex items-center space-x-2">
                <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                  <Package className="w-4 h-4 text-blue-400" />
                  <span>Журнал операций</span>
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-white/10 font-bold">
                  {data.clientTransactions?.length || 0}
                </span>
              </div>

              {/* Segmented Filter Pills */}
              <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-950/80 border border-white/[0.08]">
                <button
                  onClick={() => setTxFilter('all')}
                  className={`h-7 2xl:h-8 px-3 rounded-md text-xs font-semibold transition-all ${
                    txFilter === 'all' 
                      ? 'bg-slate-800 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setTxFilter('item')}
                  className={`h-7 2xl:h-8 px-3 rounded-md text-xs font-semibold transition-all ${
                    txFilter === 'item' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Запчасти
                </button>
                <button
                  onClick={() => setTxFilter('payment')}
                  className={`h-7 2xl:h-8 px-3 rounded-md text-xs font-semibold transition-all ${
                    txFilter === 'payment' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Оплаты
                </button>
              </div>
            </div>

            {/* List of Recent Transactions */}
            {filteredTxs.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Нет операций в этом фильтре"
                description="Зарегистрируйте запчасть или оплату через кнопку «Новая запись»."
                actionLabel="Новая запись"
                onAction={onOpenQuickAdd}
              />
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {filteredTxs.map((tx) => {
                  const cli = (data.clients || []).find((c) => c.id === tx.clientId);
                  const isItem = tx.type === 'item';

                  return (
                    <div 
                      key={tx.id} 
                      className="py-3 px-3 flex items-center justify-between hover:bg-white/[0.03] rounded-lg transition-colors cursor-pointer group"
                      onClick={() => {
                        if (cli?.id) {
                          onSelectClient(cli.id);
                          setActiveTab('clients');
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-3">
                        {/* Status Vertical Bar */}
                        <span className={`w-1 h-9 2xl:h-10 rounded-full shrink-0 ${
                          isItem ? 'bg-amber-500' : 'bg-emerald-500 shadow-xs shadow-emerald-500/30'
                        }`} />

                        {/* Details */}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 2xl:gap-2">
                            <span className="text-xs sm:text-sm 2xl:text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                              {cli?.name || 'Клиент'}
                            </span>
                            
                            <Badge variant={isItem ? 'item' : 'payment'} size="xs" showDot>
                              {isItem ? 'Деталь' : 'Оплата'}
                            </Badge>

                            {tx.article && (
                              <button
                                onClick={(e) => handleCopyArticle(tx.article, e)}
                                title="Нажмите, чтобы скопировать артикул"
                                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-950/40 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold hover:border-blue-400 transition-colors"
                              >
                                <span>{tx.article}</span>
                                {copiedArticle === tx.article ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3 opacity-60" />
                                )}
                              </button>
                            )}

                            {(tx.carName || cli?.car) && (
                              <Badge variant="car" size="xs">
                                <Car className="w-3 h-3 mr-0.5 text-slate-400" />
                                <span>{tx.carName || cli?.car}</span>
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs 2xl:text-sm text-slate-400 truncate mt-1">
                            {tx.description || tx.note || (isItem ? 'Автозапчасть' : 'Оплата')}
                          </p>
                        </div>
                      </div>

                      {/* Right: Amount & Date */}
                      <div className="text-right shrink-0">
                        <div className={`text-sm sm:text-base 2xl:text-lg font-bold font-mono tracking-tight ${
                          isItem ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {isItem ? `+${formatMoney(tx.amount)}` : `-${formatMoney(tx.amount)}`}
                        </div>
                        <span className="text-xs font-mono text-slate-500 block mt-1">
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

        {/* Right Column (5 cols): Operational Power Column */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* 1. Interactive Fast Price Queue Widget */}
          <div className="surface-card rounded-xl p-4 2xl:p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-slate-200">
                  Очередь цен на закупку
                </span>
                {incomeStats.pendingCount > 0 && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">
                    {incomeStats.pendingCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setActiveTab('income')}
                className="text-xs 2xl:text-sm text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center space-x-1"
              >
                <span>Все</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingItems.length === 0 ? (
              <div className="py-4 text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 mb-1.5">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-xs 2xl:text-sm font-medium text-slate-200">Все входящие цены указаны</p>
                <p className="text-xs text-slate-500 mt-1">Маржа и прибыль рассчитываются в 100% объеме</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingItems.map((item) => {
                  const cli = (data.clients || []).find((c) => c.id === item.clientId);
                  const isSaved = savedPriceId === item.id;
                  const draftVal = inlinePriceDrafts[item.id] !== undefined ? inlinePriceDrafts[item.id] : '';

                  return (
                    <div 
                      key={item.id}
                      className="p-3 rounded-lg bg-slate-950/70 border border-white/[0.06] space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-slate-100 truncate block">
                            {item.description || item.article || 'Деталь'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {cli?.name} {item.carName && `• ${item.carName}`}
                          </span>
                        </div>
                        <span className="font-mono text-xs sm:text-sm font-bold text-slate-200 shrink-0">
                          Прод: {formatMoney(item.amount)}
                        </span>
                      </div>

                      {/* Inline Input & Save Row */}
                      <div className="flex items-center space-x-2 pt-0.5">
                        <input
                          type="number"
                          placeholder="Цена входа (₴)..."
                          value={draftVal}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInlinePriceDrafts((prev) => ({ ...prev, [item.id]: val }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveInlinePrice(item.id);
                          }}
                          className="input-sm 2xl:h-9 flex-1 font-mono text-xs 2xl:text-sm"
                        />
                        <button
                          onClick={() => handleSaveInlinePrice(item.id)}
                          disabled={!draftVal}
                          className={`btn-sm 2xl:h-9 px-3 ${
                            isSaved 
                              ? 'bg-emerald-600 text-white' 
                              : 'btn-primary'
                          } disabled:opacity-40 disabled:pointer-events-none`}
                        >
                          {isSaved ? <Check className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" /> : <Save className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />}
                          <span>{isSaved ? 'Сохранено' : 'Внести'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Top Debtors Leaderboard */}
          <div className="surface-card rounded-xl p-4 2xl:p-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-slate-200">
                  Топ должников
                </span>
              </div>
              <button
                onClick={() => setActiveTab('clients')}
                className="text-xs 2xl:text-sm text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center space-x-1"
              >
                <span>Все клиенты</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {topDebtors.length === 0 ? (
              <div className="text-center py-6 text-xs 2xl:text-sm text-slate-500">
                Задолженностей по клиентам нет
              </div>
            ) : (
              <div className="space-y-2.5">
                {topDebtors.map((debtor, idx) => {
                  const percent = Math.min(100, Math.round((debtor.currentDebt / maxDebt) * 100));
                  return (
                    <div
                      key={debtor.id}
                      onClick={() => {
                        onSelectClient(debtor.id);
                        setActiveTab('clients');
                      }}
                      className="cursor-pointer p-3 rounded-lg bg-slate-950/70 hover:bg-slate-900/80 border border-white/[0.06] hover:border-white/15 transition-all group"
                    >
                      <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center text-xs">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors text-xs sm:text-sm 2xl:text-base">
                            {debtor.name}
                          </span>
                          {debtor.car && (
                            <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-white/5 truncate max-w-[120px] font-mono">
                              {debtor.car}
                            </span>
                          )}
                        </div>

                        <div className="font-mono font-bold text-amber-400 text-xs sm:text-sm 2xl:text-base">
                          {formatMoney(debtor.currentDebt)}
                        </div>
                      </div>

                      {/* Visual Gradient Progress Bar */}
                      <div className="w-full bg-slate-900 rounded-full h-1.5 2xl:h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-amber-600 to-amber-400 h-1.5 2xl:h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Fast Part Code Finder */}
          <div className="surface-card rounded-xl p-4 2xl:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-blue-400" />
                <span>Быстрый поиск артикула</span>
              </span>
              <button
                onClick={() => setActiveTab('parts')}
                className="text-xs 2xl:text-sm text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center space-x-1"
              >
                <span>Каталог</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Поиск по коду (напр. S TL C00117/8)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setActiveTab('parts');
                  }
                }}
                className="w-full input-sm 2xl:h-9 pl-9 font-mono text-xs 2xl:text-sm"
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
                      className="cursor-pointer p-2.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-white/[0.06] flex items-center justify-between text-xs sm:text-sm transition-colors"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-blue-400 text-xs sm:text-sm">{t.article}</span>
                          {t.carName && <span className="text-xs text-slate-400 font-mono">({t.carName})</span>}
                        </div>
                        <span className="text-xs text-slate-400 truncate block max-w-[200px] mt-0.5">
                          {t.description || cli?.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-amber-400 text-xs sm:text-sm">
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
