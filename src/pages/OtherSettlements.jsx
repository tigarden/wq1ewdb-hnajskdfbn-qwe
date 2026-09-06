import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { formatMoney } from '../utils/format';
import { copyToClipboard } from '../utils/clipboard';
import { 
  Truck, 
  Plus, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Phone, 
  Calendar, 
  FileText,
  Package,
  Copy,
  Check,
  CreditCard,
  Car
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

  const counterparties = data.otherCounterparties || [];
  const [selectedPersonId, setSelectedPersonId] = useState(counterparties[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [subTab, setSubTab] = useState('transactions'); // 'transactions' | 'parts'
  const [copiedArticle, setCopiedArticle] = useState(null);

  const handleCopy = async (text) => {
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedArticle(text);
      setTimeout(() => setCopiedArticle(null), 1800);
    }
  };

  // Sync selected person if missing or deleted
  React.useEffect(() => {
    if (counterparties.length > 0) {
      if (!selectedPersonId || !counterparties.some((p) => p.id === selectedPersonId)) {
        setSelectedPersonId(counterparties[0].id);
      }
    } else {
      setSelectedPersonId(null);
    }
  }, [counterparties, selectedPersonId]);

  const currentPerson = counterparties.find((p) => p.id === selectedPersonId);
  const currentStats = currentPerson ? getOtherCounterpartyStats(currentPerson.id) : null;

  // Modals
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isDeletePersonModalOpen, setIsDeletePersonModalOpen] = useState(false);
  const [deletingTxId, setDeletingTxId] = useState(null);

  // Form states
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('payment'); // 'payment' = оплата поставщику (минус долг), 'supply' = поставка/начисление
  const [txNote, setTxNote] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  const parseMoney = (val) => {
    if (!val) return 0;
    const clean = String(val).replace(/\s+/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

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
    const parsedAmt = parseMoney(txAmount);
    if (parsedAmt <= 0 || !currentPerson) return;
    const finalAmount = txType === 'payment' ? -Math.abs(parsedAmt) : Math.abs(parsedAmt);
    addOtherTransaction({
      counterpartyId: currentPerson.id,
      amount: finalAmount,
      note: txNote.trim(),
      date: txDate || new Date().toISOString().split('T')[0],
    });
    setTxAmount('');
    setTxNote('');
    setIsAddTxModalOpen(false);
  };

  // Grand total of all suppliers (debt to suppliers)
  const grandTotal = counterparties.reduce((sum, p) => {
    const st = getOtherCounterpartyStats(p.id);
    return sum + (st?.balance || 0);
  }, 0);

  // Filtered counterparties
  const filteredCounterparties = counterparties.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.phone && p.phone.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-4 animate-slide-up">
      
      {/* Top Status & Action Bar */}
      <div className="surface-card p-3.5 sm:p-4 2xl:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg border border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 2xl:w-9 2xl:h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 2xl:w-5 2xl:h-5" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm 2xl:text-base font-bold uppercase tracking-wider text-slate-200">
              Взаиморасчеты с поставщиками
            </h1>
            <p className="text-xs 2xl:text-sm text-slate-400 mt-0.5">
              Учет закупок запчастей из заказов, платежей и сверка долгов
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="h-8 2xl:h-9 px-3 2xl:px-4 rounded-lg bg-[#090d16] border border-white/10 text-xs 2xl:text-sm font-mono flex items-center space-x-2">
            <span className="text-slate-400">Общий долг поставщикам:</span>
            <strong className={`font-bold ${grandTotal > 0 ? 'text-rose-400' : grandTotal < 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
              {formatMoney(grandTotal)}
            </strong>
          </div>
          <button
            onClick={() => setIsAddPersonModalOpen(true)}
            className="btn-md sm:btn-sm 2xl:btn-md h-8 2xl:h-9 px-3.5 2xl:px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs 2xl:text-sm font-bold transition-colors cursor-pointer shadow-xs shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
            <span>Добавить</span>
          </button>
        </div>
      </div>

      {/* Two Columns: Persons List & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 2xl:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Persons List — hidden on mobile when detail is shown */}
        <div className={`lg:col-span-4 2xl:col-span-3 space-y-3 ${mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
          {/* Search bar */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none shrink-0" />
            <input
              type="text"
              placeholder="Поиск поставщика..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full input-md sm:input-sm input-search"
            />
          </div>

          {filteredCounterparties.length === 0 ? (
            <div className="surface-card rounded-xl p-6">
              <EmptyState
                icon={Truck}
                title="Поставщики не найдены"
                description={searchQuery ? 'Попробуйте изменить поисковый запрос.' : 'Добавьте первого поставщика запчастей или склад.'}
                actionLabel={searchQuery ? undefined : 'Добавить поставщика'}
                onAction={searchQuery ? undefined : () => setIsAddPersonModalOpen(true)}
              />
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[750px] overflow-y-auto pr-0.5 custom-scrollbar">
              {filteredCounterparties.map((p) => {
                const st = getOtherCounterpartyStats(p.id);
                const isSelected = p.id === selectedPersonId;
                const bal = st?.balance || 0;
                const partsCount = st?.parts?.length || 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedPersonId(p.id); setMobileShowDetail(true); }}
                    className={`cursor-pointer p-3 rounded-lg border transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-white shadow-xs'
                        : 'bg-white/[0.01] hover:bg-white/[0.04] border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <h3 className="font-bold text-slate-100 text-xs sm:text-sm 2xl:text-base truncate">{p.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                        <span>{partsCount} дет.</span>
                        {p.phone && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{p.phone}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-xs sm:text-sm 2xl:text-base font-bold font-mono ${
                        bal > 0 ? 'text-rose-400' : bal < 0 ? 'text-emerald-400' : 'text-slate-400'
                      }`}>
                        {formatMoney(bal)}
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">
                        {bal > 0 ? 'К оплате' : bal < 0 ? 'Переплата' : 'В расчете'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Person Transactions History */}
        <div className={`lg:col-span-8 2xl:col-span-9 ${mobileShowDetail ? 'block' : 'hidden lg:block'}`}>
          {/* Mobile Back Button */}
          <button
            type="button"
            onClick={() => setMobileShowDetail(false)}
            className="lg:hidden w-full flex items-center justify-center space-x-2 rounded-xl bg-slate-900/90 border border-white/10 py-2.5 text-sm text-slate-300 mb-3 active:scale-[0.98]"
          >
            <span>← Все поставщики</span>
          </button>

          {currentPerson && currentStats ? (
            <div className="surface-card rounded-xl p-4 2xl:p-5 space-y-4 shadow-lg border border-white/[0.08]">
              
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
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
                  <p className="text-xs text-slate-400">
                    Автоматическая синхронизация с закупками из клиентских заказов
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsAddTxModalOpen(true)}
                    className="btn-md sm:btn-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all cursor-pointer shadow-sm shadow-emerald-500/20 active:scale-95 flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Внести оплату / операцию</span>
                  </button>
                  <button
                    onClick={() => setIsDeletePersonModalOpen(true)}
                    className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl sm:rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center justify-center transition-colors cursor-pointer shrink-0 active:scale-95"
                    title="Удалить поставщика"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dossier Financial Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#090d16] border border-white/5">
                  <span className="text-xs text-slate-400 block mb-1">Закуплено деталей:</span>
                  <div className="text-sm sm:text-base font-bold font-mono text-slate-200">
                    {formatMoney(currentStats.totalSuppliedParts)}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {currentStats.parts.length} позиций из нарядов
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#090d16] border border-white/5">
                  <span className="text-xs text-slate-400 block mb-1">Оплачено поставщику:</span>
                  <div className="text-sm sm:text-base font-bold font-mono text-emerald-400">
                    {formatMoney(currentStats.totalPayments)}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Всего прямых платежей
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#090d16] border border-white/5">
                  <span className="text-xs text-slate-400 block mb-1">Баланс взаиморасчетов:</span>
                  <div className={`text-sm sm:text-base font-bold font-mono ${
                    currentStats.balance > 0 ? 'text-rose-400' : currentStats.balance < 0 ? 'text-emerald-400' : 'text-slate-300'
                  }`}>
                    {formatMoney(currentStats.balance)}
                  </div>
                  <span className="text-[11px] mt-0.5 block font-semibold text-slate-400">
                    {currentStats.balance > 0 ? 'Мы должны поставщику' : currentStats.balance < 0 ? 'Переплата поставщику' : 'Расчеты закрыты (0 ₴)'}
                  </span>
                </div>
              </div>

              {/* Sub-Tabs: Operations vs Purchased Parts */}
              <div className="flex border-b border-white/10 space-x-2 pt-2">
                <button
                  onClick={() => setSubTab('transactions')}
                  className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer flex items-center space-x-2 ${
                    subTab === 'transactions'
                      ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Оплаты и операции ({currentStats.transactions.length})</span>
                </button>
                <button
                  onClick={() => setSubTab('parts')}
                  className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer flex items-center space-x-2 ${
                    subTab === 'parts'
                      ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Закупленные запчасти ({currentStats.parts.length})</span>
                </button>
              </div>

              {/* TAB 1: Transactions & Payments */}
              {subTab === 'transactions' && (
                <div className="space-y-3">
                  {/* Mobile Transactions Cards */}
                  <div className="lg:hidden space-y-2.5">
                    {currentStats.transactions.map((tx) => {
                      const isPayment = tx.amount < 0;
                      return (
                        <div 
                          key={tx.id} 
                          className="p-3.5 rounded-xl bg-slate-950/70 border border-white/[0.08] flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                isPayment
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              }`}>
                                {isPayment ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                <span>{isPayment ? '- Оплата поставщику' : '+ Долг / Начисление'}</span>
                              </span>
                              <span className="text-xs text-slate-500 font-mono">
                                {tx.date || new Date(tx.createdAt).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                            {tx.note && (
                              <p className="text-xs text-slate-300 font-medium truncate">
                                {tx.note}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-3 shrink-0">
                            <div className={`text-base font-mono font-bold tracking-tight ${
                              isPayment ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {formatMoney(Math.abs(tx.amount))}
                            </div>
                            <button
                              onClick={() => setDeletingTxId(tx.id)}
                              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 active:text-rose-400 active:bg-rose-500/20 rounded-xl transition-colors cursor-pointer"
                              title="Удалить запись"
                              aria-label="Удалить запись"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {currentStats.transactions.length === 0 && (
                      <div className="surface-card p-8 rounded-2xl border border-white/10">
                        <EmptyState
                          icon={CreditCard}
                          title="Нет прямых платежей"
                          description="Внесите запись о выплате денег поставщику для уменьшения долга."
                          actionLabel="Внести оплату"
                          onAction={() => setIsAddTxModalOpen(true)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Desktop Transactions Table */}
                  <div className="hidden lg:block overflow-x-auto rounded-lg border border-white/10">
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
                          const isPayment = tx.amount < 0;
                          return (
                            <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-3.5 text-slate-400 font-mono whitespace-nowrap">
                                {tx.date || new Date(tx.createdAt).toLocaleDateString('ru-RU')}
                              </td>
                              <td className="py-3 px-3.5 whitespace-nowrap">
                                <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-semibold ${
                                  isPayment
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {isPayment ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                                  <span>{isPayment ? '- Оплата поставщику' : '+ Долг / Начисление'}</span>
                                </span>
                              </td>
                              <td className={`py-3 px-3.5 text-right font-mono font-bold text-xs sm:text-sm 2xl:text-base whitespace-nowrap ${
                                isPayment ? 'text-emerald-400' : 'text-rose-400'
                              }`}>
                                {formatMoney(Math.abs(tx.amount))}
                              </td>
                              <td className="py-3 px-3.5 text-slate-300">
                                {tx.note || <span className="text-slate-600 font-mono">—</span>}
                              </td>
                              <td className="py-3 px-3.5 text-center whitespace-nowrap">
                                <button
                                  onClick={() => setDeletingTxId(tx.id)}
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
                                icon={CreditCard}
                                title="Нет прямых платежей"
                                description="Внесите запись о выплате денег поставщику для уменьшения баланса долга."
                                actionLabel="Внести оплату"
                                onAction={() => setIsAddTxModalOpen(true)}
                              />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: Purchased Parts from Client Orders */}
              {subTab === 'parts' && (
                <div className="space-y-3">
                  {/* Mobile Parts Cards */}
                  <div className="lg:hidden space-y-2.5">
                    {currentStats.parts.map((p, idx) => (
                      <div 
                        key={p.id || idx} 
                        className="p-3.5 rounded-xl bg-slate-950/70 border border-white/[0.08] space-y-2 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[11px] text-slate-500 font-mono block">
                              {p.date || '—'}
                            </span>
                            <h4 className="text-xs sm:text-sm font-semibold text-slate-200">
                              {p.description || 'Деталь'}
                            </h4>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs sm:text-sm font-mono font-bold text-rose-300">
                              {formatMoney(p.purchasePrice)}
                            </span>
                            <span className="text-[10px] text-slate-500 block">себестоимость</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                          <div className="flex items-center space-x-1.5 text-slate-400 font-mono truncate">
                            <Car className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{p.carName || p.clientName || '—'}</span>
                          </div>
                          {p.article && (
                            <button
                              onClick={() => handleCopy(p.article)}
                              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-white/5 text-[11px] font-mono text-slate-300 active:bg-white/15"
                            >
                              <span>{p.article}</span>
                              {copiedArticle === p.article ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {currentStats.parts.length === 0 && (
                      <div className="surface-card p-8 rounded-2xl border border-white/10">
                        <EmptyState
                          icon={Package}
                          title="Нет привязанных запчастей"
                          description={`При создании заказа клиенту укажите «${currentPerson.name}» в поле поставщика, и запчасти появятся здесь автоматически.`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Desktop Parts Table */}
                  <div className="hidden lg:block overflow-x-auto rounded-lg border border-white/10">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-[#090d16] text-slate-400 uppercase font-semibold text-xs 2xl:text-sm tracking-wider">
                          <th className="py-3 px-3.5">Дата</th>
                          <th className="py-3 px-3.5">Артикул</th>
                          <th className="py-3 px-3.5">Наименование детали</th>
                          <th className="py-3 px-3.5">Клиент / Авто</th>
                          <th className="py-3 px-3.5 text-right">Себестоимость</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {currentStats.parts.map((p, idx) => (
                          <tr key={p.id || idx} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-3.5 text-slate-400 font-mono whitespace-nowrap">
                              {p.date || '—'}
                            </td>
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              {p.article ? (
                                <button
                                  onClick={() => handleCopy(p.article)}
                                  className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-200 transition-colors cursor-pointer"
                                  title="Копировать артикул"
                                >
                                  <span>{p.article}</span>
                                  {copiedArticle === p.article ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-slate-400" />
                                  )}
                                </button>
                              ) : (
                                <span className="text-slate-600 font-mono">—</span>
                              )}
                            </td>
                            <td className="py-3 px-3.5 text-slate-200 font-medium">
                              {p.description || 'Деталь'}
                            </td>
                            <td className="py-3 px-3.5 text-slate-400 whitespace-nowrap">
                              <div className="flex items-center space-x-1.5">
                                <Car className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span>{p.clientName ? `${p.clientName} (${p.carName || 'авто'})` : p.carName || '—'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3.5 text-right font-mono font-bold text-rose-400 whitespace-nowrap">
                              {formatMoney(p.purchasePrice)}
                            </td>
                          </tr>
                        ))}
                        {currentStats.parts.length === 0 && (
                          <tr>
                            <td colSpan="5" className="py-10">
                              <EmptyState
                                icon={Package}
                                title="Нет привязанных запчастей"
                                description={`При создании заказа клиенту укажите «${currentPerson.name}» в поле поставщика, и позиции появятся здесь с расчетом долга.`}
                              />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="surface-card p-10 rounded-lg flex flex-col items-center justify-center">
              <EmptyState
                icon={Truck}
                title="Поставщик не выбран"
                description="Выберите поставщика из списка слева для просмотра карточки и истории операций."
              />
            </div>
          )}
        </div>

      </div>

      {/* Modal: Add Person */}
      <Modal isOpen={isAddPersonModalOpen} onClose={() => setIsAddPersonModalOpen(false)} title="Добавить поставщика">
        <form onSubmit={handleCreatePerson} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Название / Поставщик *</label>
            <input
              type="text"
              placeholder="напр. Элит, Тотус, Партс-Трейд, Автодок..."
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
              className="w-full h-12 sm:h-10 rounded-xl sm:rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer active:scale-[0.98]"
            >
              Создать поставщика
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
                <option value="payment" className="bg-[#0b0f19] text-white">- Оплата поставщику (уменьшает наш долг)</option>
                <option value="supply" className="bg-[#0b0f19] text-white">+ Начисление / Поставка (увеличивает долг)</option>
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
              placeholder="Оплата по безналу, наличными курьеру, возврат брака..."
              value={txNote}
              onChange={(e) => setTxNote(e.target.value)}
              className="w-full input-md"
            />
          </div>
          <div className="pt-1">
            <button
              type="submit"
              className="w-full h-12 sm:h-10 rounded-xl sm:rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer active:scale-[0.98]"
            >
              Сохранить запись
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Modal: Delete Counterparty */}
      <ConfirmModal
        isOpen={isDeletePersonModalOpen}
        onClose={() => setIsDeletePersonModalOpen(false)}
        onConfirm={() => {
          if (currentPerson) {
            deleteOtherCounterparty(currentPerson.id);
            setSelectedPersonId(null);
            setIsDeletePersonModalOpen(false);
          }
        }}
        title="Удалить поставщика"
        message={`Вы действительно хотите удалить поставщика «${currentPerson?.name}» и всю историю связанных финансовых операций? Это действие необратимо.`}
        confirmText="Удалить поставщика"
      />

      {/* Confirm Modal: Delete Transaction */}
      <ConfirmModal
        isOpen={Boolean(deletingTxId)}
        onClose={() => setDeletingTxId(null)}
        onConfirm={() => {
          if (deletingTxId) {
            deleteOtherTransaction(deletingTxId);
            setDeletingTxId(null);
          }
        }}
        title="Удалить операцию"
        message="Вы уверены, что хотите удалить эту запись операции? Баланс взаиморасчетов пересчитается автоматически."
        confirmText="Удалить"
      />

    </div>
  );
}

