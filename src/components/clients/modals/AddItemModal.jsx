import React, { useState, useEffect } from 'react';
import Modal from '../../Modal';
import { Package, DollarSign, Calendar, Truck, Car, FileText } from 'lucide-react';

export default function AddItemModal({
  isOpen,
  onClose,
  client,
  suppliersList = [],
  onAddTransaction,
  onAddSupplier,
}) {
  const [article, setArticle] = useState('');
  const [description, setDescription] = useState('');
  const [carName, setCarName] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (client) {
      setCarName(client.car || '');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [client, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!client || !amount) return;

    if (supplierName.trim() && onAddSupplier) {
      onAddSupplier(supplierName.trim());
    }

    onAddTransaction({
      clientId: client.id,
      type: 'item',
      article: article.trim().toUpperCase(),
      description: description.trim(),
      carName: carName.trim(),
      supplierName: supplierName.trim(),
      amount: parseFloat(amount) || 0,
      purchasePrice: parseFloat(purchasePrice) || 0,
      date: date || new Date().toISOString().split('T')[0],
      note: note.trim(),
    });

    setArticle('');
    setDescription('');
    setAmount('');
    setPurchasePrice('');
    setNote('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Добавить запчасть: ${client?.name || ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Артикул / Номер</label>
            <div className="relative">
              <Package className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="OC90, 50014299..."
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                className="w-full pl-9 pr-3 h-12 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-base sm:text-sm text-slate-100 uppercase font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Сумма клиенту (грн) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-3 h-12 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-base sm:text-sm text-emerald-400 font-bold font-mono focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Наименование детали</label>
          <input
            type="text"
            placeholder="Фильтр масляный, рычаг передний левый..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 h-12 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-base sm:text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Автомобиль</label>
            <div className="relative">
              <Car className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="BMW X5 / Passat"
                value={carName}
                onChange={(e) => setCarName(e.target.value)}
                className="w-full pl-9 pr-3 h-12 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-base sm:text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Поставщик</label>
            <div className="relative">
              <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                list="suppliers-datalist"
                placeholder="Склад, Тотус, Автодок..."
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full pl-9 pr-3 h-12 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-base sm:text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
              <datalist id="suppliers-datalist">
                {suppliersList.map((sup) => (
                  <option key={sup} value={sup} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Себестоимость (закупка)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full pl-9 pr-3 h-12 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-base sm:text-sm text-slate-100 font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Оставьте пустым для очереди закупок</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Дата</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 h-12 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-base sm:text-sm text-slate-100 font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Примечание</label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Дополнительно..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full pl-9 pr-3 h-12 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-base sm:text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:justify-end gap-2.5 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-md sm:btn-sm bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold cursor-pointer"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="btn-md sm:btn-sm btn-primary font-bold shadow-md shadow-blue-500/25 cursor-pointer"
          >
            Записать деталь
          </button>
        </div>
      </form>
    </Modal>
  );
}
