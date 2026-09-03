import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Search, Package, User, Truck, Car } from 'lucide-react';

export default function PartsCatalog() {
  const { data } = useData();
  const [query, setQuery] = useState('');

  const formatMoney = (val) => {
    return (val || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' грн';
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
          entries: [],
        };
      }
      if (tx.description) map[key].descriptions.add(tx.description);
      const cli = (data.clients || []).find((c) => c.id === tx.clientId);
      map[key].entries.push({
        ...tx,
        clientName: cli?.name || '—',
      });
    });

    return Object.values(map).map((item) => ({
      ...item,
      descriptions: Array.from(item.descriptions),
      minPrice: Math.min(...item.entries.map((e) => e.amount)),
      maxPrice: Math.max(...item.entries.map((e) => e.amount)),
    }));
  }, [data.clientTransactions, data.clients]);

  const filtered = catalog.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.article.toLowerCase().includes(q) ||
      item.descriptions.some((d) => d.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-400" />
              <span>База и поиск артикулов</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              История деталей по клиентам: цены, даты, авто и поставщики
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            Уникальных кодов: <strong>{catalog.length}</strong>
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Введите артикул (напр. S SF OF1053, S TL C00117/8) или название..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.article}
            className="bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="text-base font-bold font-mono text-blue-300">
                    {item.article}
                  </span>
                  <span className="text-xs text-slate-400 px-2 py-0.5 rounded-full bg-slate-800">
                    {item.entries.length} записей
                  </span>
                </div>
                {item.descriptions.length > 0 && (
                  <p className="text-xs text-slate-300 mt-1">
                    {item.descriptions.join(' • ')}
                  </p>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase">Диапазон цен</span>
                <div className="text-sm font-bold font-mono text-emerald-400">
                  {item.minPrice === item.maxPrice
                    ? formatMoney(item.minPrice)
                    : `${formatMoney(item.minPrice)} – ${formatMoney(item.maxPrice)}`}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                История записей по клиентам:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                {item.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center space-x-1">
                        <User className="w-3 h-3 text-blue-400" />
                        <span>{entry.clientName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex space-x-2">
                        <span>{entry.date || '—'}</span>
                        {entry.carName && <span>• Авто: {entry.carName}</span>}
                        {entry.supplierName && <span>• Пост: {entry.supplierName}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono text-amber-400">
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
          <div className="bg-slate-900/60 p-12 rounded-2xl border border-slate-800 text-center text-slate-500 text-sm">
            Артикулов не найдено.
          </div>
        )}
      </div>

    </div>
  );
}
