import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useData } from '../context/DataContext';
import { Package, CreditCard, TrendingUp, Truck, AlertCircle, Building2, Car, ChevronDown, ChevronUp, Plus, UserPlus } from 'lucide-react';
import { formatMoney } from '../utils/format';
import AddClientModal from './clients/modals/AddClientModal';

export default function QuickAddModal({ isOpen, onClose }) {
  const { data, addClientTransaction, addOtherTransaction, addSupplierToDirectory, addClient } = useData();
  const [tab, setTab] = useState('item');

  // Item form
  const [clientId, setClientId] = useState('');
  const [article, setArticle] = useState('');
  const [description, setDescription] = useState('');
  const [carName, setCarName] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [price, setPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [itemDate, setItemDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCostSection, setShowCostSection] = useState(false);

  // Payment form
  const [paymentClientId, setPaymentClientId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNote, setPaymentNote] = useState('');

  // Other form
  const [otherCounterpartyId, setOtherCounterpartyId] = useState('');
  const [otherAmount, setOtherAmount] = useState('');
  const [otherNote, setOtherNote] = useState('');
  const [otherType, setOtherType] = useState('plus');

  // UI state
  const [error, setError] = useState('');
  const [isAddCliModalOpen, setIsAddCliModalOpen] = useState(false);

  const clients = data.clients || [];
  const selectedClient = clients.find((c) => c.id === clientId);

  const parseMoney = (val) => {
    if (!val) return 0;
    const clean = String(val).replace(/\s+/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  // Synchronize selected client IDs whenever modal opens or clients change
  useEffect(() => {
    if (isOpen) {
      setError('');
      if (clients.length > 0) {
        if (!clientId || !clients.some((c) => c.id === clientId)) {
          const firstCli = clients[0];
          setClientId(firstCli.id);
          if (firstCli.clientType !== 'wholesale' && firstCli.car && !carName) {
            setCarName(firstCli.car);
          }
        }
        if (!paymentClientId || !clients.some((c) => c.id === paymentClientId)) {
          setPaymentClientId(clients[0].id);
        }
      } else {
        setClientId('');
        setPaymentClientId('');
      }

      const counterparties = data.otherCounterparties || [];
      if (counterparties.length > 0) {
        if (!otherCounterpartyId || !counterparties.some((p) => p.id === otherCounterpartyId)) {
          setOtherCounterpartyId(counterparties[0].id);
        }
      } else {
        setOtherCounterpartyId('');
      }
    }
  }, [isOpen, clients, data.otherCounterparties]);

  // Auto-fill carName when switching client if client is retail with a default car
  const handleClientChange = (newId) => {
    setClientId(newId);
    setError('');
    const cli = clients.find((c) => c.id === newId);
    if (cli) {
      if (cli.clientType !== 'wholesale' && cli.car) {
        setCarName(cli.car);
      } else if (cli.clientType === 'wholesale') {
        setCarName('');
      }
    }
  };

  // Reset inputs when modal closes
  useEffect(() => {
    if (!isOpen) {
      setArticle('');
      setDescription('');
      setCarName('');
      setPrice('');
      setPurchasePrice('');
      setSupplierName('');
      setPaymentAmount('');
      setPaymentNote('');
      setOtherAmount('');
      setOtherNote('');
      setError('');
      setShowCostSection(false);
    }
  }, [isOpen]);

  // Live margin calculation
  const numPrice = parseMoney(price);
  const numPurchase = parseMoney(purchasePrice);
  const expectedProfit = numPurchase > 0 && numPrice > 0 ? numPrice - numPurchase : 0;
  const expectedMarginPercent = numPurchase > 0 && numPrice > 0 ? (expectedProfit / numPurchase) * 100 : 0;

  const handleAddItem = (e) => {
    e.preventDefault();
    setError('');

    if (!clientId) {
      setError('Пожалуйста, выберите клиента. Если клиентов еще нет, создайте его кнопкой ниже.');
      return;
    }

    const finalPrice = parseMoney(price);
    if (finalPrice <= 0) {
      setError('Пожалуйста, укажите цену продажи клиенту (больше 0)');
      return;
    }

    const finalSupplier = supplierName.trim();
    if (finalSupplier && !data.suppliersList?.includes(finalSupplier)) {
      addSupplierToDirectory(finalSupplier);
    }

    addClientTransaction({
      clientId,
      type: 'item',
      article: article.trim().toUpperCase(),
      description: description.trim(),
      carName: carName.trim(),
      supplierName: finalSupplier,
      amount: finalPrice,
      purchasePrice: parseMoney(purchasePrice),
      date: itemDate || new Date().toISOString().split('T')[0],
    });

    onClose();
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    setError('');

    if (!paymentClientId) {
      setError('Пожалуйста, выберите клиента для внесения оплаты');
      return;
    }

    const finalAmount = parseMoney(paymentAmount);
    if (finalAmount <= 0) {
      setError('Пожалуйста, укажите сумму оплаты (больше 0)');
      return;
    }

    addClientTransaction({
      clientId: paymentClientId,
      type: 'payment',
      amount: finalAmount,
      date: paymentDate || new Date().toISOString().split('T')[0],
      note: paymentNote.trim() || 'Оплата',
    });

    onClose();
  };

  const handleAddOther = (e) => {
    e.preventDefault();
    setError('');

    if (!otherCounterpartyId) {
      setError('Пожалуйста, выберите поставщика');
      return;
    }

    const finalAmount = parseMoney(otherAmount);
    if (finalAmount <= 0) {
      setError('Пожалуйста, укажите сумму операции');
      return;
    }

    const finalAmt = otherType === 'minus' ? -Math.abs(finalAmount) : Math.abs(finalAmount);
    addOtherTransaction({
      counterpartyId: otherCounterpartyId,
      amount: finalAmt,
      note: otherNote.trim(),
    });

    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Быстрое добавление">
        {/* Suppliers list for auto-complete */}
        <datalist id="quick-add-suppliers-list">
          {(data.suppliersList || []).map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>

        {/* Segmented Tabs Switcher */}
        <div className="flex p-0.5 bg-[#090d16] rounded-xl border border-white/10 mb-4 h-11 sm:h-9">
          <button
            type="button"
            onClick={() => {
              setTab('item');
              setError('');
            }}
            className={`flex-1 flex items-center justify-center space-x-1.5 rounded-lg sm:rounded-md text-xs font-semibold transition-all cursor-pointer ${
              tab === 'item' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Заказ / Деталь</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('payment');
              setError('');
            }}
            className={`flex-1 flex items-center justify-center space-x-1.5 rounded-lg sm:rounded-md text-xs font-semibold transition-all cursor-pointer ${
              tab === 'payment' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Оплата от клиента</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('other');
              setError('');
            }}
            className={`flex-1 flex items-center justify-center space-x-1.5 rounded-lg sm:rounded-md text-xs font-semibold transition-all cursor-pointer ${
              tab === 'other' 
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Поставщик</span>
          </button>
        </div>

        {error && (
          <div className="p-2.5 mb-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Item / Order */}
        {tab === 'item' && (
          clients.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <UserPlus className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Нет добавленных клиентов</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Чтобы оформить заказ на деталь, создайте первого клиента (розничного или оптового)
              </p>
              <button
                type="button"
                onClick={() => setIsAddCliModalOpen(true)}
                className="btn-md btn-primary font-bold inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Создать клиента</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleAddItem} className="space-y-3.5">
              {/* Client Selector with Quick Add */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Клиент <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddCliModalOpen(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Новый клиент</span>
                  </button>
                </div>
                <select
                  value={clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full input-md bg-[#0b0f19] text-white"
                  required
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0b0f19] text-white">
                      {c.name} {c.clientType === 'wholesale' ? '• [ОПТ / СТО]' : c.car ? `• (${c.car})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Article and Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Артикул / Код</label>
                  <input
                    type="text"
                    placeholder="напр. OC90, 500142..."
                    value={article}
                    onChange={(e) => setArticle(e.target.value)}
                    className="w-full input-md uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                    Сумма клиенту (грн) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full input-md font-mono font-bold text-amber-400 border-amber-500/30 focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Наименование детали / работы</label>
                <input
                  type="text"
                  placeholder="Фильтр масляный, тормозные колодки, масло..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full input-md"
                />
              </div>

              {/* Car Field: Conditional or Contextual */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    {selectedClient?.clientType === 'wholesale' ? 'Автомобиль для этой детали (опционально)' : 'Автомобиль'}
                  </label>
                  {selectedClient?.clientType === 'wholesale' ? (
                    <span className="text-[11px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded font-mono">
                      Оптовик / СТО
                    </span>
                  ) : selectedClient?.car ? (
                    <span className="text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-mono">
                      по умолчанию: {selectedClient.car}
                    </span>
                  ) : null}
                </div>
                <input
                  type="text"
                  placeholder={selectedClient?.clientType === 'wholesale' ? 'Passat B6 мастера, Audi Q7...' : 'Модель авто...'}
                  value={carName}
                  onChange={(e) => setCarName(e.target.value)}
                  className="w-full input-md"
                />
              </div>

              {/* Optional Supplier & Cost Price Toggle */}
              <div className="border border-white/[0.08] rounded-xl p-3 bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => setShowCostSection(!showCostSection)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Поставщик и себестоимость (закупка)</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-500">
                    <span className="text-[11px] font-normal hidden sm:inline">можно заполнить позже в «Очереди цен»</span>
                    {showCostSection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {showCostSection && (
                  <div className="pt-3 space-y-3 animate-in fade-in duration-150">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Поставщик / Склад</label>
                        <input
                          type="text"
                          list="quick-add-suppliers-list"
                          placeholder="Склад, Тотус..."
                          value={supplierName}
                          onChange={(e) => setSupplierName(e.target.value)}
                          className="w-full input-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Закупка (себестоимость)
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0.00"
                          value={purchasePrice}
                          onChange={(e) => setPurchasePrice(e.target.value)}
                          className="w-full input-md font-mono"
                        />
                      </div>
                    </div>

                    {/* Live Margin Calculation Preview */}
                    {numPrice > 0 && numPurchase > 0 && (
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs animate-in fade-in">
                        <div className="flex items-center space-x-2 text-emerald-300">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="font-semibold">Расчетная маржа:</span>
                        </div>
                        <div className="text-right font-mono font-bold text-emerald-400">
                          +{formatMoney(expectedProfit)} (+{expectedMarginPercent.toFixed(0)}%)
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Дата заказа</label>
                <input
                  type="date"
                  value={itemDate}
                  onChange={(e) => setItemDate(e.target.value)}
                  className="w-full input-md font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 sm:h-10 rounded-xl sm:rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors mt-2 cursor-pointer active:scale-[0.98] shadow-md shadow-blue-500/25"
              >
                ✓ Сохранить деталь в заказ
              </button>
            </form>
          )
        )}

        {/* Tab 2: Payment */}
        {tab === 'payment' && (
          clients.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-xs text-slate-400">Сначала добавьте хотя бы одного клиента</p>
              <button
                type="button"
                onClick={() => setIsAddCliModalOpen(true)}
                className="btn-md btn-primary font-bold inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Создать клиента</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleAddPayment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Клиент <span className="text-rose-400">*</span>
                </label>
                <select
                  value={paymentClientId}
                  onChange={(e) => setPaymentClientId(e.target.value)}
                  className="w-full input-md bg-[#0b0f19] text-white"
                  required
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0b0f19] text-white">
                      {c.name} {c.clientType === 'wholesale' ? '• [ОПТ / СТО]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                    Сумма оплаты (грн) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => {
                      setPaymentAmount(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full input-md font-mono font-bold text-emerald-400 border-emerald-500/30 focus:border-emerald-400"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Дата оплаты</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full input-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Примечание</label>
                <input
                  type="text"
                  placeholder="Перевод на карту, наличные, расчет..."
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full input-md"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 sm:h-10 rounded-xl sm:rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors mt-2 cursor-pointer active:scale-[0.98] shadow-md shadow-emerald-500/25"
              >
                ✓ Внести оплату от клиента
              </button>
            </form>
          )
        )}

        {/* Tab 3: Other Supplier Settlements */}
        {tab === 'other' && (
          <form onSubmit={handleAddOther} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Поставщик *</label>
              {(data.otherCounterparties || []).length > 0 ? (
                <select
                  value={otherCounterpartyId}
                  onChange={(e) => setOtherCounterpartyId(e.target.value)}
                  className="w-full input-md bg-[#0b0f19] text-white"
                  required
                >
                  {(data.otherCounterparties || []).map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#0b0f19] text-white">{p.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-amber-400 p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                  Сначала создайте поставщика во вкладке «Поставщики»!
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Тип операции</label>
                <select
                  value={otherType}
                  onChange={(e) => setOtherType(e.target.value)}
                  className="w-full input-md font-semibold bg-[#0b0f19] text-white"
                >
                  <option value="plus" className="bg-[#0b0f19] text-white">+ Долг нам (начисление)</option>
                  <option value="minus" className="bg-[#0b0f19] text-white">- Оплата поставщику / Возврат</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Сумма (грн) *</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={otherAmount}
                  onChange={(e) => {
                    setOtherAmount(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full input-md font-mono font-bold text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Примечание</label>
              <input
                type="text"
                placeholder="За что, подробности..."
                value={otherNote}
                onChange={(e) => setOtherNote(e.target.value)}
                className="w-full input-md"
              />
            </div>

            <button
              type="submit"
              disabled={(data.otherCounterparties || []).length === 0}
              className="w-full h-12 sm:h-10 rounded-xl sm:rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors mt-2 cursor-pointer active:scale-[0.98] shadow-md shadow-indigo-500/25"
            >
              ✓ Записать поставщику
            </button>
          </form>
        )}
      </Modal>

      {/* Sub-modal to add client directly if needed */}
      <AddClientModal
        isOpen={isAddCliModalOpen}
        onClose={() => setIsAddCliModalOpen(false)}
        onAddClient={(newCliData) => {
          const created = addClient(newCliData);
          if (created?.id) {
            setClientId(created.id);
            setPaymentClientId(created.id);
          }
          return created;
        }}
      />
    </>
  );
}

