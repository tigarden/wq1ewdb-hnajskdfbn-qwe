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

      {/* Top Status & Action Bar */}
      <div className="surface-card p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
              Очередь закупок и маржинальность
            </h1>
            <p className="text-[11px] text-slate-500">
              Ввод себестоимости от поставщиков и расчет маржи по каждой позиции
            </p>
          </div>
        </div>

        {incomeStats.pendingCount > 0 ? (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Требуют ввода: <strong>{incomeStats.pendingCount} дет.</strong></span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Все цены заполнены</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
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
      <div className="surface-card p-2.5 sm:p-3 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        
        {/* Segmented Filter Pills */}
        <div className="h-8 flex p-0.5 bg-[#090d16] rounded-md border border-white/10 overflow-x-auto">
          <button
            onClick={() => setFilterMode('pending')}
            className={`h-7 px-3 rounded text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 transition-colors cursor-pointer ${
              filterMode === 'pending'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Очередь ({incomeStats.pendingCount})</span>
          </button>

          <button
            onClick={() => setFilterMode('filled')}
            className={`h-7 px-3 rounded text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 transition-colors cursor-pointer ${
              filterMode === 'filled'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>С ценой ({incomeStats.filledCount})</span>
          </button>

          <button
            onClick={() => setFilterMode('all')}
            className={`h-7 px-3 rounded text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
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
            className="input-sm h-8 rounded-md text-xs cursor-pointer"
          >
            <option value="all" className="bg-[#0b0f19] text-white">Все клиенты</option>
            {(data.clients || []).map((c) => (
              <option key={c.id} value={c.id} className="bg-[#0b0f19] text-white">{c.name}</option>
            ))}
          </select>

          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск по коду, названию, авто..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-sm h-8 w-full sm:w-60 pl-8 pr-2.5 rounded-md text-xs"
            />
          </div>
        </div>

      </div>

      {/* Queue Table Card */}
      <div className="surface-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#090d16] text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Дата / Клиент</th>
                <th className="py-2.5 px-3">Артикул / Деталь</th>
                <th className="py-2.5 px-3">Автомобиль</th>
                <th className="py-2.5 px-3">Поставщик</th>
                <th className="py-2.5 px-3 text-right">Продажа</th>
                <th className="py-2.5 px-3 text-center">Себестоимость</th>
                <th className="py-2.5 px-3 text-right">Чистый доход</th>
                <th className="py-2.5 px-3 text-center">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
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
                    className={`transition-colors ${
                      hasPendingCost ? 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    
                    {/* Date & Client */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-200">
                        {cli?.name || 'Клиент'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {tx.date || new Date(tx.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </td>

                    {/* Article & Description */}
                    <td className="py-2.5 px-3">
                      {tx.article ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20 text-[11px]">
                            {tx.article}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(tx.article)}
                            className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 cursor-pointer"
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
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {(tx.carName || cli?.car) ? (
                        <span className="inline-flex items-center space-x-1 text-xs text-slate-300">
                          <Car className="w-3 h-3 text-blue-400 shrink-0" />
                          <span className="truncate max-w-[130px]">{tx.carName || cli?.car}</span>
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Supplier Input with Autocomplete */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <input
                        type="text"
                        list="suppliers-autocomplete-list"
                        placeholder="Склад / Поставщик"
                        value={currentSupplierVal}
                        onChange={(e) => handleSupplierChange(tx.id, e.target.value)}
                        className="input-sm h-8 w-32 sm:w-36 text-xs px-2 rounded-md"
                      />
                    </td>

                    {/* Client Sale Price */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400 text-xs sm:text-sm whitespace-nowrap">
                      {formatMoney(tx.amount)}
                    </td>

                    {/* Purchase Price Input */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
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
                          className={`h-8 w-24 px-2 rounded-md text-xs font-mono font-bold text-right focus:outline-none transition-colors ${
                            numPurchase > 0
                              ? 'bg-[#0b0f19] text-white border border-white/10 focus:border-emerald-500'
                              : 'bg-amber-950/30 text-amber-200 border border-amber-500/50 focus:border-amber-400'
                          }`}
                        />
                        <span className="text-slate-500 text-[10px] font-mono">грн</span>
                      </div>
                    </td>

                    {/* Profit / Margin Result */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      {numPurchase > 0 ? (
                        <div>
                          <div className={`font-mono font-bold text-xs sm:text-sm ${
                            profit > 0 ? 'text-emerald-400' : profit === 0 ? 'text-slate-400' : 'text-rose-400'
                          }`}>
                            {profit > 0 ? `+${formatMoney(profit)}` : formatMoney(profit)}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            +{marginPercent.toFixed(0)}%
                          </div>
                        </div>
                      ) : (
                        <span className="text-amber-400/80 text-[11px] font-mono">
                          Ожидает цену
                        </span>
                      )}
                    </td>

                    {/* Save Button */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleSaveItem(tx)}
                        className={`btn-sm h-8 px-2.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                          isSaved
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Готово</span>
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

