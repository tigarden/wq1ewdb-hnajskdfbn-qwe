import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { formatMoney, pluralize } from '../utils/format';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Search, 
  Save, 
  Car, 
  Truck, 
  Filter, 
  Percent,
  Copy,
  Check,
  ChevronRight,
  ArrowUpRight,
  User
} from 'lucide-react';

export default function IncomeAndQueue() {
  const { 
    data, 
    incomeStats, 
    updateItemPurchasePrice, 
    addSupplierToDirectory 
  } = useData();

  const [filterMode, setFilterMode] = useState('pending'); // 'pending' | 'filled' | 'all'
  const [selectedClientFilter, setSelectedClientFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Local draft state for inputs: { [txId]: { purchasePrice: '1200', supplierName: 'Склад' } }
  const [drafts, setDrafts] = useState({});
  const [savedSuccessId, setSavedSuccessId] = useState(null);
  const [copiedArticle, setCopiedArticle] = useState(null);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedArticle(text);
    setTimeout(() => setCopiedArticle(null), 1800);
  };

  const handlePriceChange = (txId, val) => {
    setDrafts((prev) => ({
      ...prev,
      [txId]: {
        ...prev[txId],
        purchasePrice: val,
      },
    }));
  };

  const handleSupplierChange = (txId, val) => {
    setDrafts((prev) => ({
      ...prev,
      [txId]: {
        ...prev[txId],
        supplierName: val,
      },
    }));
  };

  const handleSaveItem = (tx) => {
    const draft = drafts[tx.id] || {};
    const priceToSave = draft.purchasePrice !== undefined ? draft.purchasePrice : tx.purchasePrice;
    const supplierToSave = draft.supplierName !== undefined ? draft.supplierName : tx.supplierName;

    if (supplierToSave && !data.suppliersList?.includes(supplierToSave)) {
      addSupplierToDirectory(supplierToSave);
    }

    updateItemPurchasePrice(tx.id, priceToSave, supplierToSave);

    setSavedSuccessId(tx.id);
    setTimeout(() => {
      setSavedSuccessId(null);
    }, 2000);
  };

  // Filter items
  const allItems = (data.clientTransactions || []).filter((t) => t.type === 'item');

  const filteredItems = allItems.filter((t) => {
    // Status filter
    const hasPrice = (t.purchasePrice || 0) > 0;
    if (filterMode === 'pending' && hasPrice) return false;
    if (filterMode === 'filled' && !hasPrice) return false;

    // Client filter
    if (selectedClientFilter !== 'all' && t.clientId !== selectedClientFilter) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchArt = t.article && t.article.toLowerCase().includes(q);
      const matchDesc = t.description && t.description.toLowerCase().includes(q);
      const matchCar = t.carName && t.carName.toLowerCase().includes(q);
      if (!matchArt && !matchDesc && !matchCar) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Suppliers Datalist for fast auto-complete */}
      <datalist id="suppliers-autocomplete-list">
        {(data.suppliersList || []).map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      {/* Hero Header Banner */}
      <div className="card-emboss p-5 sm:p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-36 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Очередь закупок и маржинальность
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Вносите себестоимость от поставщиков, отслеживайте чистую прибыль и наценку по каждой детали в реальном времени.
          </p>
        </div>

        {incomeStats.pendingCount > 0 ? (
          <div className="relative z-10 flex items-center space-x-2.5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-lg shadow-amber-950/20">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Требуют себестоимость: <strong>{incomeStats.pendingCount} дет.</strong></span>
          </div>
        ) : (
          <div className="relative z-10 flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Все себестоимости заполнены!</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Чистый доход"
          value={`+${formatMoney(incomeStats.totalProfit)}`}
          subtitle={`С ${incomeStats.filledCount} рассчитанных позиций`}
          icon={TrendingUp}
          variant="emerald"
        />

        <StatCard
          title="Средняя наценка"
          value={`+${incomeStats.marginPercent.toFixed(1)}%`}
          subtitle="Маржинальность продаж"
          icon={Percent}
          variant="blue"
        />

        <StatCard
          title="Закупка поставщикам"
          value={formatMoney(incomeStats.totalPurchaseCost)}
          subtitle={`Выручка: ${formatMoney(incomeStats.totalRevenueWithCost)}`}
          icon={Truck}
          variant="slate"
        />

        <StatCard
          title="В очереди цен"
          value={`${incomeStats.pendingCount} дет.`}
          subtitle={incomeStats.pendingCount > 0 ? 'Ожидают ввода себестоимости' : 'Очередь полностью закрыта'}
          icon={Clock}
          variant={incomeStats.pendingCount > 0 ? 'amber' : 'slate'}
        />
      </div>

      {/* Filter and Control Bar */}
      <div className="card-emboss p-3 sm:p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Segmented Filter Pills */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setFilterMode('pending')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterMode === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Очередь ({incomeStats.pendingCount})</span>
          </button>

          <button
            onClick={() => setFilterMode('filled')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterMode === 'filled'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>С ценой ({incomeStats.filledCount})</span>
          </button>

          <button
            onClick={() => setFilterMode('all')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>Все детали ({allItems.length})</span>
          </button>
        </div>

        {/* Client filter & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedClientFilter}
            onChange={(e) => setSelectedClientFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-blue-500 transition-colors"
          >
            <option value="all">Все клиенты</option>
            {(data.clients || []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Поиск по коду, названию, авто..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-60 pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

      </div>

      {/* Queue Table Card */}
      <div className="card-emboss rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/70 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-4">Дата / Клиент</th>
                <th className="py-3 px-4">Артикул / Деталь</th>
                <th className="py-3 px-4">Автомобиль</th>
                <th className="py-3 px-4">Поставщик</th>
                <th className="py-3 px-4 text-right">Продажа</th>
                <th className="py-3 px-4 text-center">Себестоимость (закупка)</th>
                <th className="py-3 px-4 text-right">Чистый доход</th>
                <th className="py-3 px-4 text-center">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredItems.map((tx) => {
                const cli = (data.clients || []).find((c) => c.id === tx.clientId);
                const draft = drafts[tx.id] || {};
                const currentPurchaseVal = draft.purchasePrice !== undefined 
                  ? draft.purchasePrice 
                  : (tx.purchasePrice || '');
                const currentSupplierVal = draft.supplierName !== undefined
                  ? draft.supplierName
                  : (tx.supplierName || '');

                const numPurchase = parseFloat(currentPurchaseVal) || 0;
                const profit = numPurchase > 0 ? (tx.amount - numPurchase) : 0;
                const marginPercent = numPurchase > 0 ? ((profit / numPurchase) * 100) : 0;
                const isSaved = savedSuccessId === tx.id;
                const hasPendingCost = !numPurchase;

                return (
                  <tr 
                    key={tx.id} 
                    className={`transition-colors group ${
                      hasPendingCost ? 'bg-amber-500/[0.02] hover:bg-amber-500/[0.06]' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    
                    {/* Date & Client */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-200">
                        {cli?.name || 'Клиент'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {tx.date || new Date(tx.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </td>

                    {/* Article & Description */}
                    <td className="py-3.5 px-4">
                      {tx.article ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 text-xs">
                            {tx.article}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(tx.article)}
                            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                            title="Скопировать артикул"
                          >
                            {copiedArticle === tx.article ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-600 font-mono">—</span>
                      )}
                      <div className="text-slate-300 text-xs mt-0.5 max-w-xs truncate font-medium">
                        {tx.description || '—'}
                      </div>
                    </td>

                    {/* Car */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {(tx.carName || cli?.car) ? (
                        <span className="inline-flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                          <Car className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{tx.carName || cli?.car}</span>
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Supplier Input with Autocomplete */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="relative">
                        <input
                          type="text"
                          list="suppliers-autocomplete-list"
                          placeholder="Склад / Поставщик"
                          value={currentSupplierVal}
                          onChange={(e) => handleSupplierChange(tx.id, e.target.value)}
                          className="w-32 sm:w-36 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </td>

                    {/* Client Sale Price */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400 text-sm whitespace-nowrap">
                      {formatMoney(tx.amount)}
                    </td>

                    {/* Purchase Price Input */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={currentPurchaseVal}
                          onChange={(e) => handlePriceChange(tx.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveItem(tx);
                          }}
                          className={`w-28 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold text-right focus:outline-hidden transition-all ${
                            numPurchase > 0
                              ? 'bg-slate-950 text-slate-100 border border-slate-700 focus:border-emerald-500'
                              : 'bg-amber-950/30 text-amber-200 border border-amber-500/50 shadow-sm shadow-amber-900/30 animate-pulse focus:animate-none'
                          }`}
                        />
                        <span className="text-slate-500 text-[11px] font-mono">грн</span>
                      </div>
                    </td>

                    {/* Profit / Margin Result */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {numPurchase > 0 ? (
                        <div>
                          <div className={`font-mono font-bold text-sm ${
                            profit > 0 ? 'text-emerald-400' : profit === 0 ? 'text-slate-400' : 'text-rose-400'
                          }`}>
                            {profit > 0 ? `+${formatMoney(profit)}` : formatMoney(profit)}
                          </div>
                          <div className="flex items-center justify-end space-x-1 mt-0.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm ${
                              marginPercent >= 25 
                                ? 'bg-emerald-500/10 text-emerald-400' 
                                : marginPercent > 0 
                                  ? 'bg-amber-500/10 text-amber-400' 
                                  : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              +{marginPercent.toFixed(0)}% маржа
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-amber-400/70 text-[11px] font-medium italic">
                          Ожидает ввода
                        </span>
                      )}
                    </td>

                    {/* Save Button */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleSaveItem(tx)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isSaved
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Сохранено!</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Записать</span>
                          </>
                        )}
                      </button>
                    </td>

                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12">
                    <EmptyState
                      icon={CheckCircle2}
                      title={filterMode === 'pending' ? 'Очередь цен пуста!' : 'Нет подходящих деталей'}
                      description={filterMode === 'pending' ? 'Все закупки уже внесены и маржинальность полностью рассчитана.' : 'Попробуйте сбросить поисковый запрос или фильтр клиентов.'}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

