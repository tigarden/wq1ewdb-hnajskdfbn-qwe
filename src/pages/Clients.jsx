import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { formatMoney, pluralize } from '../utils/format';
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
  Truck,
  Phone,
  DollarSign,
  Copy,
  Check,
  ChevronRight,
  ArrowLeft,
  ArrowUpDown,
  Filter,
  AlertCircle
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

  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [sortByDebt, setSortByDebt] = useState(true);
  const [mobileShowDetail, setMobileShowDetail] = useState(Boolean(selectedClientId));

  // Active client selection
  const currentClientId = selectedClientId || data.clients?.[0]?.id;
  const currentClient = data.clients?.find((c) => c.id === currentClientId) || data.clients?.[0];
  const stats = currentClient ? getClientStats(currentClient.id) : null;

  // View modes: 'timeline' | 'items' | 'payments'
  const [viewMode, setViewMode] = useState('timeline');
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');
  const [copiedArticle, setCopiedArticle] = useState(null);

  // Modals
  const [isAddCliModalOpen, setIsAddCliModalOpen] = useState(false);
  const [isEditCliModalOpen, setIsEditCliModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  // Client forms
  const [newCliName, setNewCliName] = useState('');
  const [newCliPhone, setNewCliPhone] = useState('');
  const [newCliCar, setNewCliCar] = useState('');
  const [newCliInitial, setNewCliInitial] = useState('');

  const [editCliName, setEditCliName] = useState('');
  const [editCliPhone, setEditCliPhone] = useState('');
  const [editCliCar, setEditCliCar] = useState('');
  const [editCliInitial, setEditCliInitial] = useState('');

  // Item form
  const [txArticle, setTxArticle] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txCarName, setTxCarName] = useState('');
  const [txSupplierName, setTxSupplierName] = useState('');
  const [txNewSupplier, setTxNewSupplier] = useState('');
  const [txPrice, setTxPrice] = useState('');
  const [txPurchasePrice, setTxPurchasePrice] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // Payment form
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payNote, setPayNote] = useState('');

  // Clients sorted & filtered
  const filteredClients = useMemo(() => {
    let list = [...(data.clients || [])].map((c) => {
      const st = getClientStats(c.id);
      return {
        ...c,
        currentDebt: st?.currentDebt || 0,
        itemsCount: st?.itemsCount || 0,
      };
    });

    if (clientSearchQuery.trim()) {
      const q = clientSearchQuery.toLowerCase().trim();
      list = list.filter((c) => 
        c.name.toLowerCase().includes(q) ||
        (c.car && c.car.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
      );
    }

    if (sortByDebt) {
      list.sort((a, b) => b.currentDebt - a.currentDebt);
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [data.clients, clientSearchQuery, sortByDebt, getClientStats]);

  const handleCopy = (art, e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(art);
    setCopiedArticle(art);
    setTimeout(() => setCopiedArticle(null), 1500);
  };

  const handleSelectClient = (id) => {
    onSelectClient(id);
    setMobileShowDetail(true);
  };

  const handleCreateClient = (e) => {
    e.preventDefault();
    if (!newCliName.trim()) return;
    const cli = addClient(newCliName, newCliInitial || 0, newCliPhone, newCliCar);
    onSelectClient(cli.id);
    setMobileShowDetail(true);
    setNewCliName('');
    setNewCliPhone('');
    setNewCliCar('');
    setNewCliInitial('');
    setIsAddCliModalOpen(false);
  };

  const handleUpdateClient = (e) => {
    e.preventDefault();
    if (!editCliName.trim()) return;
    updateClient(currentClient.id, {
      name: editCliName,
      phone: editCliPhone,
      car: editCliCar,
      initialBalance: parseFloat(editCliInitial) || 0,
    });
    setIsEditCliModalOpen(false);
  };

  const handleDeleteClient = () => {
    if (window.confirm(`Удалить клиента "${currentClient.name}" и все связанные операции?`)) {
      deleteClient(currentClient.id);
      const remaining = data.clients.filter((c) => c.id !== currentClient.id);
      if (remaining.length > 0) {
        onSelectClient(remaining[0].id);
      } else {
        setMobileShowDetail(false);
      }
    }
  };

  const handleOpenAddItem = () => {
    setTxCarName(currentClient?.car || '');
    setIsAddItemModalOpen(true);
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
      carName: txCarName || currentClient?.car || '',
      supplierName: finalSup,
      amount: parseFloat(txPrice),
      purchasePrice: parseFloat(txPurchasePrice) || 0,
      date: txDate,
    });

    setTxArticle('');
    setTxDescription('');
    setTxCarName('');
    setTxPrice('');
    setTxPurchasePrice('');
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
      
      {/* Master-Detail Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Master Column (Left / 4 cols on desktop) */}
        <div className={`lg:col-span-4 space-y-3 ${mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-[#101726]/80 rounded-2xl border border-white/5 p-4 card-emboss backdrop-blur-sm space-y-3">
            
            {/* Master Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Клиенты</span>
                </h2>
                <span className="text-[11px] text-slate-400 font-mono">
                  Всего: {data.clients?.length || 0}
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setSortByDebt(!sortByDebt)}
                  title={sortByDebt ? 'Сортировка по долгу' : 'Сортировка по имени'}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsAddCliModalOpen(true)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all card-emboss"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Новый</span>
                </button>
              </div>
            </div>

            {/* Client Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Поиск по имени, авто, тел..."
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Clients List */}
            <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {filteredClients.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Клиентов не найдено
                </div>
              ) : (
                filteredClients.map((cli) => {
                  const isSelected = cli.id === currentClient?.id;
                  const isDebtor = cli.currentDebt > 0;

                  return (
                    <div
                      key={cli.id}
                      onClick={() => handleSelectClient(cli.id)}
                      className={`cursor-pointer p-3 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500/50 shadow-md card-emboss'
                          : 'bg-slate-900/50 hover:bg-slate-800/60 border-slate-800/70'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            isDebtor ? 'bg-amber-400' : 'bg-emerald-400'
                          }`} />
                          <span className={`text-xs font-bold truncate ${
                            isSelected ? 'text-white' : 'text-slate-200'
                          }`}>
                            {cli.name}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1 pl-4">
                          {cli.car && (
                            <span className="flex items-center space-x-0.5 truncate text-slate-400">
                              <Car className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                              <span className="truncate">{cli.car}</span>
                            </span>
                          )}
                          {cli.phone && (
                            <span className="text-[10px] text-slate-500 truncate hidden sm:inline">
                              {cli.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`text-xs sm:text-sm font-bold font-mono tracking-tight ${
                          isDebtor ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {formatMoney(cli.currentDebt)}
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {pluralize(cli.itemsCount, ['дет', 'дет', 'дет'])}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* Detail Dossier Column (Right / 8 cols on desktop) */}
        <div className={`lg:col-span-8 space-y-4 ${!mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
          {currentClient && stats ? (
            <>
              {/* Back button on mobile */}
              <div className="lg:hidden mb-2">
                <button
                  onClick={() => setMobileShowDetail(false)}
                  className="flex items-center space-x-1 text-xs text-blue-400 font-semibold py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Список всех клиентов</span>
                </button>
              </div>

              {/* Client Dossier Banner */}
              <div className="bg-[#101726]/80 rounded-2xl border border-white/5 p-5 card-emboss backdrop-blur-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/30 border border-blue-500/30 text-blue-400 flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/10 card-emboss shrink-0">
                      {currentClient.name.slice(0, 1).toUpperCase()}
                    </div>
                    
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {currentClient.name}
                      </h1>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-1">
                        {currentClient.phone ? (
                          <a 
                            href={`tel:${currentClient.phone}`}
                            className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            <span className="font-mono">{currentClient.phone}</span>
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              setEditCliName(currentClient.name);
                              setEditCliPhone(currentClient.phone || '');
                              setEditCliCar(currentClient.car || '');
                              setEditCliInitial(currentClient.initialBalance || 0);
                              setIsEditCliModalOpen(true);
                            }}
                            className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center space-x-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>+ Добавить телефон</span>
                          </button>
                        )}

                        {currentClient.car ? (
                          <Badge variant="car" size="sm">
                            <Car className="w-3 h-3 text-blue-400 mr-1" />
                            <span>{currentClient.car}</span>
                          </Badge>
                        ) : (
                          <button
                            onClick={() => {
                              setEditCliName(currentClient.name);
                              setEditCliPhone(currentClient.phone || '');
                              setEditCliCar(currentClient.car || '');
                              setEditCliInitial(currentClient.initialBalance || 0);
                              setIsEditCliModalOpen(true);
                            }}
                            className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center space-x-1"
                          >
                            <Car className="w-3 h-3" />
                            <span>+ Добавить авто</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleOpenAddItem}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all card-emboss"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Деталь</span>
                    </button>

                    <button
                      onClick={() => setIsAddPaymentModalOpen(true)}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all card-emboss"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Оплата</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditCliName(currentClient.name);
                        setEditCliPhone(currentClient.phone || '');
                        setEditCliCar(currentClient.car || '');
                        setEditCliInitial(currentClient.initialBalance || 0);
                        setIsEditCliModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
                      title="Настройки клиента"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleDeleteClient}
                      className="p-2 text-rose-400/80 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors border border-slate-800 hover:border-rose-500/30"
                      title="Удалить клиента"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* KPI Cards for Client */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 card-emboss">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Текущий долг</span>
                    <span className={`text-lg sm:text-xl font-bold font-mono ${
                      stats.currentDebt > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {formatMoney(stats.currentDebt)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 card-emboss">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Заказано деталей</span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-slate-100">
                      {formatMoney(stats.totalItems)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {pluralize(stats.itemsCount, ['позиция', 'позиции', 'позиций'])}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 card-emboss">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Оплачено</span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
                      {formatMoney(stats.totalPayments)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {pluralize(stats.paymentsCount, ['платеж', 'платежа', 'платежей'])}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 card-emboss">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Чистый доход</span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
                      +{formatMoney(stats.clientProfit || 0)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      маржа с деталей
                    </span>
                  </div>
                </div>

              </div>

              {/* Transactions Ledger Container */}
              <div className="bg-[#101726]/80 rounded-2xl border border-white/5 p-5 card-emboss backdrop-blur-sm space-y-4">
                
                {/* Ledger Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <button
                      onClick={() => setViewMode('timeline')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        viewMode === 'timeline' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>История ({stats.timeline.length})</span>
                    </button>
                    <button
                      onClick={() => setViewMode('items')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        viewMode === 'items' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Детали ({stats.itemsCount})</span>
                    </button>
                    <button
                      onClick={() => setViewMode('payments')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        viewMode === 'payments' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Оплаты ({stats.paymentsCount})</span>
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Поиск по артикулу, описанию..."
                      value={ledgerSearchQuery}
                      onChange={(e) => setLedgerSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-full sm:w-56"
                    />
                  </div>
                </div>

                {/* View 1: Timeline Table */}
                {viewMode === 'timeline' && (
                  <div className="overflow-x-auto -mx-5 px-5">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/5 bg-slate-950/40 text-slate-400 uppercase font-bold text-[10px]">
                          <th className="py-3 px-3">Дата</th>
                          <th className="py-3 px-3">Тип</th>
                          <th className="py-3 px-3">Артикул / Описание</th>
                          <th className="py-3 px-3">Авто</th>
                          <th className="py-3 px-3">Поставщик</th>
                          <th className="py-3 px-3 text-right">Начислено (+)</th>
                          <th className="py-3 px-3 text-right">Оплата (-)</th>
                          <th className="py-3 px-3 text-right">Текущий долг</th>
                          <th className="py-3 px-2 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {stats.timeline
                          .filter((tx) => {
                            if (!ledgerSearchQuery) return true;
                            const q = ledgerSearchQuery.toLowerCase();
                            return (
                              (tx.article && tx.article.toLowerCase().includes(q)) ||
                              (tx.description && tx.description.toLowerCase().includes(q)) ||
                              (tx.carName && tx.carName.toLowerCase().includes(q)) ||
                              (tx.note && tx.note.toLowerCase().includes(q))
                            );
                          })
                          .map((tx) => {
                            const isItem = tx.type === 'item';
                            const carDisplay = tx.carName || currentClient?.car;

                            return (
                              <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-3 px-3 text-slate-400 font-mono whitespace-nowrap">
                                  {tx.date || new Date(tx.createdAt).toLocaleDateString('ru-RU')}
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <Badge variant={isItem ? 'item' : 'payment'} size="xs">
                                    {isItem ? 'Деталь' : 'Оплата'}
                                  </Badge>
                                </td>
                                <td className="py-3 px-3">
                                  {tx.article && (
                                    <button
                                      onClick={(e) => handleCopy(tx.article, e)}
                                      className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-slate-900 border border-blue-500/30 text-blue-400 font-mono text-[10px] font-bold mr-1.5"
                                    >
                                      <span>{tx.article}</span>
                                      {copiedArticle === tx.article ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 opacity-60" />}
                                    </button>
                                  )}
                                  <span className="text-slate-300 font-medium">
                                    {tx.description || tx.note || ''}
                                  </span>
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap text-slate-400">
                                  {carDisplay ? (
                                    <span className="inline-flex items-center space-x-1 text-slate-300 text-[11px]">
                                      <Car className="w-3 h-3 text-blue-400" />
                                      <span>{carDisplay}</span>
                                    </span>
                                  ) : '—'}
                                </td>
                                <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                                  {tx.supplierName ? (
                                    <span className="inline-flex items-center space-x-1 text-[11px]">
                                      <Truck className="w-3 h-3 text-slate-500" />
                                      <span>{tx.supplierName}</span>
                                    </span>
                                  ) : '—'}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-amber-400 whitespace-nowrap">
                                  {isItem ? formatMoney(tx.amount) : '—'}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                                  {!isItem ? formatMoney(tx.amount) : '—'}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-slate-200 whitespace-nowrap">
                                  {formatMoney(tx.runningDebt)}
                                </td>
                                <td className="py-3 px-2 text-center whitespace-nowrap">
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
                            <td colSpan="9" className="py-8">
                              <EmptyState
                                icon={History}
                                title="Операций еще нет"
                                description="Нажмите «+ Деталь» или «+ Оплата», чтобы внести первую запись."
                                actionLabel="Добавить деталь"
                                onAction={handleOpenAddItem}
                              />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* View 2: Items Table with Cost & Margin */}
                {viewMode === 'items' && (
                  <div className="overflow-x-auto -mx-5 px-5">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/5 bg-slate-950/40 text-slate-400 uppercase font-bold text-[10px]">
                          <th className="py-3 px-3">Дата</th>
                          <th className="py-3 px-3">Артикул</th>
                          <th className="py-3 px-3">Наименование</th>
                          <th className="py-3 px-3">Авто</th>
                          <th className="py-3 px-3">Поставщик</th>
                          <th className="py-3 px-3 text-right">Закупка</th>
                          <th className="py-3 px-3 text-right">Продажа (грн)</th>
                          <th className="py-3 px-3 text-right">Маржа</th>
                          <th className="py-3 px-2 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {data.clientTransactions
                          .filter((t) => t.clientId === currentClient.id && t.type === 'item')
                          .map((item) => {
                            const hasCost = (item.purchasePrice || 0) > 0;
                            const profit = hasCost ? item.amount - item.purchasePrice : null;

                            return (
                              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-3 px-3 text-slate-400 font-mono whitespace-nowrap">
                                  {item.date || new Date(item.createdAt).toLocaleDateString('ru-RU')}
                                </td>
                                <td className="py-3 px-3 font-mono font-bold text-blue-300 whitespace-nowrap">
                                  {item.article ? (
                                    <button
                                      onClick={(e) => handleCopy(item.article, e)}
                                      className="inline-flex items-center space-x-1 hover:underline"
                                    >
                                      <span>{item.article}</span>
                                      {copiedArticle === item.article && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                                    </button>
                                  ) : '—'}
                                </td>
                                <td className="py-3 px-3 text-slate-300">
                                  {item.description || '—'}
                                </td>
                                <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                                  {item.carName || currentClient?.car || '—'}
                                </td>
                                <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                                  {item.supplierName || '—'}
                                </td>
                                <td className="py-3 px-3 text-right font-mono text-slate-300 whitespace-nowrap">
                                  {hasCost ? formatMoney(item.purchasePrice) : <span className="text-amber-400 italic">в очереди</span>}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-amber-400 whitespace-nowrap">
                                  {formatMoney(item.amount)}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                                  {profit !== null ? `+${formatMoney(profit)}` : '—'}
                                </td>
                                <td className="py-3 px-2 text-center whitespace-nowrap">
                                  <button
                                    onClick={() => deleteClientTransaction(item.id)}
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

                {/* View 3: Payments Table */}
                {viewMode === 'payments' && (
                  <div className="overflow-x-auto -mx-5 px-5">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/5 bg-slate-950/40 text-slate-400 uppercase font-bold text-[10px]">
                          <th className="py-3 px-3">Дата</th>
                          <th className="py-3 px-3">Сумма оплаты</th>
                          <th className="py-3 px-3">Примечание</th>
                          <th className="py-3 px-2 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {data.clientTransactions
                          .filter((t) => t.clientId === currentClient.id && t.type === 'payment')
                          .map((pay) => (
                            <tr key={pay.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-3 text-slate-400 font-mono whitespace-nowrap">
                                {pay.date || new Date(pay.createdAt).toLocaleDateString('ru-RU')}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-emerald-400 whitespace-nowrap text-sm">
                                {formatMoney(pay.amount)}
                              </td>
                              <td className="py-3 px-3 text-slate-300">
                                {pay.note || 'Оплата задолженности'}
                              </td>
                              <td className="py-3 px-2 text-center whitespace-nowrap">
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
            </>
          ) : (
            <div className="bg-[#101726]/80 rounded-2xl border border-white/5 p-8 text-center card-emboss">
              <p className="text-slate-400 text-sm">Выберите клиента слева для просмотра досье</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal: Add Client */}
      <Modal isOpen={isAddCliModalOpen} onClose={() => setIsAddCliModalOpen(false)} title="Добавить нового клиента">
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Имя клиента *</label>
            <input
              type="text"
              placeholder="напр. Саня, Влад"
              value={newCliName}
              onChange={(e) => setNewCliName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Номер телефона</label>
              <input
                type="tel"
                placeholder="+380..."
                value={newCliPhone}
                onChange={(e) => setNewCliPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Автомобиль</label>
              <input
                type="text"
                placeholder="Passat B6, Camry 70"
                value={newCliCar}
                onChange={(e) => setNewCliCar(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Начальный долг (грн)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newCliInitial}
              onChange={(e) => setNewCliInitial(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all card-emboss"
          >
            Создать клиента
          </button>
        </form>
      </Modal>

      {/* Modal: Edit Client */}
      <Modal isOpen={isEditCliModalOpen} onClose={() => setIsEditCliModalOpen(false)} title="Редактировать клиента">
        <form onSubmit={handleUpdateClient} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Имя клиента *</label>
            <input
              type="text"
              value={editCliName}
              onChange={(e) => setEditCliName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Номер телефона</label>
              <input
                type="tel"
                value={editCliPhone}
                onChange={(e) => setEditCliPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Автомобиль</label>
              <input
                type="text"
                value={editCliCar}
                onChange={(e) => setEditCliCar(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Начальный долг (грн)</label>
            <input
              type="number"
              step="0.01"
              value={editCliInitial}
              onChange={(e) => setEditCliInitial(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all card-emboss"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Артикул / Код</label>
              <input
                type="text"
                placeholder="напр. S TL C00117/8"
                value={txArticle}
                onChange={(e) => setTxArticle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Автомобиль</label>
              <input
                type="text"
                placeholder={currentClient?.car || 'Модель авто'}
                value={txCarName}
                onChange={(e) => setTxCarName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Наименование / Описание</label>
            <input
              type="text"
              placeholder="напр. Колодки тормозные задние"
              value={txDescription}
              onChange={(e) => setTxDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Поставщик</label>
              <select
                value={txSupplierName}
                onChange={(e) => setTxSupplierName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">— Выберите из базы —</option>
                {(data.suppliersList || []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Или новый поставщик</label>
              <input
                type="text"
                placeholder="напр. Элит, Тотус"
                value={txNewSupplier}
                onChange={(e) => setTxNewSupplier(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1.5">Цена продажи клиенту *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={txPrice}
                onChange={(e) => setTxPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-amber-500/40 rounded-xl text-slate-100 text-sm font-mono focus:outline-none focus:border-amber-400 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Закупочная цена (опция)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={txPurchasePrice}
                onChange={(e) => setTxPurchasePrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {txPrice && txPurchasePrice && parseFloat(txPrice) > parseFloat(txPurchasePrice) && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 flex items-center justify-between">
              <span>Прибыль с детали:</span>
              <strong className="text-sm font-bold">+{formatMoney(parseFloat(txPrice) - parseFloat(txPurchasePrice))}</strong>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Дата операции</label>
            <input
              type="date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all card-emboss"
          >
            Добавить деталь в долг
          </button>
        </form>
      </Modal>

      {/* Modal: Add Payment */}
      <Modal isOpen={isAddPaymentModalOpen} onClose={() => setIsAddPaymentModalOpen(false)} title={`Внести оплату от [${currentClient?.name}]`}>
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1.5">Сумма оплаты (грн) *</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              autoFocus
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-emerald-500/40 rounded-xl text-slate-100 text-lg font-mono focus:outline-none focus:border-emerald-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Примечание</label>
            <input
              type="text"
              placeholder="напр. Наличные, на карту, аванс"
              value={payNote}
              onChange={(e) => setPayNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Дата оплаты</label>
            <input
              type="date"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all card-emboss"
          >
            Зафиксировать оплату
          </button>
        </form>
      </Modal>

    </div>
  );
}
