import React from 'react';
import { Plus, CreditCard, Settings2, Trash2, Car, Phone, FileText } from 'lucide-react';
import StatCard from '../StatCard';
import { formatMoney } from '../../utils/format';

export default function ClientHeader({
  client,
  stats,
  onOpenAddItem,
  onOpenAddPayment,
  onOpenEdit,
  onDeleteClient,
}) {
  if (!client) return null;

  const currentDebt = stats?.currentDebt || 0;

  const handleDelete = () => {
    if (window.confirm(`Вы действительно хотите удалить карточку клиента "${client.name}" и все связанные транзакции?`)) {
      onDeleteClient(client.id);
    }
  };

  return (
    <div className="surface-card rounded-xl border border-white/5 p-4 sm:p-5 space-y-4">
      {/* Top Details & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-100">{client.name}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            {client.car && (
              <span className="flex items-center space-x-1">
                <Car className="w-3.5 h-3.5 text-blue-400" />
                <span>{client.car}</span>
              </span>
            )}
            {client.phone && (
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{client.phone}</span>
              </span>
            )}
            {client.notes && (
              <span className="flex items-center space-x-1 text-slate-400 italic">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>{client.notes}</span>
              </span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddItem}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Запчасть</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddPayment}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Оплата</span>
          </button>

          <button
            type="button"
            onClick={onOpenEdit}
            title="Редактировать клиента"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors border border-white/5"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            title="Удалить клиента"
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors border border-rose-500/20"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
        <StatCard
          label="Начальный долг"
          value={formatMoney(stats?.initialDebt || 0)}
          variant="slate"
        />
        <StatCard
          label="Всего запчастей"
          value={formatMoney(stats?.totalItems || 0)}
          subValue={`${stats?.itemsCount || 0} поз.`}
          variant="blue"
        />
        <StatCard
          label="Всего оплачено"
          value={formatMoney(stats?.totalPayments || 0)}
          subValue={`${stats?.paymentsCount || 0} платежей`}
          variant="emerald"
        />
        <StatCard
          label="Текущий баланс"
          value={formatMoney(currentDebt)}
          subValue={
            currentDebt > 0
              ? 'Долг клиента нам'
              : currentDebt < 0
              ? 'Переплата клиента'
              : 'Расчет закрыт'
          }
          variant={currentDebt > 0 ? 'rose' : currentDebt < 0 ? 'emerald' : 'slate'}
        />
      </div>
    </div>
  );
}
