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
  Wallet,
  CheckCircle2,
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
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner Card */}
      <div className="card-emboss p-5 sm:p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-36 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Взаиморасчеты с контрагентами
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Учет балансов мастеров, сервисов-партнеров, субподрядчиков и физических лиц.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono flex items-center space-x-2">
            <span className="text-slate-400">Итого баланс:</span>
            <strong className={`text-base font-bold ${grandTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatMoney(grandTotal)}
            </strong>
          </div>
          <button
            onClick={() => setIsAddPersonModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-emerald-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить контрагента</span>
          </button>
        </div>
      </div>

      {/* Two Columns: Persons List & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Persons List */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Поиск контрагента..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>

          {filteredCounterparties.length === 0 ? (
            <div className="card-emboss rounded-2xl p-6">
              <EmptyState
                icon={Users}
                title="Контрагенты не найдены"
                description={searchQuery ? 'Попробуйте изменить поисковый запрос.' : 'Добавьте первого человека или партнера.'}
                actionLabel={searchQuery ? undefined : 'Добавить контрагента'}
                onAction={searchQuery ? undefined : () => setIsAddPersonModalOpen(true)}
              />
            </div>
          ) : (
            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {filteredCounterparties.map((p) => {
                const st = getOtherCounterpartyStats(p.id);
                const isSelected = p.id === selectedPersonId;
                const isPositive = (st?.balance || 0) >= 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPersonId(p.id)}
                    className={`cursor-pointer p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                        : 'card-emboss hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{p.name}</h3>
                      {p.phone ? (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{p.phone}</span>
                        </p>
                      ) : (
                        <span className="text-[10px] text-slate-500">Контрагент</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold font-mono ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {formatMoney(st?.balance || 0)}
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">баланс</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Person Transactions History */}
        <div className="lg:col-span-8">
          {currentPerson && currentStats ? (
            <div className="card-emboss rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl">
              
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-5 gap-3">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h2 className="text-lg sm:text-xl font-black text-slate-100">{currentPerson.name}</h2>
                    {currentPerson.phone && (
                      <span className="text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{currentPerson.phone}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-mono mt-1.5">
                    <span className="text-slate-400">Текущий расчетный баланс:</span>
                    <strong className={`text-base font-bold ${currentStats.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatMoney(currentStats.balance)}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsAddTxModalOpen(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Записать сумму</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Удалить контрагента "${currentPerson.name}" со всей историей?`)) {
                        deleteOtherCounterparty(currentPerson.id);
                        setSelectedPersonId(null);
                      }
                    }}
                    className="p-2 text-rose-400 hover:bg-rose-950/30 rounded-xl border border-rose-500/20 transition-colors"
                    title="Удалить контрагента"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800/60">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-950/70 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                      <th className="py-3 px-4">Дата</th>
                      <th className="py-3 px-4">Тип операции</th>
                      <th className="py-3 px-4 text-right">Сумма</th>
                      <th className="py-3 px-4">Примечание / Назначение</th>
                      <th className="py-3 px-4 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {currentStats.transactions.map((tx) => {
                      const isPositive = (tx.amount || 0) >= 0;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                            {tx.date || new Date(tx.createdAt).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              isPositive
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                              <span>{isPositive ? '+ Долг нам' : '- Возврат / Оплата'}</span>
                            </span>
                          </td>
                          <td className={`py-3 px-4 text-right font-mono font-bold text-sm whitespace-nowrap ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {isPositive ? `+${formatMoney(tx.amount)}` : formatMoney(tx.amount)}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {tx.note || <span className="text-slate-600 font-mono">—</span>}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => deleteOtherTransaction(tx.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors rounded-md"
                              title="Удалить запись"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
            <div className="card-emboss p-12 rounded-2xl flex flex-col items-center justify-center">
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
        <form onSubmit={handleCreatePerson} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Имя / Описание / СТО *</label>
            <input
              type="text"
              placeholder="напр. Мастер Ваня, СТО Автомир, Токарь Андрей..."
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Телефон (опционально)</label>
            <input
              type="text"
              placeholder="+380..."
              value={personPhone}
              onChange={(e) => setPersonPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors font-mono"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all"
            >
              Создать контрагента
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Transaction */}
      <Modal isOpen={isAddTxModalOpen} onClose={() => setIsAddTxModalOpen(false)} title={`Записать операцию [${currentPerson?.name}]`}>
        <form onSubmit={handleAddTx} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Тип операции</label>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-hidden focus:border-emerald-500 transition-colors font-semibold"
              >
                <option value="plus">+ Долг нам (начисление)</option>
                <option value="minus">- Возврат / Оплата</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Сумма (грн) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-emerald-500 font-mono font-bold text-slate-100 transition-colors"
                required
                autoFocus
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Дата</label>
            <input
              type="date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-hidden focus:border-emerald-500 transition-colors font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Примечание / Назначение</label>
            <input
              type="text"
              placeholder="Ремонт суппорта, токарные работы, займ..."
              value={txNote}
              onChange={(e) => setTxNote(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all"
            >
              Сохранить запись
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

