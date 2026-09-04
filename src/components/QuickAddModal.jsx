import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useData } from '../context/DataContext';
import { Package, CreditCard, TrendingUp, UserPlus } from 'lucide-react';
import { formatMoney } from '../utils/format';

export default function QuickAddModal({ isOpen, onClose }) {
  const { data, addClientTransaction, addOtherTransaction, addSupplierToDirectory } = useData();
  const [tab, setTab] = useState('item');

  // Item form
  const [clientId, setClientId] = useState(data.clients?.[0]?.id || '');
  const [article, setArticle] = useState('');
  const [description, setDescription] = useState('');
  const [carName, setCarName] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [price, setPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [itemDate, setItemDate] = useState(new Date().toISOString().split('T')[0]);

  // Payment form
  const [paymentClientId, setPaymentClientId] = useState(data.clients?.[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNote, setPaymentNote] = useState('');

  // Other form
  const [otherCounterpartyId, setOtherCounterpartyId] = useState(data.otherCounterparties?.[0]?.id || '');
  const [otherAmount, setOtherAmount] = useState('');
  const [otherNote, setOtherNote] = useState('');
  const [otherType, setOtherType] = useState('plus');

  const selectedClient = data.clients?.find((c) => c.id === clientId);

  // Auto-fill carName from client's default car if not set
  useEffect(() => {
    if (selectedClient && selectedClient.car && !carName) {
      setCarName(selectedClient.car);
    }
  }, [clientId, selectedClient]);

  // Live margin calculation
  const numPrice = parseFloat(price) || 0;
  const numPurchase = parseFloat(purchasePrice) || 0;
  const expectedProfit = numPurchase > 0 && numPrice > 0 ? numPrice - numPurchase : 0;
  const expectedMarginPercent = numPurchase > 0 && numPrice > 0 ? (expectedProfit / numPurchase) * 100 : 0;

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!clientId || !price) return;
    
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
      amount: parseFloat(price),
      purchasePrice: parseFloat(purchasePrice) || 0,
      date: itemDate,
    });

    setArticle('');
    setDescription('');
    setCarName('');
    setPrice('');
    setPurchasePrice('');
    setSupplierName('');
    onClose();
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!paymentClientId || !paymentAmount) return;
    addClientTransaction({
      clientId: paymentClientId,
      type: 'payment',
      amount: parseFloat(paymentAmount),
      date: paymentDate,
      note: paymentNote.trim(),
    });
    setPaymentAmount('');
    setPaymentNote('');
    onClose();
  };

  const handleAddOther = (e) => {
    e.preventDefault();
    if (!otherCounterpartyId || !otherAmount) return;
    const finalAmt = otherType === 'minus' ? -Math.abs(parseFloat(otherAmount)) : Math.abs(parseFloat(otherAmount));
    addOtherTransaction({
      counterpartyId: otherCounterpartyId,
      amount: finalAmt,
      note: otherNote.trim(),
    });
    setOtherAmount('');
    setOtherNote('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Быстрое создание записи">
      
      {/* Suppliers list for auto-complete */}
      <datalist id="quick-add-suppliers-list">
        {(data.suppliersList || []).map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      {/* Segmented Tabs Switcher */}
      <div className="flex p-0.5 bg-[#090d16] rounded-lg border border-white/10 mb-4 h-9">
        <button
          type="button"
          onClick={() => setTab('item')}
          className={`flex-1 flex items-center justify-center space-x-1.5 rounded-md text-xs font-semibold transition-all ${
            tab === 'item' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Деталь клиенту</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('payment')}
          className={`flex-1 flex items-center justify-center space-x-1.5 rounded-md text-xs font-semibold transition-all ${
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
          onClick={() => setTab('other')}
          className={`flex-1 flex items-center justify-center space-x-1.5 rounded-md text-xs font-semibold transition-all ${
            tab === 'other' 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Контрагент</span>
        </button>
      </div>

      {tab === 'item' && (
        <form onSubmit={handleAddItem} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Клиент *</label>
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                const cli = data.clients?.find(c => c.id === e.target.value);
                if (cli && cli.car) setCarName(cli.car);
              }}
              className="w-full input-md"
              required
            >
              {(data.clients || []).map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0b0f19] text-white">
                  {c.name} {c.car ? `• (${c.car})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Артикул / Код</label>
              <input
                type="text"
                placeholder="напр. S TL C00117/8"
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                className="w-full input-md uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Продажа клиенту (грн) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full input-md font-mono font-bold text-amber-400 border-amber-500/30 focus:border-amber-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Наименование детали / Работы</label>
            <input
              type="text"
              placeholder="Сцепление, масло 5w30, колодки..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full input-md"
            />
          </div>

          {/* Optional Car */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Автомобиль (опционально)
              </label>
              {selectedClient?.car && (
                <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-mono">
                  по умолчанию: {selectedClient.car}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="напр. Passat B6, Camry..."
              value={carName}
              onChange={(e) => setCarName(e.target.value)}
              className="w-full input-md"
            />
          </div>

          {/* Supplier and Purchase Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Поставщик / Склад</label>
              <input
                type="text"
                list="quick-add-suppliers-list"
                placeholder="Склад / Поставщик"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full input-md"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Себестоимость (закупка)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full input-md font-mono"
              />
            </div>
          </div>

          {/* Live Margin Calculation Preview */}
          {numPrice > 0 && numPurchase > 0 && (
            <div className="p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center space-x-2 text-emerald-300">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Маржа:</span>
              </div>
              <div className="text-right font-mono font-bold text-emerald-400">
                +{formatMoney(expectedProfit)} (+{expectedMarginPercent.toFixed(0)}%)
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Дата</label>
            <input
              type="date"
              value={itemDate}
              onChange={(e) => setItemDate(e.target.value)}
              className="w-full input-md font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors mt-2 cursor-pointer"
          >
            Записать деталь клиенту
          </button>
        </form>
      )}

      {tab === 'payment' && (
        <form onSubmit={handleAddPayment} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Клиент *</label>
            <select
              value={paymentClientId}
              onChange={(e) => setPaymentClientId(e.target.value)}
              className="w-full input-md"
              required
            >
              {(data.clients || []).map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0b0f19] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Сумма оплаты (грн) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
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
              placeholder="Перевод на карту, наличные и т.д."
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              className="w-full input-md"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors mt-2 cursor-pointer"
          >
            Внести оплату от клиента
          </button>
        </form>
      )}

      {tab === 'other' && (
        <form onSubmit={handleAddOther} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Контрагент *</label>
            {(data.otherCounterparties || []).length > 0 ? (
              <select
                value={otherCounterpartyId}
                onChange={(e) => setOtherCounterpartyId(e.target.value)}
                className="w-full input-md"
                required
              >
                {(data.otherCounterparties || []).map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0b0f19] text-white">{p.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-amber-400 p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                Сначала создайте контрагента во вкладке «Контрагенты»!
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Тип операции</label>
              <select
                value={otherType}
                onChange={(e) => setOtherType(e.target.value)}
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
                value={otherAmount}
                onChange={(e) => setOtherAmount(e.target.value)}
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
            className="w-full h-10 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors mt-2 cursor-pointer"
          >
            Записать операцию
          </button>
        </form>
      )}
    </Modal>
  );
}

