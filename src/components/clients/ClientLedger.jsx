import React, { useState, useMemo } from 'react';
import { Package, CreditCard, Copy, Check, Trash2, Search, Calendar, Truck, Car } from 'lucide-react';
import Badge from '../Badge';
import EmptyState from '../EmptyState';
import { formatMoney } from '../../utils/format';

export default function ClientLedger({
  transactions = [],
  onDeleteTransaction,
  onOpenAddItem,
  onOpenAddPayment,
}) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'item' | 'payment'
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (filterType !== 'all' && t.type !== filterType) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          (t.article && t.article.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.note && t.note.toLowerCase().includes(q)) ||
          (t.carName && t.carName.toLowerCase().includes(q)) ||
          (t.supplierName && t.supplierName.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  }, [transactions, filterType, search]);

  return (
    <div className="surface-card rounded-xl border border-white/5 overflow-hidden flex flex-col">
      {/* Ledger Header & Filters */}
      <div className="p-3 sm:p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-1 bg-slate-900/60 p-0.5 rounded-lg border border-white/5 w-fit">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Все ({transactions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('item')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filterType === 'item'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Запчасти
          </button>
          <button
            type="button"
            onClick={() => setFilterType('payment')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filterType === 'payment'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Оплаты
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Поиск по артикулу, детали..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          title="Записей не найдено"
          description={
            transactions.length === 0
              ? 'У клиента пока нет записей о деталях или оплатах'
              : 'Ни одна запись не соответствует фильтру'
          }
          actionLabel="+ Добавить запчасть"
          onAction={onOpenAddItem}
        />
      ) : (
        <div className="divide-y divide-white/5">
          {filteredTransactions.map((tx) => {
            const isItem = tx.type === 'item';

            return (
              <div
                key={tx.id}
                className="p-3 sm:p-4 hover:bg-white/2 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                {/* Left: Info */}
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isItem
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {isItem ? <Package className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isItem && tx.article && (
                        <button
                          type="button"
                          onClick={() => handleCopy(tx.article, tx.id)}
                          className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 font-mono text-xs font-semibold transition-colors group"
                          title="Нажмите чтобы скопировать артикул"
                        >
                          <span>{tx.article}</span>
                          {copiedId === tx.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-500 group-hover:text-blue-300" />
                          )}
                        </button>
                      )}

                      <span className="text-xs font-medium text-slate-200">
                        {isItem ? tx.description || 'Деталь' : 'Оплата от клиента'}
                      </span>

                      <span className="text-[11px] text-slate-500 flex items-center space-x-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        <span>{tx.date}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
                      {tx.carName && (
                        <span className="flex items-center space-x-1 text-slate-400">
                          <Car className="w-3 h-3 text-slate-500" />
                          <span>{tx.carName}</span>
                        </span>
                      )}
                      {tx.supplierName && (
                        <span className="flex items-center space-x-1 text-slate-400">
                          <Truck className="w-3 h-3 text-slate-500" />
                          <span>{tx.supplierName}</span>
                        </span>
                      )}
                      {tx.note && (
                        <span className="text-slate-400 italic">«{tx.note}»</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amounts & Actions */}
                <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pl-11 sm:pl-0">
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold font-mono ${
                        isItem ? 'text-slate-100' : 'text-emerald-400'
                      }`}
                    >
                      {isItem ? `+${formatMoney(tx.amount)}` : `-${formatMoney(tx.amount)}`}
                    </div>
                    {isItem && tx.purchasePrice > 0 && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        Закупка: {formatMoney(tx.purchasePrice)}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Удалить эту транзакцию?')) {
                        onDeleteTransaction(tx.id);
                      }
                    }}
                    title="Удалить запись"
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
