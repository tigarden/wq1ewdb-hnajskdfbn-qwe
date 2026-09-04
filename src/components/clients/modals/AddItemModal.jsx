import React, { useState, useEffect } from 'react';
import Modal from '../../Modal';
import { Package, DollarSign, Calendar, Truck, Car, FileText, AlertCircle, ChevronDown, ChevronUp, Building2 } from 'lucide-react';

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
  const [showSupplierSection, setShowSupplierSection] = useState(false);
  const [error, setError] = useState('');

  const isWholesale = client?.clientType === 'wholesale';

  useEffect(() => {
    if (client) {
      setCarName(isWholesale ? '' : (client.car || ''));
      setDate(new Date().toISOString().split('T')[0]);
      setError('');
    }
  }, [client, isOpen, isWholesale]);

  const parseMoney = (val) => {
    if (!val) return 0;
    const clean = String(val).replace(/\s+/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!client) {
      setError('Клиент не выбран');
      return;
    }

    const finalAmount = parseMoney(amount);
    if (finalAmount <= 0) {
      setError('Пожалуйста, укажите сумму продажи клиенту (больше 0)');
      return;
    }

    const finalSupplier = supplierName.trim();
    if (finalSupplier && onAddSupplier) {
      onAddSupplier(finalSupplier);
    }

    onAddTransaction({
      clientId: client.id,
      type: 'item',
      article: article.trim().toUpperCase(),
      description: description.trim(),
      carName: carName.trim(),
      supplierName: finalSupplier,
      amount: finalAmount,
      purchasePrice: parseMoney(purchasePrice),
      date: date || new Date().toISOString().split('T')[0],
      note: note.trim(),
    });

    setArticle('');
    setDescription('');
    setAmount('');
    setPurchasePrice('');
    setSupplierName('');
    setNote('');
    setError('');
    setShowSupplierSection(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Новая деталь в заказ: ${client?.name || ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {isWholesale && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
            <Building2 className="w-3.5 h-3.5" />
            <span>Оптовый клиент / СТО — авто можно указывать индивидуально для каждой детали</span>
          </div>
        )}

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
                className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 uppercase font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              Сумма клиенту (грн) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                inputMode="decimal"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError('');
                }}
                className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-emerald-400 font-bold font-mono focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Наименование детали</label>
          <input
            type="text"
            placeholder="Фильтр масляный, тормозные колодки, рычаг..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              {isWholesale ? 'Автомобиль для детали (опционально)' : 'Автомобиль'}
            </label>
            <div className="relative">
              <Car className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isWholesale ? 'Passat B6, Audi Q7...' : 'BMW X5 / Passat'}
                value={carName}
                onChange={(e) => setCarName(e.target.value)}
                className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Дата</label>
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

        {/* Collapsible Supplier & Cost Section */}
        <div className="border border-white/[0.08] rounded-xl p-3 bg-white/[0.02]">
          <button
            type="button"
            onClick={() => setShowSupplierSection(!showSupplierSection)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <span>Поставщик и себестоимость (закупка)</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-500">
              <span className="text-[11px] font-normal hidden sm:inline">можно заполнить позже в «Очереди цен»</span>
              {showSupplierSection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showSupplierSection && (
            <div className="pt-3 space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
                    />
                    <datalist id="suppliers-datalist">
                      {suppliersList.map((sup) => (
                        <option key={sup} value={sup} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Себестоимость (закупка)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 font-mono focus:outline-hidden focus:border-blue-500"
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
                    placeholder="Дополнительные детали..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full pl-9 pr-3 h-11 sm:h-9 bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:flex sm:justify-end gap-2.5 pt-2">
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
            ✓ Добавить в заказ
          </button>
        </div>
      </form>
    </Modal>
  );
}
