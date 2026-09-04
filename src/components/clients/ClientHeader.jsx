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
    <div className="surface-card rounded-xl border border-white/[0.08] p-4 sm:p-5 2xl:p-6 space-y-4 shadow-lg">
      {/* Top Details & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3.5">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <h1 className="text-lg sm:text-xl 2xl:text-2xl font-bold text-white tracking-tight">{client.name}</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
              ID: {client.id.slice(-6)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-slate-300">
            {client.car && (
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-slate-900 border border-white/5">
                <Car className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-blue-400" />
                <span className="font-medium text-slate-200">{client.car}</span>
              </span>
            )}
            {client.phone && (
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-slate-900 border border-white/5 font-mono text-xs sm:text-sm">
                <Phone className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-emerald-400" />
                <a href={`tel:${client.phone}`} className="hover:text-emerald-300 transition-colors">
                  {client.phone}
                </a>
              </span>
            )}
            {client.notes && (
              <span className="flex items-center space-x-1 text-slate-400 italic text-xs sm:text-sm">
                <FileText className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-slate-500" />
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
            className="btn-sm 2xl:btn-md btn-primary font-bold shadow-xs shadow-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 stroke-[2.5]" />
            <span>Запчасть</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddPayment}
            className="btn-sm 2xl:btn-md bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow-xs shadow-emerald-500/20"
          >
            <CreditCard className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 stroke-[2.5]" />
            <span>Оплата</span>
          </button>

          <button
            type="button"
            onClick={onOpenEdit}
            title="Редактировать клиента"
            className="h-8 2xl:h-9 w-8 2xl:w-9 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-950/80 hover:bg-slate-900 border border-white/10 flex items-center justify-center transition-colors"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            title="Удалить клиента"
            className="h-8 2xl:h-9 w-8 2xl:w-9 rounded-lg text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-0.5">
        <StatCard
          title="Начальный долг"
          value={formatMoney(stats?.initialDebt || 0)}
          variant="slate"
        />
        <StatCard
          title="Всего запчастей"
          value={formatMoney(stats?.totalItems || 0)}
          subtitle={`${stats?.itemsCount || 0} поз.`}
          variant="amber"
        />
        <StatCard
          title="Всего оплачено"
          value={formatMoney(stats?.totalPayments || 0)}
          subtitle={`${stats?.paymentsCount || 0} платежей`}
          variant="emerald"
        />
        <StatCard
          title="Текущий баланс"
          value={formatMoney(currentDebt)}
          subtitle={
            currentDebt > 0
              ? 'Долг клиента нам'
              : currentDebt < 0
              ? 'Переплата клиента'
              : 'Расчет закрыт'
          }
          variant={currentDebt > 0 ? 'rose' : currentDebt < 0 ? 'emerald' : 'slate'}
          badgeText={currentDebt > 0 ? 'К оплате' : 'Закрыто'}
        />
      </div>
    </div>
  );
}
