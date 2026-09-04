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
  User, 
  Filter, 
  Percent,
  Plus
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
      
      {/* Header Banner */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span>Очередь закупок и доход</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Заполняйте закупочные цены от поставщиков и контролируйте чистую прибыль с деталей
          </p>
        </div>

        {incomeStats.pendingCount > 0 && (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Ожидают цену: {incomeStats.pendingCount} дет.</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Чистый доход"
          value={`+${formatMoney(incomeStats.totalProfit)}`}
          subtitle={`С ${incomeStats.filledCount} рассчитанных деталей`}
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
          title="В очереди на цену"
          value={`${incomeStats.pendingCount} дет.`}
          subtitle={incomeStats.pendingCount > 0 ? 'Требуется вписать себестоимость' : 'Все цены заполнены!'}
          icon={Clock}
          variant={incomeStats.pendingCount > 0 ? 'amber' : 'slate'}
        />
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Filter buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setFilterMode('pending')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterMode === 'pending'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>В очереди ({incomeStats.pendingCount})</span>
          </button>

          <button
            onClick={() => setFilterMode('filled')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterMode === 'filled'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>С ценой ({incomeStats.filledCount})</span>
          </button>

          <button
            onClick={() => setFilterMode('all')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>Все детали ({allItems.length})</span>
          </button>
        </div>

        {/* Client filter & Search */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedClientFilter}
            onChange={(e) => setSelectedClientFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">Все клиенты</option>
            {(data.clients || []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-blue-500 w-32 sm:w-40"
            />
          </div>
        </div>

      </div>

      {/* Queue Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Дата</th>
                <th className="py-3 px-4">Клиент</th>
                <th className="py-3 px-4">Артикул / Деталь</th>
                <th className="py-3 px-4">Авто</th>
                <th className="py-3 px-4">Поставщик</th>
                <th className="py-3 px-4 text-right">Продано клиенту</th>
                <th className="py-3 px-4 text-center">Цена покупки (грн)</th>
                <th className="py-3 px-4 text-right">Доход / Маржа</th>
                <th className="py-3 px-4 text-center">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
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

                return (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Date */}
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {tx.date || new Date(tx.createdAt).toLocaleDateString('ru-RU')}
                    </td>

                    {/* Client */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-200 px-2 py-0.5 rounded-md bg-slate-800">
                        {cli?.name || 'Клиент'}
                      </span>
                    </td>

                    {/* Article & Description */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-blue-300">
                        {tx.article || '—'}
                      </div>
                      <div className="text-slate-400 text-[11px] max-w-xs truncate">
                        {tx.description || '—'}
                      </div>
                    </td>

                    {/* Car */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                      {(tx.carName || cli?.car) ? (
                        <span className="inline-flex items-center space-x-1 text-xs">
                          <Car className="w-3.5 h-3.5 text-blue-400" />
                          <span>{tx.carName || cli?.car}</span>
                        </span>
                      ) : '—'}
                    </td>

                    {/* Supplier Input/Select */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <input
                        type="text"
                        placeholder="Склад / Поставщик"
                        value={currentSupplierVal}
                        onChange={(e) => handleSupplierChange(tx.id, e.target.value)}
                        className="w-28 sm:w-32 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-blue-500"
                      />
                    </td>

                    {/* Client Sale Price */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400 whitespace-nowrap">
                      {formatMoney(tx.amount)}
                    </td>

                    {/* Purchase Price Input */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Цена покупки..."
                          value={currentPurchaseVal}
                          onChange={(e) => handlePriceChange(tx.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveItem(tx);
                          }}
                          className={`w-28 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-right focus:outline-hidden transition-all ${
                            numPurchase > 0
                              ? 'bg-slate-800 text-slate-100 border border-emerald-500/50'
                              : 'bg-amber-950/40 text-amber-200 border border-amber-500/50 animate-pulse focus:animate-none'
                          }`}
                        />
                      </div>
                    </td>

                    {/* Profit / Margin Result */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {numPurchase > 0 ? (
                        <div>
                          <div className={`font-mono font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {profit >= 0 ? `+${formatMoney(profit)}` : formatMoney(profit)}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            +{marginPercent.toFixed(0)}% наценка
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">
                          Ожидает ввода
                        </span>
                      )}
                    </td>

                    {/* Save Button */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleSaveItem(tx)}
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isSaved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Сохранено</span>
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
                  <td colSpan="9" className="py-10">
                    <EmptyState
                      icon={CheckCircle2}
                      title={filterMode === 'pending' ? 'Очередь цен пуста' : 'Нет подходящих позиций'}
                      description={filterMode === 'pending' ? 'Все себестоимости деталей уже заполнены и рассчитаны.' : 'Попробуйте изменить параметры фильтрации или поисковый запрос.'}
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
