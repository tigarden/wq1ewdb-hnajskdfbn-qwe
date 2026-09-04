import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { formatMoney, pluralize } from '../utils/format';
import { copyToClipboard } from '../utils/clipboard';
import { 
  Search, 
  Package, 
  User, 
  Truck, 
  Car, 
  Copy, 
  Check, 
  X,
  Layers
} from 'lucide-react';

export default function PartsCatalog({ initialQuery = '' }) {
  const { data } = useData();
  const [query, setQuery] = useState(initialQuery);
  const [copiedArticle, setCopiedArticle] = useState(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleCopy = async (text) => {
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedArticle(text);
      setTimeout(() => setCopiedArticle(null), 1800);
    }
  };

  const catalog = useMemo(() => {
    const map = {};
    (data.clientTransactions || []).forEach((tx) => {
      if (tx.type !== 'item' || !tx.article) return;
      const key = tx.article.trim().toUpperCase();
      if (!map[key]) {
        map[key] = {
          article: key,
          descriptions: new Set(),
          cars: new Set(),
          suppliers: new Set(),
          entries: [],
        };
      }
      if (tx.description) map[key].descriptions.add(tx.description);
      if (tx.carName) map[key].cars.add(tx.carName);
      if (tx.supplierName) map[key].suppliers.add(tx.supplierName);

      const cli = (data.clients || []).find((c) => c.id === tx.clientId);
      map[key].entries.push({
        ...tx,
        clientName: cli?.name || '—',
      });
    });

    return Object.values(map).map((item) => {
      const amounts = item.entries.map((e) => Number(e.amount) || 0);
      return {
        ...item,
        descriptions: Array.from(item.descriptions),
        cars: Array.from(item.cars),
        suppliers: Array.from(item.suppliers),
        minPrice: amounts.length > 0 ? Math.min(...amounts) : 0,
        maxPrice: amounts.length > 0 ? Math.max(...amounts) : 0,
      };
    });
  }, [data.clientTransactions, data.clients]);

  const filtered = catalog.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.article.toLowerCase().includes(q) ||
      item.descriptions.some((d) => d.toLowerCase().includes(q)) ||
      item.cars.some((c) => c.toLowerCase().includes(q))
    );
  });

  const totalEntriesCount = catalog.reduce((acc, c) => acc + c.entries.length, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Status & Action Bar */}
      <div className="surface-card p-3.5 sm:p-4 2xl:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg border border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 2xl:w-9 2xl:h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 2xl:w-5 2xl:h-5" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm 2xl:text-base font-bold uppercase tracking-wider text-slate-200">
              Каталог и история артикулов
            </h1>
            <p className="text-xs 2xl:text-sm text-slate-400 mt-0.5">
              Поиск по каталожным номерам, история замен и разброс цен по клиентам
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="h-8 2xl:h-9 px-3 2xl:px-4 rounded-lg bg-[#090d16] border border-white/10 text-xs 2xl:text-sm font-mono flex items-center space-x-2">
            <Layers className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-blue-400" />
            <span className="text-slate-400">Кодов:</span>
            <strong className="text-blue-300 font-bold">{catalog.length}</strong>
          </div>
          <div className="h-8 2xl:h-9 px-3 2xl:px-4 rounded-lg bg-[#090d16] border border-white/10 text-xs 2xl:text-sm font-mono flex items-center space-x-2">
            <span className="text-slate-400">Продаж:</span>
            <strong className="text-emerald-400 font-bold">{totalEntriesCount}</strong>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="surface-card p-2.5 2xl:p-3 rounded-xl border border-white/[0.08]">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none shrink-0" />
          <input
            type="text"
            placeholder="Поиск по артикулу (напр. S SF OF1053), названию или модели авто..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full input-md input-search input-search-clear font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div className="space-y-3.5">
        {filtered.map((item) => (
          <div
            key={item.article}
            className="surface-card p-4 2xl:p-5 rounded-xl space-y-3.5 transition-colors hover:border-white/20 group shadow-lg border border-white/[0.08]"
          >
            {/* Top Bar: Code, Count & Price Range */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm 2xl:text-base font-bold font-mono text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20 tracking-wider">
                    {item.article}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.article)}
                    className="p-1 text-slate-500 hover:text-slate-300 transition-colors rounded cursor-pointer"
                    title="Скопировать артикул"
                  >
                    {copiedArticle === item.article ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono border border-white/10">
                    {pluralize(item.entries.length, ['запись', 'записи', 'записей'])}
                  </span>
                </div>

                {item.descriptions.length > 0 && (
                  <p className="text-xs sm:text-sm text-slate-200 mt-1.5 font-medium">
                    {item.descriptions.join(' • ')}
                  </p>
                )}

                {/* Cars chips */}
                {item.cars.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <Car className="w-3.5 h-3.5 text-slate-500 mr-0.5" />
                    {item.cars.map((car) => (
                      <span key={car} className="text-xs px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-white/10 font-mono">
                        {car}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="text-right">
                <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider block">Диапазон цен</span>
                <div className="text-sm sm:text-base 2xl:text-lg font-bold font-mono text-amber-400 mt-0.5">
                  {item.minPrice === item.maxPrice
                    ? formatMoney(item.minPrice)
                    : `${formatMoney(item.minPrice)} – ${formatMoney(item.maxPrice)}`}
                </div>
              </div>
            </div>

            {/* Clients Installation History */}
            <div className="pt-3 border-t border-white/5">
              <span className="text-xs 2xl:text-sm font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
                История установок по клиентам:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2.5 text-xs sm:text-sm">
                {item.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-lg surface-elevated border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 text-xs sm:text-sm flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        <span>{entry.clientName}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-2 gap-y-0.5 font-mono">
                        <span className="text-slate-500">{entry.date || '—'}</span>
                        {entry.carName && <span className="text-slate-400">🚗 {entry.carName}</span>}
                        {entry.supplierName && <span className="text-slate-500">🏢 {entry.supplierName}</span>}
                      </div>
                    </div>
                    <div className="text-right pl-2">
                      <span className="font-bold font-mono text-amber-400 text-xs sm:text-sm 2xl:text-base">
                        {formatMoney(entry.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}

        {filtered.length === 0 && (
          <div className="surface-card p-10 rounded-lg">
            <EmptyState
              icon={Package}
              title="Артикулов не найдено"
              description={query ? `По запросу «${query}» ничего не найдено в базе деталей.` : 'В базе еще нет добавленных деталей с кодами артикулов.'}
              actionLabel={query ? 'Сбросить поиск' : undefined}
              onAction={query ? () => setQuery('') : undefined}
            />
          </div>
        )}
      </div>

    </div>
  );
}

