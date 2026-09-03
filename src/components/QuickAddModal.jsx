import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useData } from '../context/DataContext';
import { Package, CreditCard, UserPlus } from 'lucide-react';

export default function QuickAddModal({ isOpen, onClose }) {
  const { data, addClientTransaction, addOtherTransaction, addSupplierToDirectory } = useData();
  const [tab, setTab] = useState('item');

  // Item form
  const [clientId, setClientId] = useState(data.clients?.[0]?.id || '');
  const [article, setArticle] = useState('');
  const [description, setDescription] = useState('');
  const [carName, setCarName] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [newSupplierInput, setNewSupplierInput] = useState('');
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

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!clientId || !price) return;
    
    let finalSupplier = supplierName;
    if (newSupplierInput.trim()) {
      finalSupplier = newSupplierInput.trim();
      addSupplierToDirectory(finalSupplier);
    }

    addClientTransaction({
      clientId,
      type: 'item',
      article,
      description,
      carName: carName || '',
      supplierName: finalSupplier || '',
      amount: parseFloat(price),
      purchasePrice: parseFloat(purchasePrice) || 0,
      date: itemDate,
    });

    setArticle('');
    setDescription('');
    setCarName('');
    setPrice('');
    setPurchasePrice('');
    setNewSupplierInput('');
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
      note: paymentNote,
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
      note: otherNote,
    });
    setOtherAmount('');
    setOtherNote('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Быстрое добавление записи">
      <div className="flex border-b border-slate-800 mb-5 space-x-2">
        <button
          onClick={() => setTab('item')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            tab === 'item' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Деталь клиенту</span>
        </button>
        <button
          onClick={() => setTab('payment')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            tab === 'payment' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Оплата от клиента</span>
        </button>
        <button
          onClick={() => setTab('other')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            tab === 'other' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Взаиморасчет</span>
        </button>
      </div>

      {tab === 'item' && (
        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Клиент *</label>
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                const cli = data.clients?.find(c => c.id === e.target.value);
                if (cli && cli.car) setCarName(cli.car);
              }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              required
            >
              {(data.clients || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.car ? `(${c.car})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Артикул / Код</label>
              <input
                type="text"
                placeholder="напр. S TL C00117/8"
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Цена продажи клиенту (грн) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono font-semibold text-amber-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Наименование детали</label>
            <input
              type="text"
              placeholder="Сцепление, масло, тяжки, колодки..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Optional Car Binding */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Автомобиль (опционально, для истории)
              </span>
              {selectedClient?.car && (
                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                  авто клиента: {selectedClient.car}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="напр. Чери, Ренж, Тойота, Пассат..."
              value={carName}
              onChange={(e) => setCarName(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Supplier and Purchase Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Поставщик (опционально)</label>
              <select
                value={supplierName}
                onChange={(e) => {
                  setSupplierName(e.target.value);
                  if (e.target.value !== '__new__') setNewSupplierInput('');
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-hidden focus:border-blue-500"
              >
                <option value="">(Не выбран)</option>
                {(data.suppliersList || []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="__new__">+ Новый поставщик...</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Цена покупки у поставщика
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Если известно..."
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-hidden focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Если оставить пустым — попадет в очередь
              </span>
            </div>
          </div>

          {supplierName === '__new__' && (
            <div>
              <input
                type="text"
                placeholder="Имя нового поставщика (напр. Склад Орел)"
                value={newSupplierInput}
                onChange={(e) => setNewSupplierInput(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-blue-500 rounded-xl text-slate-100 text-xs"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Дата</label>
            <input
              type="date"
              value={itemDate}
              onChange={(e) => setItemDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
          >
            Записать деталь клиенту
          </button>
        </form>
      )}

      {tab === 'payment' && (
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Клиент *</label>
            <select
              value={paymentClientId}
              onChange={(e) => setPaymentClientId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              required
            >
              {(data.clients || []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Сумма оплаты (грн) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono font-semibold text-emerald-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Дата оплаты</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Примечание</label>
            <input
              type="text"
              placeholder="Перевод на карту, на руки и т.д."
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all"
          >
            Внести оплату от клиента
          </button>
        </form>
      )}

      {tab === 'other' && (
        <form onSubmit={handleAddOther} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Контрагент *</label>
            {(data.otherCounterparties || []).length > 0 ? (
              <select
                value={otherCounterpartyId}
                onChange={(e) => setOtherCounterpartyId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
                required
              >
                {(data.otherCounterparties || []).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-amber-400">
                Сначала добавьте человека во вкладке «Другие расчеты»!
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Тип операции</label>
              <select
                value={otherType}
                onChange={(e) => setOtherType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              >
                <option value="plus">+ Долг нам (+ должен нам)</option>
                <option value="minus">- Оплата / Возврат (- уменьшение)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Сумма (грн) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={otherAmount}
                onChange={(e) => setOtherAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono font-semibold text-slate-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Примечание</label>
            <input
              type="text"
              placeholder="За что, подробности"
              value={otherNote}
              onChange={(e) => setOtherNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={(data.otherCounterparties || []).length === 0}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all"
          >
            Записать операцию
          </button>
        </form>
      )}
    </Modal>
  );
}
