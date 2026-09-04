import React, { useState, useMemo } from 'react';
import { Package, CreditCard, Copy, Check, Trash2, Search, Calendar, Truck, Car, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Badge from '../Badge';
import EmptyState from '../EmptyState';
import ConfirmModal from '../ConfirmModal';
import { formatMoney } from '../../utils/format';
import { copyToClipboard } from '../../utils/clipboard';

export default function ClientLedger({
  transactions = [],
  onDeleteTransaction,
  onOpenAddItem,
  onOpenAddPayment,
}) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'item' | 'payment'
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [deletingTxId, setDeletingTxId] = useState(null);

  const handleCopy = async (text, id) => {
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
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
    <div className="surface-card rounded-xl border border-white/[0.08] overflow-hidden flex flex-col shadow-lg">
      {/* Ledger Header & Filters */}
      <div className="p-3.5 sm:p-4 2xl:p-5 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl sm:rounded-lg border border-white/[0.08] w-full sm:w-fit">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`flex-1 sm:flex-initial px-3.5 h-11 sm:h-7 rounded-lg sm:rounded-md text-xs sm:text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Все ({transactions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('item')}
            className={`flex-1 sm:flex-initial px-3.5 h-11 sm:h-7 rounded-lg sm:rounded-md text-xs sm:text-xs font-semibold transition-all ${
              filterType === 'item'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Запчасти
          </button>
          <button
            type="button"
            onClick={() => setFilterType('payment')}
            className={`flex-1 sm:flex-initial px-3.5 h-11 sm:h-7 rounded-lg sm:rounded-md text-xs sm:text-xs font-semibold transition-all ${
              filterType === 'payment'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Оплаты
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Поиск по артикулу, детали..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full input-md sm:input-sm 2xl:h-9 pl-9 font-mono"
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
        <div className="divide-y divide-white/[0.06]">
          {filteredTransactions.map((tx) => {
            const isItem = tx.type === 'item';
            const profit = isItem && tx.purchasePrice > 0 ? tx.amount - tx.purchasePrice : null;
            const margin = profit && tx.amount > 0 ? ((profit / tx.amount) * 100).toFixed(0) : null;

            return (
              <div
                key={tx.id}
                className="p-3.5 sm:p-4 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left: Info */}
                <div className="flex items-start space-x-3.5 min-w-0">
                  <div
                    className={`w-8 h-8 2xl:w-9 2xl:h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isItem
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-xs shadow-emerald-500/10'
                    }`}
                  >
                    {isItem ? <Package className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {isItem && tx.article && (
                        <button
                          type="button"
                          onClick={() => handleCopy(tx.article, tx.id)}
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-950/40 text-blue-400 border border-blue-500/30 font-mono text-xs font-bold hover:border-blue-400 transition-colors cursor-pointer"
                          title="Скопировать артикул"
                        >
                          <span>{tx.article}</span>
                          {copiedId === tx.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-60" />
                          )}
                        </button>
                      )}

                      <span className="text-xs sm:text-sm 2xl:text-base font-bold text-slate-100">
                        {isItem ? tx.description || 'Деталь' : 'Оплата от клиента'}
                      </span>

                      <span className="text-xs text-slate-500 flex items-center space-x-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{tx.date}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs 2xl:text-sm text-slate-400">
                      {tx.carName && (
                        <span className="flex items-center space-x-1 text-slate-300">
                          <Car className="w-3.5 h-3.5 text-blue-400" />
                          <span>{tx.carName}</span>
                        </span>
                      )}
                      {tx.supplierName && (
                        <span className="flex items-center space-x-1 text-slate-400">
                          <Truck className="w-3.5 h-3.5 text-slate-500" />
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
                <div className="flex items-center justify-between sm:justify-end space-x-3.5 shrink-0 pl-11 sm:pl-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base 2xl:text-lg font-bold font-mono tracking-tight ${
                        isItem ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {isItem ? `+${formatMoney(tx.amount)}` : `-${formatMoney(tx.amount)}`}
                    </div>
                    {isItem && (
                      <div className="text-xs font-mono flex items-center justify-end space-x-1.5 mt-0.5">
                        {tx.purchasePrice > 0 ? (
                          <>
                            <span className="text-slate-500">Вход: {formatMoney(tx.purchasePrice)}</span>
                            {profit > 0 && (
                              <span className="text-emerald-400 font-semibold">
                                (+{formatMoney(profit)} • {margin}%)
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-amber-500/80 italic font-sans text-xs">
                            Вход не указан
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeletingTxId(tx.id)}
                    title="Удалить запись"
                    aria-label="Удалить запись"
                    className="w-10 h-10 sm:w-8 sm:h-8 rounded-xl sm:rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 active:text-rose-400 active:bg-rose-500/20 flex items-center justify-center transition-colors opacity-100 sm:opacity-60 sm:group-hover:opacity-100 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4.5 h-4.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deletingTxId)}
        onClose={() => setDeletingTxId(null)}
        onConfirm={() => {
          if (deletingTxId) {
            onDeleteTransaction(deletingTxId);
            setDeletingTxId(null);
          }
        }}
        title="Удалить запись"
        message="Вы уверены, что хотите удалить эту операцию из истории клиента? Баланс взаиморасчетов пересчитается автоматически."
        confirmText="Удалить"
      />
    </div>
  );
}
