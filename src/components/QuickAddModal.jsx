import React, { useState } from 'react';
import Modal from './Modal';
import { useData } from '../context/DataContext';
import { Package, CreditCard, Car, UserPlus } from 'lucide-react';

export default function QuickAddModal({ isOpen, onClose }) {
  const { data, addSupplierTransaction, addCarOrder, addOtherTransaction } = useData();
  const [tab, setTab] = useState('item'); // 'item' | 'payment' | 'car' | 'other'

  // Item form
  const [supplierId, setSupplierId] = useState(data.suppliers[0]?.id || '');
  const [article, setArticle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [itemDate, setItemDate] = useState(new Date().toISOString().split('T')[0]);
  const [carOrderId, setCarOrderId] = useState('');

  // Payment form
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNote, setPaymentNote] = useState('');

  // Car form
  const [carModel, setCarModel] = useState('');
  const [clientName, setClientName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');

  // Other form
  const [otherCounterpartyId, setOtherCounterpartyId] = useState(data.otherCounterparties[0]?.id || '');
  const [otherAmount, setOtherAmount] = useState('');
  const [otherNote, setOtherNote] = useState('');
  const [otherType, setOtherType] = useState('plus'); // 'plus' = долг нам, 'minus' = оплата/уменьшение

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!supplierId || !price) return;
    addSupplierTransaction({
      supplierId,
      type: 'item',
      article,
      description,
      amount: parseFloat(price),
      date: itemDate,
      carOrderId: carOrderId || null,
    });
    setArticle('');
    setDescription('');
    setPrice('');
    onClose();
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!supplierId || !paymentAmount) return;
    addSupplierTransaction({
      supplierId,
      type: 'payment',
      amount: parseFloat(paymentAmount),
      date: paymentDate,
      note: paymentNote,
    });
    setPaymentAmount('');
    setPaymentNote('');
    onClose();
  };

  const handleAddCar = (e) => {
    e.preventDefault();
    if (!carModel) return;
    addCarOrder({
      carModel,
      clientName,
      licensePlate,
      status: 'in_progress',
    });
    setCarModel('');
    setClientName('');
    setLicensePlate('');
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
      <div className="flex border-b border-slate-800 mb-5 overflow-x-auto pb-1 space-x-2">
        <button
          onClick={() => setTab('item')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            tab === 'item' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Закупка детали</span>
        </button>
        <button
          onClick={() => setTab('payment')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            tab === 'payment' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Оплата поставщику</span>
        </button>
        <button
          onClick={() => setTab('car')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            tab === 'car' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Новое авто</span>
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
            <label className="block text-xs font-medium text-slate-300 mb-1">Поставщик *</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              required
            >
              {data.suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
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
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Цена (закупка) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono font-semibold text-emerald-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Наименование / Примечание</label>
            <input
              type="text"
              placeholder="напр. Ремень ГРМ, фильтр масляный"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Дата</label>
              <input
                type="date"
                value={itemDate}
                onChange={(e) => setItemDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Привязать к авто</label>
              <select
                value={carOrderId}
                onChange={(e) => setCarOrderId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              >
                <option value="">(Не привязано)</option>
                {data.carOrders.map((o) => (
                  <option key={o.id} value={o.id}>{o.carModel} {o.clientName ? `(${o.clientName})` : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
          >
            Добавить закупку детали
          </button>
        </form>
      )}

      {tab === 'payment' && (
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Поставщик *</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              required
            >
              {data.suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Сумма оплаты *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono font-semibold text-blue-400"
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
            <label className="block text-xs font-medium text-slate-300 mb-1">Комментарий (напр. карта, нал)</label>
            <input
              type="text"
              placeholder="Оплата через банк, на руки и т.д."
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all"
          >
            Внести оплату поставщику
          </button>
        </form>
      )}

      {tab === 'car' && (
        <form onSubmit={handleAddCar} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Автомобиль / Модель *</label>
            <input
              type="text"
              placeholder="напр. Чери Тигго, Range Rover Sport"
              value={carModel}
              onChange={(e) => setCarModel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Имя владельца / Клиента</label>
              <input
                type="text"
                placeholder="напр. Сергей, Вадим"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Госномер</label>
              <input
                type="text"
                placeholder="напр. А777АА77"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 uppercase"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
          >
            Создать заказ по авто
          </button>
        </form>
      )}

      {tab === 'other' && (
        <form onSubmit={handleAddOther} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Контрагент *</label>
            {data.otherCounterparties.length > 0 ? (
              <select
                value={otherCounterpartyId}
                onChange={(e) => setOtherCounterpartyId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
                required
              >
                {data.otherCounterparties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-amber-400">
                Сначала добавьте человека во вкладке «Другие»!
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
                <option value="plus">+ Долг (+ нам должны)</option>
                <option value="minus">- Оплата / Возврат (- уменьшение)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Сумма *</label>
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
            disabled={data.otherCounterparties.length === 0}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all"
          >
            Записать операцию
          </button>
        </form>
      )}
    </Modal>
  );
}
