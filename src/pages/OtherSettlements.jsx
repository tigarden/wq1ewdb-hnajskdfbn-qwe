import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { formatMoney } from '../utils/format';
import { Users, Plus, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function OtherSettlements() {
  const { 
    data, 
    addOtherCounterparty, 
    deleteOtherCounterparty,
    addOtherTransaction, 
    deleteOtherTransaction,
    getOtherCounterpartyStats 
  } = useData();

  const [selectedPersonId, setSelectedPersonId] = useState(data.otherCounterparties[0]?.id || null);
  const currentPerson = data.otherCounterparties.find((p) => p.id === selectedPersonId);
  const currentStats = currentPerson ? getOtherCounterpartyStats(currentPerson.id) : null;

  // Modals
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);

  // Form states
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('plus'); // 'plus' = начислено / долг нам, 'minus' = оплата / возврат
  const [txNote, setTxNote] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  const handleCreatePerson = (e) => {
    e.preventDefault();
    if (!personName.trim()) return;
    const p = addOtherCounterparty({ name: personName, phone: personPhone });
    setSelectedPersonId(p.id);
    setPersonName('');
    setPersonPhone('');
    setIsAddPersonModalOpen(false);
  };

  const handleAddTx = (e) => {
    e.preventDefault();
    if (!txAmount || !currentPerson) return;
    const finalAmount = txType === 'minus' ? -Math.abs(parseFloat(txAmount)) : Math.abs(parseFloat(txAmount));
    addOtherTransaction({
      counterpartyId: currentPerson.id,
      amount: finalAmount,
      note: txNote,
      date: txDate,
    });
    setTxAmount('');
    setTxNote('');
    setIsAddTxModalOpen(false);
  };

  // Grand total of all people
  const grandTotal = data.otherCounterparties.reduce((sum, p) => {
    const st = getOtherCounterpartyStats(p.id);
    return sum + (st?.balance || 0);
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Взаиморасчеты с контрагентами</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Мастера, партнеры, сервисы и физические лица
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 mr-2">Итого баланс:</span>
            <strong className={`text-sm font-bold ${grandTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatMoney(grandTotal)}
            </strong>
          </div>
          <button
            onClick={() => setIsAddPersonModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить контрагента</span>
          </button>
        </div>
      </div>

      {/* Two Columns: Persons List & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Persons Grid/List */}
        <div className="lg:col-span-4 space-y-2">
          {data.otherCounterparties.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Список контрагентов пуст"
              description="Добавьте первого человека (мастер, партнер, сервис)."
              actionLabel="Добавить контрагента"
              onAction={() => setIsAddPersonModalOpen(true)}
            />
          ) : (
            data.otherCounterparties.map((p) => {
              const st = getOtherCounterpartyStats(p.id);
              const isSelected = p.id === selectedPersonId;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPersonId(p.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-600/15 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{p.name}</h3>
                    {p.phone && <p className="text-xs text-slate-500">{p.phone}</p>}
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold font-mono ${
                      (st?.balance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {formatMoney(st?.balance || 0)}
                    </div>
                    <span className="text-[10px] text-slate-500">текущий баланс</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Person Transactions History */}
        <div className="lg:col-span-8">
          {currentPerson && currentStats ? (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{currentPerson.name}</h2>
                  <div className="flex items-center space-x-2 text-xs font-mono mt-1">
                    <span className="text-slate-400">Текущий баланс:</span>
                    <strong className={`text-sm ${currentStats.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatMoney(currentStats.balance)}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsAddTxModalOpen(true)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Записать сумму</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Удалить "${currentPerson.name}"?`)) {
                        deleteOtherCounterparty(currentPerson.id);
                        setSelectedPersonId(null);
                      }
                    }}
                    className="p-1.5 text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase">
                      <th className="py-2.5 px-3">Дата</th>
                      <th className="py-2.5 px-3">Операция</th>
                      <th className="py-2.5 px-3 text-right">Сумма</th>
                      <th className="py-2.5 px-3">Примечание</th>
                      <th className="py-2.5 px-3 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {currentStats.transactions.map((tx) => {
                      const isPositive = (tx.amount || 0) >= 0;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                            {tx.date || new Date(tx.createdAt).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge variant={isPositive ? 'debt' : 'payment'} size="sm">
                              {isPositive ? '+ Долг нам' : '- Возврат / Оплата'}
                            </Badge>
                          </td>
                          <td className={`py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {isPositive ? `+${formatMoney(tx.amount)}` : formatMoney(tx.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {tx.note || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => deleteOtherTransaction(tx.id)}
                              className="p-1 text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {currentStats.transactions.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-6">
                          <EmptyState
                            icon={Users}
                            title="Нет операций по контрагенту"
                            description="Запишите первую операцию: начисление долга или возврат/оплату."
                            actionLabel="Записать сумму"
                            onAction={() => setIsAddTxModalOpen(true)}
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 p-12 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
              <EmptyState
                icon={Users}
                title="Контрагент не выбран"
                description="Выберите контрагента из списка слева для просмотра истории операций."
              />
            </div>
          )}
        </div>

      </div>

      {/* Modal: Add Person */}
      <Modal isOpen={isAddPersonModalOpen} onClose={() => setIsAddPersonModalOpen(false)} title="Добавить контрагента">
        <form onSubmit={handleCreatePerson} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Имя / Описание *</label>
            <input
              type="text"
              placeholder="напр. Мастер Ваня, СТО Автомир, Саня..."
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Телефон (опционально)</label>
            <input
              type="text"
              placeholder="+380..."
              value={personPhone}
              onChange={(e) => setPersonPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all"
          >
            Создать запись
          </button>
        </form>
      </Modal>

      {/* Modal: Add Transaction */}
      <Modal isOpen={isAddTxModalOpen} onClose={() => setIsAddTxModalOpen(false)} title={`Записать операцию [${currentPerson?.name}]`}>
        <form onSubmit={handleAddTx} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Тип операции</label>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              >
                <option value="plus">+ Долг нам (начисление)</option>
                <option value="minus">- Возврат / Оплата</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Сумма (грн) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono font-bold text-slate-100"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Дата</label>
            <input
              type="date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Примечание / За что</label>
            <input
              type="text"
              placeholder="Ремонт, детали, займ..."
              value={txNote}
              onChange={(e) => setTxNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all"
          >
            Сохранить операцию
          </button>
        </form>
      </Modal>

    </div>
  );
}
