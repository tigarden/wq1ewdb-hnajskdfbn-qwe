import React, { useState, useEffect } from 'react';
import Modal from '../../Modal';
import { Package, CreditCard, Calendar, Truck, Car, FileText, AlertCircle } from 'lucide-react';

export default function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
  onUpdateTransaction,
  suppliersList = [],
  onAddSupplier,
}) {
  const [article, setArticle] = useState('');
  const [description, setDescription] = useState('');
  const [carName, setCarName] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const isItem = transaction?.type === 'item';

  useEffect(() => {
    if (transaction && isOpen) {
      setArticle(transaction.article || '');
      setDescription(transaction.description || '');
      setCarName(transaction.carName || '');
      setSupplierName(transaction.supplierName || '');
      setAmount(transaction.amount !== undefined && transaction.amount !== null ? String(transaction.amount) : '');
      setPurchasePrice(transaction.purchasePrice !== undefined && transaction.purchasePrice !== null ? String(transaction.purchasePrice) : '');
      setDate(transaction.date || new Date().toISOString().split('T')[0]);
      setNote(transaction.note || '');
      setError('');
    }
  }, [transaction, isOpen]);

  const parseMoney = (val) => {
    if (val === '' || val === null || val === undefined) return 0;
    const clean = String(val).replace(/\s+/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!transaction) return;

    const parsedAmount = parseMoney(amount);
    if (parsedAmount <= 0) {
      setError('Сумма операции должна быть больше нуля');
      return;
    }

    const finalSupplier = supplierName.trim();
    if (finalSupplier && onAddSupplier) {
      onAddSupplier(finalSupplier);
    }

    const parsedCost = parseMoney(purchasePrice);

    onUpdateTransaction(transaction.id, {
      article: article.trim().toUpperCase(),
      description: description.trim(),
      carName: carName.trim(),
      supplierName: finalSupplier,
      amount: parsedAmount,
      purchasePrice: parsedCost,
      date: date || new Date().toISOString().split('T')[0],
      note: note.trim(),
      costConfirmed: parsedCost > 0 || transaction.costConfirmed || false,
    });

    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isItem ? 'Редактировать деталь / услугу' : 'Редактировать платеж'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {isItem ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Артикул / Номер
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={article}
                    onChange={(e) => setArticle(e.target.value)}
                    placeholder="OC90, 50014299..."
                    className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 uppercase font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                  Сумма клиенту (грн) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 font-mono font-bold focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Наименование детали
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Фильтр масляный, тормозные колодки..."
                className="w-full px-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Автомобиль
                </label>
                <div className="relative">
                  <Car className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={carName}
                    onChange={(e) => setCarName(e.target.value)}
                    placeholder="напр. Passat B7..."
                    className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Поставщик / Склад
                </label>
                <div className="relative">
                  <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    list="edit-suppliers-list"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="напр. Элит, Омега, Автотехник..."
                    className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
                  />
                  <datalist id="edit-suppliers-list">
                    {suppliersList.map((sup, idx) => (
                      <option key={idx} value={sup} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-rose-300 uppercase tracking-wider mb-1">
                  Себестоимость / Закупка (грн)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="0.00 (или 0 для гаражных)"
                  className="w-full px-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 font-mono focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Дата операции
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                  Сумма платежа (грн) *
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 font-mono font-bold focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Дата платежа
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Примечание (опционально)
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Комментарий к операции..."
              className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-10 sm:h-9 rounded-xl sm:rounded-lg text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="btn-primary px-5 h-10 sm:h-9 rounded-xl sm:rounded-lg text-sm font-bold cursor-pointer"
          >
            Сохранить изменения
          </button>
        </div>
      </form>
    </Modal>
  );
}
