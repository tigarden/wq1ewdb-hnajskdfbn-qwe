import React from 'react';
import { Search, Plus, Car, Phone, ArrowUpDown, User } from 'lucide-react';
import Badge from '../Badge';
import { formatMoney } from '../../utils/format';

export default function ClientList({
  clients = [],
  selectedClientId,
  onSelectClient,
  onOpenAddModal,
  getClientStats,
  searchQuery,
  setSearchQuery,
  sortByDebt,
  setSortByDebt,
}) {
  const filteredClients = clients
    .filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.car && c.car.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
      );
    })
    .sort((a, b) => {
      if (sortByDebt) {
        const debtA = getClientStats(a.id)?.currentDebt || 0;
        const debtB = getClientStats(b.id)?.currentDebt || 0;
        return debtB - debtA;
      }
      return a.name.localeCompare(b.name, 'ru');
    });

  return (
    <div className="flex flex-col h-full surface-card rounded-xl border border-white/[0.08] overflow-hidden shadow-lg">
      {/* Top Search & Actions */}
      <div className="p-3.5 2xl:p-4 border-b border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs 2xl:text-sm font-bold text-slate-200 uppercase tracking-wider">
              Клиенты
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-white/5 font-bold">
              {filteredClients.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="btn-md sm:btn-sm 2xl:btn-md btn-primary px-3 font-bold shadow-xs shadow-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 stroke-[2.5]" />
            <span>Клиент</span>
          </button>
        </div>

        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none shrink-0" />
          <input
            type="text"
            placeholder="Поиск по имени, авто, тел..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full input-md sm:input-sm input-search font-mono"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
          <button
            type="button"
            onClick={() => setSortByDebt(!sortByDebt)}
            className="flex items-center space-x-1 hover:text-slate-200 transition-colors cursor-pointer group"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-180 transition-transform" />
            <span>{sortByDebt ? 'Сортировка: по долгу' : 'Сортировка: по алфавиту'}</span>
          </button>
        </div>
      </div>

      {/* Clients Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.05] custom-scrollbar">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center text-xs 2xl:text-sm text-slate-500">
            Никого не найдено по запросу
          </div>
        ) : (
          filteredClients.map((client) => {
            const isSelected = client.id === selectedClientId;
            const stats = getClientStats(client.id);
            const currentDebt = stats?.currentDebt || 0;

            return (
              <button
                key={client.id}
                type="button"
                onClick={() => onSelectClient(client.id)}
                className={`w-full text-left p-3 2xl:p-3.5 transition-all flex flex-col space-y-1.5 cursor-pointer relative ${
                  isSelected
                    ? 'bg-blue-600/15 border-l-2 border-blue-500 shadow-inner'
                    : 'hover:bg-white/[0.03] border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm 2xl:text-base font-bold text-slate-100 truncate pr-2">
                    {client.name}
                  </span>
                  <span className={`text-xs sm:text-sm 2xl:text-base font-bold font-mono tracking-tight ${
                    currentDebt > 0 ? 'text-amber-400' : currentDebt < 0 ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {formatMoney(currentDebt)}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  {client.car && (
                    <span className="flex items-center space-x-1 truncate max-w-[150px] px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-xs font-mono">
                      <Car className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{client.car}</span>
                    </span>
                  )}
                  {client.phone && (
                    <span className="flex items-center space-x-1 shrink-0 text-xs text-slate-400 font-mono">
                      <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{client.phone}</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
