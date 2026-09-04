import React from 'react';
import { Search, Plus, Car, Phone, ArrowUpDown } from 'lucide-react';
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
    <div className="flex flex-col h-full surface-card rounded-xl border border-white/5 overflow-hidden">
      {/* Top Search & Actions */}
      <div className="p-3 border-b border-white/5 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Клиенты ({filteredClients.length})
          </h2>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Поиск по имени, авто, тел..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900/80 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
          <button
            type="button"
            onClick={() => setSortByDebt(!sortByDebt)}
            className="flex items-center space-x-1 hover:text-slate-200 transition-colors"
          >
            <ArrowUpDown className="w-3 h-3 text-blue-400" />
            <span>{sortByDebt ? 'Сортировка: по долгу' : 'Сортировка: по алфавиту'}</span>
          </button>
        </div>
      </div>

      {/* Clients Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
        {filteredClients.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
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
                className={`w-full text-left p-3 transition-colors flex flex-col space-y-1 ${
                  isSelected
                    ? 'bg-blue-600/10 border-l-2 border-blue-500'
                    : 'hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 truncate pr-2">
                    {client.name}
                  </span>
                  <Badge
                    variant={currentDebt > 0 ? 'rose' : currentDebt < 0 ? 'emerald' : 'slate'}
                    size="sm"
                  >
                    {formatMoney(currentDebt)}
                  </Badge>
                </div>

                <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                  {client.car && (
                    <span className="flex items-center space-x-1 truncate">
                      <Car className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{client.car}</span>
                    </span>
                  )}
                  {client.phone && (
                    <span className="flex items-center space-x-1 shrink-0">
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
