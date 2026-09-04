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
      
      {/* Top Banner Card */}
      <div className="card-emboss p-5 sm:p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Package className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Каталог и история артикулов
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Поиск деталей по каталожным номерам, история покупок клиентами, разброс цен и применяемость по авто.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400">Уникальных кодов:</span>
            <strong className="text-sm text-blue-300">{catalog.length}</strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono flex items-center space-x-2">
            <span className="text-slate-400">Установок:</span>
            <strong className="text-sm text-emerald-400">{totalEntriesCount}</strong>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="card-emboss p-3 rounded-2xl">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5" />
          <input
            type="text"
            placeholder="Поиск по артикулу (напр. S SF OF1053), названию или модели авто..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 p-1 text-slate-500 hover:text-slate-300 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div className="space-y-3 sm:space-y-4">
        {filtered.map((item) => (
          <div
            key={item.article}
            className="card-emboss p-4 sm:p-5 rounded-2xl hover:border-slate-700 transition-all space-y-4 shadow-xl group"
          >
            {/* Top Bar: Code, Count & Price Range */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-base sm:text-lg font-bold font-mono text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/20 tracking-wider">
                    {item.article}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.article)}
                    className="p-1 text-slate-500 hover:text-slate-300 transition-colors rounded-md"
                    title="Скопировать артикул"
                  >
                    {copiedArticle === item.article ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700">
                    {pluralize(item.entries.length, ['запись', 'записи', 'записей'])}
                  </span>
                </div>

                {item.descriptions.length > 0 && (
                  <p className="text-xs sm:text-sm text-slate-200 mt-2 font-medium">
                    {item.descriptions.join(' • ')}
                  </p>
                )}

                {/* Cars chips */}
                {item.cars.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <Car className="w-3.5 h-3.5 text-slate-500 mr-1" />
                    {item.cars.map((car) => (
                      <span key={car} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800">
                        {car}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block">Диапазон цен</span>
                <div className="text-base sm:text-lg font-bold font-mono text-amber-400 mt-0.5">
                  {item.minPrice === item.maxPrice
                    ? formatMoney(item.minPrice)
                    : `${formatMoney(item.minPrice)} – ${formatMoney(item.maxPrice)}`}
                </div>
              </div>
            </div>

            {/* Clients Installation History */}
            <div className="pt-3 border-t border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                История установок по клиентам:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                {item.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                        <User className="w-3 h-3 text-blue-400" />
                        <span>{entry.clientName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                        <span className="font-mono text-slate-500">{entry.date || '—'}</span>
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
          <div className="card-emboss p-10 rounded-2xl">
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

