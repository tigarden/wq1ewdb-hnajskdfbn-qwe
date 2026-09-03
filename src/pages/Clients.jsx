import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { 
  Users, 
  Plus, 
  Package, 
  CreditCard, 
  Trash2, 
  Search, 
  History, 
  Settings2,
  Car,
  Truck
} from 'lucide-react';

export default function Clients({ selectedClientId, onSelectClient }) {
  const { 
    data, 
    addClient, 
    updateClient, 
    deleteClient,
    addClientTransaction, 
    deleteClientTransaction,
    getClientStats,
    addSupplierToDirectory
  } = useData();

  const currentClientId = selectedClientId || data.clients?.[0]?.id;
  const currentClient = data.clients?.find((c) => c.id === currentClientId) || data.clients?.[0];
  const stats = currentClient ? getClientStats(currentClient.id) : null;

  // View modes: 'timeline' | 'items' | 'payments'
  const [viewMode, setViewMode] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddCliModalOpen, setIsAddCliModalOpen] = useState(false);
  const [isEditCliModalOpen, setIsEditCliModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  // Client forms
  const [newCliName, setNewCliName] = useState('');
  const [newCliInitial, setNewCliInitial] = useState('');
  const [editCliName, setEditCliName] = useState('');
  const [editCliInitial, setEditCliInitial] = useState('');

  // Item form
  const [txArticle, setTxArticle] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txCarName, setTxCarName] = useState('');
  const [txSupplierName, setTxSupplierName] = useState('');
  const [txNewSupplier, setTxNewSupplier] = useState('');
  const [txPrice, setTxPrice] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // Payment form
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payNote, setPayNote] = useState('');

  const formatMoney = (val) => {
    return (val || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' грн';
  };

  const isEricOrVitya = currentClient && (
    currentClient.name.toLowerCase().includes('эрик') ||
    currentClient.name.toLowerCase().includes('эрнест') ||
    currentClient.name.toLowerCase().includes('витя')
  );

  const handleCreateClient = (e) => {
    e.preventDefault();
    if (!newCliName.trim()) return;
    const cli = addClient(newCliName, newCliInitial || 0);
    onSelectClient(cli.id);
    setNewCliName('');
    setNewCliInitial('');
    setIsAddCliModalOpen(false);
  };

  const handleUpdateClient = (e) => {
    e.preventDefault();
    if (!editCliName.trim()) return;
    updateClient(currentClient.id, {
      name: editCliName,
      initialBalance: parseFloat(editCliInitial) || 0,
    });
    setIsEditCliModalOpen(false);
  };

  const handleDeleteClient = () => {
    if (window.confirm(`Удалить клиента "${currentClient.name}" и всю историю операций?`)) {
      deleteClient(currentClient.id);
      const remaining = data.clients.filter((c) => c.id !== currentClient.id);
      if (remaining.length > 0) {
        onSelectClient(remaining[0].id);
      }
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!txPrice) return;
    let finalSup = txSupplierName;
    if (txNewSupplier.trim()) {
      finalSup = txNewSupplier.trim();
      addSupplierToDirectory(finalSup);
    }

    addClientTransaction({
      clientId: currentClient.id,
      type: 'item',
      article: txArticle,
      description: txDescription,
      carName: txCarName,
      supplierName: finalSup,
      amount: parseFloat(txPrice),
      date: txDate,
    });
    setTxArticle('');
    setTxDescription('');
    setTxCarName('');
    setTxPrice('');
    setTxNewSupplier('');
    setIsAddItemModalOpen(false);
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!payAmount) return;
    addClientTransaction({
      clientId: currentClient.id,
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
      
      {/* Top Header & Client Switcher */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full">
          {(data.clients || []).map((cli) => {
            const isSelected = cli.id === currentClient?.id;
            const cliStats = getClientStats(cli.id);
            return (
              <button
                key={cli.id}
                onClick={() => onSelectClient(cli.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                <span>{cli.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-mono ${
                  isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-900 text-slate-400'
                }`}>
                  {formatMoney(cliStats?.currentDebt || 0)}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setIsAddCliModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-sm font-medium border border-dashed border-blue-500/30 whitespace-nowrap transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Новый клиент</span>
          </button>
        </div>

        {currentClient && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setEditCliName(currentClient.name);
                setEditCliInitial(currentClient.initialBalance || 0);
                setIsEditCliModalOpen(true);
              }}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
              title="Настройки клиента"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteClient}
              className="p-2 text-rose-400/80 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
              title="Удалить клиента"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Client Stats & Operations */}
      {currentClient && stats && (
        <div className="space-y-6">
          
          {/* Client Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Начальный долг</span>
              <div className="text-lg sm:text-xl font-bold font-mono text-slate-300 mt-1">
                {formatMoney(stats.initialBalance)}
              </div>
              <span className="text-[10px] text-slate-500">на начало учета</span>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-amber-400 font-medium">Заказы / Детали (+)</span>
              <div className="text-lg sm:text-xl font-bold font-mono text-amber-400 mt-1">
                {formatMoney(stats.totalItems)}
              </div>
              <span className="text-[10px] text-slate-400">{stats.itemsCount} позиций</span>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-emerald-400 font-medium">Оплаты клиента (-)</span>
              <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1">
                {formatMoney(stats.totalPayments)}
              </div>
              <span className="text-[10px] text-slate-400">{stats.paymentsCount} платежей</span>
            </div>

            <div className={`p-4 rounded-2xl border shadow-lg ${
              stats.currentDebt > 0 
                ? 'bg-rose-950/20 border-rose-500/30 text-rose-300 shadow-rose-950/10' 
                : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 shadow-emerald-950/10'
            }`}>
              <span className="text-xs font-semibold uppercase tracking-wider">
                Текущий долг клиента
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono mt-1">
                {formatMoney(stats.currentDebt)}
              </div>
              <span className="text-[10px] opacity-80">
                {stats.currentDebt > 0 ? 'Клиент должен нам' : 'Клиент переплатил'}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            
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
                <span>Детали ({stats.itemsCount})</span>
              </button>
              <button
                onClick={() => setViewMode('payments')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'payments' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Оплаты ({stats.paymentsCount})</span>
              </button>
            </div>

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
            
            {viewMode === 'timeline' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-4">Дата</th>
                      <th className="py-3 px-4">Тип</th>
                      <th className="py-3 px-4">Артикул / Описание</th>
                      {isEricOrVitya && <th className="py-3 px-4">Автомобиль</th>}
                      <th className="py-3 px-4">Поставщик</th>
                      <th className="py-3 px-4 text-right">Начислено (+)</th>
                      <th className="py-3 px-4 text-right">Оплата (-)</th>
                      <th className="py-3 px-4 text-right">Текущий Долг</th>
                      <th className="py-3 px-4 text-center"></th>
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
                          (tx.carName && tx.carName.toLowerCase().includes(q)) ||
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
                                {isItem ? 'Деталь' : 'Оплата'}
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
                            {isEricOrVitya && (
                              <td className="py-3 px-4 whitespace-nowrap">
                                {tx.carName ? (
                                  <span className="inline-flex items-center space-x-1 text-slate-300 font-medium">
                                    <Car className="w-3 h-3 text-blue-400" />
                                    <span>{tx.carName}</span>
                                  </span>
                                ) : '—'}
                              </td>
                            )}
                            <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                              {tx.supplierName ? (
                                <span className="inline-flex items-center space-x-1">
                                  <Truck className="w-3 h-3 text-slate-500" />
                                  <span>{tx.supplierName}</span>
                                </span>
                              ) : '—'}
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
                                onClick={() => deleteClientTransaction(tx.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    {stats.timeline.length === 0 && (
                      <tr>
                        <td colSpan={isEricOrVitya ? "9" : "8"} className="py-10 text-center text-slate-500">
                          Нет записей. Добавьте первую деталь или оплату кнопками выше.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {viewMode === 'items' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-4">Дата</th>
                      <th className="py-3 px-4">Артикул</th>
                      <th className="py-3 px-4">Наименование</th>
                      {isEricOrVitya && <th className="py-3 px-4">Авто</th>}
                      <th className="py-3 px-4">Поставщик</th>
                      <th className="py-3 px-4 text-right">Цена (грн)</th>
                      <th className="py-3 px-4 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.clientTransactions
                      .filter((t) => t.clientId === currentClient.id && t.type === 'item')
                      .map((item) => (
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
                          {isEricOrVitya && (
                            <td className="py-3 px-4 text-slate-300 font-medium">
                              {item.carName || '—'}
                            </td>
                          )}
                          <td className="py-3 px-4 text-slate-400">
                            {item.supplierName || '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-amber-400 whitespace-nowrap">
                            {formatMoney(item.amount)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => deleteClientTransaction(item.id)}
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

            {viewMode === 'payments' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-4">Дата</th>
                      <th className="py-3 px-4">Сумма оплаты</th>
                      <th className="py-3 px-4">Примечание</th>
                      <th className="py-3 px-4 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.clientTransactions
                      .filter((t) => t.clientId === currentClient.id && t.type === 'payment')
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
                              onClick={() => deleteClientTransaction(pay.id)}
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

      {/* Modal: Add Client */}
      <Modal isOpen={isAddCliModalOpen} onClose={() => setIsAddCliModalOpen(false)} title="Добавить нового клиента">
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Имя клиента *</label>
            <input
              type="text"
              placeholder="напр. Саня, Влад"
              value={newCliName}
              onChange={(e) => setNewCliName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Начальный долг (грн)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newCliInitial}
              onChange={(e) => setNewCliInitial(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
          >
            Создать клиента
          </button>
        </form>
      </Modal>

      {/* Modal: Edit Client */}
      <Modal isOpen={isEditCliModalOpen} onClose={() => setIsEditCliModalOpen(false)} title="Редактировать клиента">
        <form onSubmit={handleUpdateClient} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Имя клиента *</label>
            <input
              type="text"
              value={editCliName}
              onChange={(e) => setEditCliName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Начальный долг (грн)</label>
            <input
              type="number"
              step="0.01"
              value={editCliInitial}
              onChange={(e) => setEditCliInitial(e.target.value)}
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
      <Modal isOpen={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} title={`Записать деталь клиенту [${currentClient?.name}]`}>
        <form onSubmit={handleAddItem} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Артикул / Код</label>
              <input
                type="text"
                placeholder="S TL C00117/8"
                value={txArticle}
                onChange={(e) => setTxArticle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Цена (грн) *</label>
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
              placeholder="Сцепление, масло, фильтр, амортизатор..."
              value={txDescription}
              onChange={(e) => setTxDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Автомобиль {isEricOrVitya ? '(для ' + currentClient.name + ')' : '(опционально)'}
              </label>
              <input
                type="text"
                placeholder="Чери, Ренж, Тойота..."
                value={txCarName}
                onChange={(e) => setTxCarName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Поставщик (опционально)</label>
              <select
                value={txSupplierName}
                onChange={(e) => {
                  setTxSupplierName(e.target.value);
                  if (e.target.value !== '__new__') setTxNewSupplier('');
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
          </div>

          {txSupplierName === '__new__' && (
            <div>
              <input
                type="text"
                placeholder="Название нового поставщика..."
                value={txNewSupplier}
                onChange={(e) => setTxNewSupplier(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-blue-500 rounded-xl text-slate-100 text-xs"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Дата</label>
            <input
              type="date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-lg shadow-amber-600/30 transition-all"
          >
            Добавить деталь
          </button>
        </form>
      </Modal>

      {/* Modal: Add Payment */}
      <Modal isOpen={isAddPaymentModalOpen} onClose={() => setIsAddPaymentModalOpen(false)} title={`Внести оплату от клиента [${currentClient?.name}]`}>
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Сумма оплаты (грн) *</label>
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
            <label className="block text-xs font-medium text-slate-300 mb-1">Примечание (нал, карта...)</label>
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
