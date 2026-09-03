import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { 
  Truck, 
  Plus, 
  Package, 
  CreditCard, 
  Trash2, 
  Edit3, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Settings2,
  AlertCircle
} from 'lucide-react';

export default function Suppliers({ selectedSupplierId, onSelectSupplier }) {
  const { 
    data, 
    addSupplier, 
    updateSupplier, 
    deleteSupplier,
    addSupplierTransaction, 
    updateSupplierTransaction, 
    deleteSupplierTransaction,
    getSupplierStats 
  } = useData();

  const currentSupplierId = selectedSupplierId || data.suppliers[0]?.id;
  const currentSupplier = data.suppliers.find((s) => s.id === currentSupplierId) || data.suppliers[0];
  const stats = currentSupplier ? getSupplierStats(currentSupplier.id) : null;

  // Tabs: 'timeline' | 'items' | 'payments'
  const [viewMode, setViewMode] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddSupModalOpen, setIsAddSupModalOpen] = useState(false);
  const [isEditSupModalOpen, setIsEditSupModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  // Forms state
  const [newSupName, setNewSupName] = useState('');
  const [newSupInitial, setNewSupInitial] = useState('');
  const [editSupName, setEditSupName] = useState('');
  const [editSupInitial, setEditSupInitial] = useState('');

  // Transaction item form
  const [txArticle, setTxArticle] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txPrice, setTxPrice] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txCarOrderId, setTxCarOrderId] = useState('');

  // Transaction payment form
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payNote, setPayNote] = useState('');

  const formatMoney = (val) => {
    return (val || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
  };

  const handleCreateSupplier = (e) => {
    e.preventDefault();
    if (!newSupName.trim()) return;
    const sup = addSupplier(newSupName, newSupInitial || 0);
    onSelectSupplier(sup.id);
    setNewSupName('');
    setNewSupInitial('');
    setIsAddSupModalOpen(false);
  };

  const handleUpdateSupplier = (e) => {
    e.preventDefault();
    if (!editSupName.trim()) return;
    updateSupplier(currentSupplier.id, {
      name: editSupName,
      initialBalance: parseFloat(editSupInitial) || 0,
    });
    setIsEditSupModalOpen(false);
  };

  const handleDeleteSupplier = () => {
    if (window.confirm(`Удалить поставщика "${currentSupplier.name}" и все связанные операции?`)) {
      deleteSupplier(currentSupplier.id);
      const remaining = data.suppliers.filter((s) => s.id !== currentSupplier.id);
      if (remaining.length > 0) {
        onSelectSupplier(remaining[0].id);
      }
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!txPrice) return;
    addSupplierTransaction({
      supplierId: currentSupplier.id,
      type: 'item',
      article: txArticle,
      description: txDescription,
      amount: parseFloat(txPrice),
      date: txDate,
      carOrderId: txCarOrderId || null,
    });
    setTxArticle('');
    setTxDescription('');
    setTxPrice('');
    setIsAddItemModalOpen(false);
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!payAmount) return;
    addSupplierTransaction({
      supplierId: currentSupplier.id,
      type: 'payment',
      amount: parseFloat(payAmount),
      date: payDate,
      note: payNote,
    });
    setPayAmount('');
    setPayNote('');
    setIsAddPaymentModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header & Supplier Selection Bar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full">
          {data.suppliers.map((sup) => {
            const isSelected = sup.id === currentSupplier?.id;
            const supStats = getSupplierStats(sup.id);
            return (
              <button
                key={sup.id}
                onClick={() => onSelectSupplier(sup.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                <span>{sup.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-mono ${
                  isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-900 text-slate-400'
                }`}>
                  {formatMoney(supStats?.currentDebt || 0)}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setIsAddSupModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-sm font-medium border border-dashed border-blue-500/30 whitespace-nowrap transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Новый поставщик</span>
          </button>
        </div>

        {currentSupplier && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setEditSupName(currentSupplier.name);
                setEditSupInitial(currentSupplier.initialBalance || 0);
                setIsEditSupModalOpen(true);
              }}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
              title="Редактировать поставщика"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteSupplier}
              className="p-2 text-rose-400/80 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
              title="Удалить поставщика"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Supplier Details & Stats Header */}
      {currentSupplier && stats && (
        <div className="space-y-6">
          
          {/* Supplier Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Начальный баланс</span>
              <div className="text-lg sm:text-xl font-bold font-mono text-slate-300 mt-1">
                {formatMoney(stats.initialBalance)}
              </div>
              <span className="text-[10px] text-slate-500">из настроек</span>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-amber-400 font-medium">Сумма закупок (+)</span>
              <div className="text-lg sm:text-xl font-bold font-mono text-amber-400 mt-1">
                {formatMoney(stats.totalItems)}
              </div>
              <span className="text-[10px] text-slate-400">{stats.rawItemsCount} деталей</span>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-emerald-400 font-medium">Всего оплат (-)</span>
              <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1">
                {formatMoney(stats.totalPayments)}
              </div>
              <span className="text-[10px] text-slate-400">{stats.rawPaymentsCount} платежей</span>
            </div>

            <div className={`p-4 rounded-2xl border shadow-lg ${
              stats.currentDebt > 0 
                ? 'bg-rose-950/20 border-rose-500/30 text-rose-300 shadow-rose-950/10' 
                : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 shadow-emerald-950/10'
            }`}>
              <span className="text-xs font-semibold uppercase tracking-wider">
                Текущий остаток долга
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono mt-1">
                {formatMoney(stats.currentDebt)}
              </div>
              <span className="text-[10px] opacity-80">
                {stats.currentDebt > 0 ? 'Мы должны поставщику' : 'Переплата поставщику'}
              </span>
            </div>
          </div>

          {/* Action Toolbar & View Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            
            {/* View Mode Buttons */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Лента сальдо (Все операции)</span>
              </button>
              <button
                onClick={() => setViewMode('items')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'items' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Закупки ({stats.rawItemsCount})</span>
              </button>
              <button
                onClick={() => setViewMode('payments')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'payments' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Оплаты ({stats.rawPaymentsCount})</span>
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Фильтр..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-blue-500 w-32 sm:w-44"
                />
              </div>
              <button
                onClick={() => setIsAddItemModalOpen(true)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Деталь</span>
              </button>
              <button
                onClick={() => setIsAddPaymentModalOpen(true)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Оплата</span>
              </button>
            </div>

          </div>

          {/* Table Container */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            
            {/* Mode 1: Timeline (All operations with running debt) */}
            {viewMode === 'timeline' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-4">Дата</th>
                      <th className="py-3 px-4">Тип</th>
                      <th className="py-3 px-4">Артикул / Описание</th>
                      <th className="py-3 px-4 text-right">Закупка (+)</th>
                      <th className="py-3 px-4 text-right">Оплата (-)</th>
                      <th className="py-3 px-4 text-right">Текущий Долг</th>
                      <th className="py-3 px-4 text-center">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {stats.timeline
                      .filter((tx) => {
                        if (!searchQuery) return true;
                        const q = searchQuery.toLowerCase();
                        return (
                          (tx.article && tx.article.toLowerCase().includes(q)) ||
                          (tx.description && tx.description.toLowerCase().includes(q)) ||
                          (tx.note && tx.note.toLowerCase().includes(q))
                        );
                      })
                      .map((tx) => {
                        const isItem = tx.type === 'item';
                        return (
                          <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                              {tx.date || new Date(tx.createdAt).toLocaleDateString('ru-RU')}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                                isItem ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                              }`}>
                                {isItem ? 'Закупка' : 'Оплата'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-100 font-mono">
                                {tx.article || '—'}
                              </div>
                              <div className="text-slate-400 text-[11px]">
                                {tx.description || tx.note || ''}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-amber-400 whitespace-nowrap">
                              {isItem ? formatMoney(tx.amount) : '—'}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                              {!isItem ? formatMoney(tx.amount) : '—'}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-200 bg-slate-950/20 whitespace-nowrap">
                              {formatMoney(tx.runningDebt)}
                            </td>
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <button
                                onClick={() => deleteSupplierTransaction(tx.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 rounded-md transition-colors"
                                title="Удалить запись"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    {stats.timeline.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-10 text-center text-slate-500">
                          Нет записей. Добавьте первую закупку или оплату кнопками выше.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mode 2: Items Only */}
            {viewMode === 'items' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-4">Дата</th>
                      <th className="py-3 px-4">Артикул</th>
                      <th className="py-3 px-4">Наименование</th>
                      <th className="py-3 px-4">Автомобиль</th>
                      <th className="py-3 px-4 text-right">Цена закупки</th>
                      <th className="py-3 px-4 text-center">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.supplierTransactions
                      .filter((t) => t.supplierId === currentSupplier.id && t.type === 'item')
                      .filter((t) => {
                        if (!searchQuery) return true;
                        const q = searchQuery.toLowerCase();
                        return (
                          (t.article && t.article.toLowerCase().includes(q)) ||
                          (t.description && t.description.toLowerCase().includes(q))
                        );
                      })
                      .map((item) => {
                        const car = data.carOrders.find((c) => c.id === item.carOrderId);
                        return (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                              {item.date || new Date(item.createdAt).toLocaleDateString('ru-RU')}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-blue-300">
                              {item.article || '—'}
                            </td>
                            <td className="py-3 px-4 text-slate-300">
                              {item.description || '—'}
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {car ? `${car.carModel} (${car.clientName || ''})` : '—'}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-amber-400 whitespace-nowrap">
                              {formatMoney(item.amount)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => deleteSupplierTransaction(item.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mode 3: Payments Only */}
            {viewMode === 'payments' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-4">Дата</th>
                      <th className="py-3 px-4">Сумма оплаты</th>
                      <th className="py-3 px-4">Примечание / Способ</th>
                      <th className="py-3 px-4 text-center">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.supplierTransactions
                      .filter((t) => t.supplierId === currentSupplier.id && t.type === 'payment')
                      .map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                            {pay.date || new Date(pay.createdAt).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                            {formatMoney(pay.amount)}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {pay.note || '—'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => deleteSupplierTransaction(pay.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Modal: Add Supplier */}
      <Modal isOpen={isAddSupModalOpen} onClose={() => setIsAddSupModalOpen(false)} title="Добавить нового поставщика">
        <form onSubmit={handleCreateSupplier} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Имя / Название поставщика *</label>
            <input
              type="text"
              placeholder="напр. Партс-Трейд, Автодок"
              value={newSupName}
              onChange={(e) => setNewSupName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Начальный долг (руб)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newSupInitial}
              onChange={(e) => setNewSupInitial(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono"
            />
            <span className="text-[11px] text-slate-500">
              Если есть старый долг перед созданием книги — укажите его здесь
            </span>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
          >
            Создать поставщика
          </button>
        </form>
      </Modal>

      {/* Modal: Edit Supplier */}
      <Modal isOpen={isEditSupModalOpen} onClose={() => setIsEditSupModalOpen(false)} title="Редактировать поставщика">
        <form onSubmit={handleUpdateSupplier} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Имя / Название поставщика *</label>
            <input
              type="text"
              value={editSupName}
              onChange={(e) => setEditSupName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Начальный долг (руб)</label>
            <input
              type="number"
              step="0.01"
              value={editSupInitial}
              onChange={(e) => setEditSupInitial(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all"
          >
            Сохранить изменения
          </button>
        </form>
      </Modal>

      {/* Modal: Add Item */}
      <Modal isOpen={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} title={`Закупка детали [${currentSupplier?.name}]`}>
        <form onSubmit={handleAddItem} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Артикул / Код</label>
              <input
                type="text"
                placeholder="S TL C00117/8"
                value={txArticle}
                onChange={(e) => setArticle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Цена закупки *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={txPrice}
                onChange={(e) => setTxPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono font-semibold text-amber-400"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Наименование детали</label>
            <input
              type="text"
              placeholder="Сцепление, масло, тяжки..."
              value={txDescription}
              onChange={(e) => setTxDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Дата</label>
              <input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Привязать к авто</label>
              <select
                value={txCarOrderId}
                onChange={(e) => setTxCarOrderId(e.target.value)}
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
            className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-lg shadow-amber-600/30 transition-all"
          >
            Добавить закупку
          </button>
        </form>
      </Modal>

      {/* Modal: Add Payment */}
      <Modal isOpen={isAddPaymentModalOpen} onClose={() => setIsAddPaymentModalOpen(false)} title={`Внести оплату поставщику [${currentSupplier?.name}]`}>
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Сумма оплаты *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono font-semibold text-emerald-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Дата</label>
              <input
                type="date"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Примечание</label>
            <input
              type="text"
              placeholder="Безнал, на руки, перевод..."
              value={payNote}
              onChange={(e) => setPayNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all"
          >
            Внести оплату
          </button>
        </form>
      </Modal>

    </div>
  );
}
