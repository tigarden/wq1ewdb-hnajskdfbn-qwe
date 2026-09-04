import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { formatMoney, pluralize } from '../utils/format';
import { 
  Search, 
  Package, 
  User, 
  Truck, 
  Car, 
  Copy, 
  Check, 
  TrendingUp, 
  Layers, 
  X 
} from 'lucide-react';

export default function PartsCatalog() {
  const { data } = useData();
  const [query, setQuery] = useState('');
  const [copiedArticle, setCopiedArticle] = useState(null);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedArticle(text);
    setTimeout(() => setCopiedArticle(null), 1800);
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

    return Object.values(map).map((item) => ({
      ...item,
      descriptions: Array.from(item.descriptions),
      cars: Array.from(item.cars),
      suppliers: Array.from(item.suppliers),
      minPrice: Math.min(...item.entries.map((e) => e.amount)),
      maxPrice: Math.max(...item.entries.map((e) => e.amount)),
    }));
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
      <div className="surface-card p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
              Каталог и история артикулов
            </h1>
            <p className="text-[11px] text-slate-500">
              Поиск по каталожным номерам, история замен и разброс цен по клиентам
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="h-8 px-3 rounded-md bg-[#090d16] border border-white/10 text-xs font-mono flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Кодов:</span>
            <strong className="text-blue-300 font-bold">{catalog.length}</strong>
          </div>
          <div className="h-8 px-3 rounded-md bg-[#090d16] border border-white/10 text-xs font-mono flex items-center space-x-1.5">
            <span className="text-slate-400">Установок:</span>
            <strong className="text-emerald-400 font-bold">{totalEntriesCount}</strong>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="surface-card p-2 rounded-lg">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Поиск по артикулу (напр. S SF OF1053), названию или модели авто..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-md w-full pl-9 pr-9 font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 w-6 h-6 flex items-center justify-center text-slate-500 hover:text-white rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.article}
            className="surface-card p-3.5 sm:p-4 rounded-lg space-y-3 transition-colors hover:border-white/20 group"
          >
            {/* Top Bar: Code, Count & Price Range */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm font-bold font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 tracking-wider">
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
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 font-mono border border-white/10">
                    {pluralize(item.entries.length, ['запись', 'записи', 'записей'])}
                  </span>
                </div>

                {item.descriptions.length > 0 && (
                  <p className="text-xs text-slate-200 mt-1.5 font-medium">
                    {item.descriptions.join(' • ')}
                  </p>
                )}

                {/* Cars chips */}
                {item.cars.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <Car className="w-3 h-3 text-slate-500 mr-0.5" />
                    {item.cars.map((car) => (
                      <span key={car} className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/10 font-mono">
                        {car}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block">Диапазон цен</span>
                <div className="text-sm sm:text-base font-bold font-mono text-amber-400 mt-0.5">
                  {item.minPrice === item.maxPrice
                    ? formatMoney(item.minPrice)
                    : `${formatMoney(item.minPrice)} – ${formatMoney(item.maxPrice)}`}
                </div>
              </div>
            </div>

            {/* Clients Installation History */}
            <div className="pt-2.5 border-t border-white/5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                История установок по клиентам:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                {item.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-2.5 rounded-md surface-elevated border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                        <User className="w-3 h-3 text-blue-400" />
                        <span>{entry.clientName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 font-mono">
                        <span className="text-slate-500">{entry.date || '—'}</span>
                        {entry.carName && <span className="text-slate-400">🚗 {entry.carName}</span>}
                        {entry.supplierName && <span className="text-slate-500">🏢 {entry.supplierName}</span>}
                      </div>
                    </div>
                    <div className="text-right pl-2">
                      <span className="font-bold font-mono text-amber-400 text-xs">
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

