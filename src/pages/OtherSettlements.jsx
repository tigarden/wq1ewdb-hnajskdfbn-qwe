import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { formatMoney } from '../utils/format';
import { 
  Users, 
  Plus, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Phone, 
  Calendar,
  FileText
} from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

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
    const p = addOtherCounterparty({ name: personName.trim(), phone: personPhone.trim() });
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
      note: txNote.trim(),
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

  // Filtered counterparties
  const filteredCounterparties = data.otherCounterparties.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.phone && p.phone.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Top Status & Action Bar */}
      <div className="surface-card p-3.5 sm:p-4 2xl:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg border border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 2xl:w-9 2xl:h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 2xl:w-5 2xl:h-5" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm 2xl:text-base font-bold uppercase tracking-wider text-slate-200">
              Взаиморасчеты с контрагентами
            </h1>
            <p className="text-xs 2xl:text-sm text-slate-400 mt-0.5">
              Мастера, автосервисы, токари, подрядчики и партнеры
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="h-8 2xl:h-9 px-3 2xl:px-4 rounded-lg bg-[#090d16] border border-white/10 text-xs 2xl:text-sm font-mono flex items-center space-x-2">
            <span className="text-slate-400">Итого:</span>
            <strong className={`font-bold ${grandTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatMoney(grandTotal)}
            </strong>
          </div>
          <button
            onClick={() => setIsAddPersonModalOpen(true)}
            className="btn-sm 2xl:btn-md h-8 2xl:h-9 px-3.5 2xl:px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs 2xl:text-sm font-bold transition-colors cursor-pointer shadow-xs shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
            <span>Добавить</span>
          </button>
        </div>
      </div>

      {/* Two Columns: Persons List & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 2xl:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Persons List */}
        <div className="lg:col-span-4 2xl:col-span-3 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск контрагента..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-md 2xl:h-10 w-full pl-9 pr-3 text-xs 2xl:text-sm"
            />
          </div>

          {filteredCounterparties.length === 0 ? (
            <div className="surface-card rounded-xl p-6">
              <EmptyState
                icon={Users}
                title="Контрагенты не найдены"
                description={searchQuery ? 'Попробуйте изменить поисковый запрос.' : 'Добавьте первого человека или партнера.'}
                actionLabel={searchQuery ? undefined : 'Добавить контрагента'}
                onAction={searchQuery ? undefined : () => setIsAddPersonModalOpen(true)}
              />
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[750px] overflow-y-auto pr-0.5 custom-scrollbar">
              {filteredCounterparties.map((p) => {
                const st = getOtherCounterpartyStats(p.id);
                const isSelected = p.id === selectedPersonId;
                const isPositive = (st?.balance || 0) >= 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPersonId(p.id)}
                    className={`cursor-pointer p-3 rounded-lg border transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                        : 'bg-white/[0.01] hover:bg-white/[0.04] border-white/5 text-slate-300'
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-slate-100 text-xs sm:text-sm 2xl:text-base">{p.name}</h3>
                      {p.phone ? (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1.5 font-mono">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{p.phone}</span>
                        </p>
                      ) : (
                        <span className="text-xs text-slate-500">Контрагент</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-xs sm:text-sm 2xl:text-base font-bold font-mono ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {formatMoney(st?.balance || 0)}
                      </div>
                      <span className="text-xs text-slate-500 uppercase font-semibold">баланс</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Person Transactions History */}
        <div className="lg:col-span-8 2xl:col-span-9">
          {currentPerson && currentStats ? (
            <div className="surface-card rounded-xl p-4 2xl:p-5 space-y-4 shadow-lg border border-white/[0.08]">
              
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3.5 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <h2 className="text-base 2xl:text-lg font-bold text-slate-100">{currentPerson.name}</h2>
                    {currentPerson.phone && (
                      <span className="text-xs text-slate-300 bg-white/5 px-2.5 py-0.5 rounded-md border border-white/10 flex items-center space-x-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{currentPerson.phone}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs 2xl:text-sm font-mono mt-1">
                    <span className="text-slate-400">Расчетный баланс:</span>
                    <strong className={`font-bold ${currentStats.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatMoney(currentStats.balance)}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsAddTxModalOpen(true)}
                    className="btn-sm 2xl:btn-md h-8 2xl:h-9 px-3.5 2xl:px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs 2xl:text-sm font-bold transition-colors cursor-pointer shadow-xs shadow-emerald-500/20"
                  >
                    <Plus className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
                    <span>Записать сумму</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Удалить контрагента "${currentPerson.name}" со всей историей?`)) {
                        deleteOtherCounterparty(currentPerson.id);
                        setSelectedPersonId(null);
                      }
                    }}
                    className="h-8 2xl:h-9 w-8 2xl:w-9 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center justify-center transition-colors cursor-pointer"
                    title="Удалить контрагента"
                  >
                    <Trash2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#090d16] text-slate-400 uppercase font-semibold text-xs 2xl:text-sm tracking-wider">
                      <th className="py-3 px-3.5">Дата</th>
                      <th className="py-3 px-3.5">Тип операции</th>
                      <th className="py-3 px-3.5 text-right">Сумма</th>
                      <th className="py-3 px-3.5">Примечание / Назначение</th>
                      <th className="py-3 px-3.5 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {currentStats.transactions.map((tx) => {
                      const isPositive = (tx.amount || 0) >= 0;
                      return (
                        <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-3.5 text-slate-400 font-mono whitespace-nowrap">
                            {tx.date || new Date(tx.createdAt).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-semibold ${
                              isPositive
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                              <span>{isPositive ? '+ Долг нам' : '- Оплата / Возврат'}</span>
                            </span>
                          </td>
                          <td className={`py-3 px-3.5 text-right font-mono font-bold text-xs sm:text-sm 2xl:text-base whitespace-nowrap ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {isPositive ? `+${formatMoney(tx.amount)}` : formatMoney(tx.amount)}
                          </td>
                          <td className="py-3 px-3.5 text-slate-300">
                            {tx.note || <span className="text-slate-600 font-mono">—</span>}
                          </td>
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <button
                              onClick={() => deleteOtherTransaction(tx.id)}
                              className="w-7 h-7 2xl:w-8 2xl:h-8 flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors rounded cursor-pointer"
                              title="Удалить запись"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {currentStats.transactions.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-10">
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
            <div className="surface-card p-10 rounded-lg flex flex-col items-center justify-center">
              <EmptyState
                icon={Users}
                title="Контрагент не выбран"
                description="Выберите контрагента из списка слева для просмотра карточки и истории операций."
              />
            </div>
          )}
        </div>

      </div>

      {/* Modal: Add Person */}
      <Modal isOpen={isAddPersonModalOpen} onClose={() => setIsAddPersonModalOpen(false)} title="Добавить контрагента">
        <form onSubmit={handleCreatePerson} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Имя / Описание / СТО *</label>
            <input
              type="text"
              placeholder="напр. Мастер Ваня, СТО Автомир, Токарь Андрей..."
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="w-full input-md"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Телефон (опционально)</label>
            <input
              type="text"
              placeholder="+380..."
              value={personPhone}
              onChange={(e) => setPersonPhone(e.target.value)}
              className="w-full input-md font-mono"
            />
          </div>
          <div className="pt-1">
            <button
              type="submit"
              className="w-full h-10 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer"
            >
              Создать контрагента
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Transaction */}
      <Modal isOpen={isAddTxModalOpen} onClose={() => setIsAddTxModalOpen(false)} title={`Записать операцию [${currentPerson?.name}]`}>
        <form onSubmit={handleAddTx} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Тип операции</label>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value)}
                className="w-full input-md font-semibold"
              >
                <option value="plus" className="bg-[#0b0f19] text-white">+ Долг нам (начисление)</option>
                <option value="minus" className="bg-[#0b0f19] text-white">- Возврат / Оплата</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Сумма (грн) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                className="w-full input-md font-mono font-bold text-white"
                required
                autoFocus
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Дата</label>
            <input
              type="date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              className="w-full input-md font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Примечание / Назначение</label>
            <input
              type="text"
              placeholder="Ремонт суппорта, токарные работы, займ..."
              value={txNote}
              onChange={(e) => setTxNote(e.target.value)}
              className="w-full input-md"
            />
          </div>
          <div className="pt-1">
            <button
              type="submit"
              className="w-full h-10 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer"
            >
              Сохранить запись
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

