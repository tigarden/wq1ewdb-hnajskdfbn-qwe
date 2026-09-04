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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        
        {/* Master Column (Left / 4 cols on desktop) */}
        <div className={`lg:col-span-4 space-y-2.5 ${mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
          <div className="surface-card rounded-lg p-3 space-y-3">
            
            {/* Master Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Клиенты</span>
                  <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-1.5 py-0.2 rounded">
                    {data.clients?.length || 0}
                  </span>
                </h2>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setSortByDebt(!sortByDebt)}
                  title={sortByDebt ? 'Сортировка по долгу' : 'Сортировка по имени'}
                  className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsAddCliModalOpen(true)}
                  className="btn-sm h-8 px-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Новый</span>
                </button>
              </div>
            </div>

            {/* Client Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Поиск клиента, авто, телефона..."
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                className="input-md w-full pl-8 pr-3"
              />
            </div>

            {/* Clients List */}
            <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-0.5">
              {filteredClients.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">
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
                      className={`cursor-pointer p-2.5 rounded-md border transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500/40 text-white'
                          : 'bg-white/[0.01] hover:bg-white/[0.04] border-white/5 text-slate-300'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center space-x-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isDebtor ? 'bg-amber-400' : 'bg-emerald-400'
                          }`} />
                          <span className={`text-xs font-bold truncate ${
                            isSelected ? 'text-white' : 'text-slate-200'
                          }`}>
                            {cli.name}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1 pl-3.5">
                          {cli.car && (
                            <span className="flex items-center space-x-1 truncate text-slate-400">
                              <Car className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                              <span className="truncate">{cli.car}</span>
                            </span>
                          )}
                          {cli.phone && (
                            <span className="text-[10px] text-slate-500 truncate hidden sm:inline font-mono">
                              {cli.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`text-xs font-bold font-mono tracking-tight ${
                          isDebtor ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {formatMoney(cli.currentDebt)}
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono block">
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
        <div className={`lg:col-span-8 space-y-3.5 ${!mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
          {currentClient && stats ? (
            <>
              {/* Back button on mobile */}
              <div className="lg:hidden mb-2">
                <button
                  onClick={() => setMobileShowDetail(false)}
                  className="btn-sm h-8 px-3 rounded-md bg-white/5 border border-white/10 text-slate-300 text-xs font-medium inline-flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Список всех клиентов</span>
                </button>
              </div>

              {/* Client Dossier Banner */}
              <div className="surface-card rounded-lg p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-md bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 font-mono">
                      {currentClient.name.slice(0, 1).toUpperCase()}
                    </div>
                    
                    <div>
                      <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {currentClient.name}
                      </h1>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-0.5">
                        {currentClient.phone ? (
                          <a 
                            href={`tel:${currentClient.phone}`}
                            className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-mono transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{currentClient.phone}</span>
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
                            <span>+ Телефон</span>
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
                            <span>+ Авто</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleOpenAddItem}
                      className="btn-sm h-8 px-3 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Деталь</span>
                    </button>

                    <button
                      onClick={() => setIsAddPaymentModalOpen(true)}
                      className="btn-sm h-8 px-3 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
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
                      className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
                      title="Настройки клиента"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={handleDeleteClient}
                      className="w-8 h-8 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center justify-center transition-colors cursor-pointer"
                      title="Удалить клиента"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

                {/* KPI Cards for Client */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="surface-elevated p-3 rounded-md border border-white/5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Текущий долг</span>
                    <span className={`text-base sm:text-lg font-bold font-mono mt-0.5 block ${
                      stats.currentDebt > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {formatMoney(stats.currentDebt)}
                    </span>
                  </div>

                  <div className="surface-elevated p-3 rounded-md border border-white/5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Заказано деталей</span>
                    <span className="text-base sm:text-lg font-bold font-mono text-slate-100 mt-0.5 block">
                      {formatMoney(stats.totalItems)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {pluralize(stats.itemsCount, ['позиция', 'позиции', 'позиций'])}
                    </span>
                  </div>

                  <div className="surface-elevated p-3 rounded-md border border-white/5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Оплачено</span>
                    <span className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-0.5 block">
                      {formatMoney(stats.totalPayments)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {pluralize(stats.paymentsCount, ['платеж', 'платежа', 'платежей'])}
                    </span>
                  </div>

                  <div className="surface-elevated p-3 rounded-md border border-white/5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Чистый доход</span>
                    <span className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-0.5 block">
                      +{formatMoney(stats.clientProfit || 0)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      маржа с деталей
                    </span>
                  </div>
                </div>

              </div>

              {/* Transactions Ledger Container */}
              <div className="surface-card rounded-lg p-4 space-y-3">
                
                {/* Ledger Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-white/10">
                  <div className="h-8 flex p-0.5 bg-[#090d16] rounded-md border border-white/10">
                    <button
                      onClick={() => setViewMode('timeline')}
                      className={`h-7 px-2.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                        viewMode === 'timeline' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>История ({stats.timeline.length})</span>
                    </button>
                    <button
                      onClick={() => setViewMode('items')}
                      className={`h-7 px-2.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                        viewMode === 'items' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Детали ({stats.itemsCount})</span>
                    </button>
                    <button
                      onClick={() => setViewMode('payments')}
                      className={`h-7 px-2.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                        viewMode === 'payments' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Оплаты ({stats.paymentsCount})</span>
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Поиск по артикулу, описанию..."
                      value={ledgerSearchQuery}
                      onChange={(e) => setLedgerSearchQuery(e.target.value)}
                      className="input-sm h-8 w-full sm:w-56 pl-7.5 pr-2.5 rounded-md text-xs"
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
            <div className="surface-card rounded-lg p-8 text-center">
              <p className="text-slate-400 text-xs font-mono">Выберите клиента слева для просмотра досье</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal: Add Client */}
      <Modal isOpen={isAddCliModalOpen} onClose={() => setIsAddCliModalOpen(false)} title="Добавить нового клиента">
        <form onSubmit={handleCreateClient} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Имя клиента *</label>
            <input
              type="text"
              placeholder="напр. Саня, Влад"
              value={newCliName}
              onChange={(e) => setNewCliName(e.target.value)}
              className="w-full input-md"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Номер телефона</label>
              <input
                type="tel"
                placeholder="+380..."
                value={newCliPhone}
                onChange={(e) => setNewCliPhone(e.target.value)}
                className="w-full input-md font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Автомобиль</label>
              <input
                type="text"
                placeholder="Passat B6, Camry 70"
                value={newCliCar}
                onChange={(e) => setNewCliCar(e.target.value)}
                className="w-full input-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Начальный долг (грн)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newCliInitial}
              onChange={(e) => setNewCliInitial(e.target.value)}
              className="w-full input-md font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors mt-2 cursor-pointer"
          >
            Создать клиента
          </button>
        </form>
      </Modal>

      {/* Modal: Edit Client */}
      <Modal isOpen={isEditCliModalOpen} onClose={() => setIsEditCliModalOpen(false)} title="Редактировать клиента">
        <form onSubmit={handleUpdateClient} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Имя клиента *</label>
            <input
              type="text"
              value={editCliName}
              onChange={(e) => setEditCliName(e.target.value)}
              className="w-full input-md"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Номер телефона</label>
              <input
                type="tel"
                value={editCliPhone}
                onChange={(e) => setEditCliPhone(e.target.value)}
                className="w-full input-md font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Автомобиль</label>
              <input
                type="text"
                value={editCliCar}
                onChange={(e) => setEditCliCar(e.target.value)}
                className="w-full input-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Начальный долг (грн)</label>
            <input
              type="number"
              step="0.01"
              value={editCliInitial}
              onChange={(e) => setEditCliInitial(e.target.value)}
              className="w-full input-md font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors mt-2 cursor-pointer"
          >
            Сохранить изменения
          </button>
        </form>
      </Modal>

      {/* Modal: Add Item */}
      <Modal isOpen={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} title={`Записать деталь клиенту [${currentClient?.name}]`}>
        <form onSubmit={handleAddItem} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Артикул / Код</label>
              <input
                type="text"
                placeholder="напр. S TL C00117/8"
                value={txArticle}
                onChange={(e) => setTxArticle(e.target.value)}
                className="w-full input-md uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Автомобиль</label>
              <input
                type="text"
                placeholder={currentClient?.car || 'Модель авто'}
                value={txCarName}
                onChange={(e) => setTxCarName(e.target.value)}
                className="w-full input-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Наименование / Описание</label>
            <input
              type="text"
              placeholder="напр. Колодки тормозные задние"
              value={txDescription}
              onChange={(e) => setTxDescription(e.target.value)}
              className="w-full input-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Поставщик</label>
              <select
                value={txSupplierName}
                onChange={(e) => setTxSupplierName(e.target.value)}
                className="w-full input-md"
              >
                <option value="" className="bg-[#0b0f19] text-white">— Выберите из базы —</option>
                {(data.suppliersList || []).map((s) => (
                  <option key={s} value={s} className="bg-[#0b0f19] text-white">{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Или новый поставщик</label>
              <input
                type="text"
                placeholder="напр. Элит, Тотус"
                value={txNewSupplier}
                onChange={(e) => setTxNewSupplier(e.target.value)}
                className="w-full input-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Продажа клиенту *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={txPrice}
                onChange={(e) => setTxPrice(e.target.value)}
                className="w-full input-md font-mono font-bold text-amber-400 border-amber-500/30 focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Себестоимость (закупка)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={txPurchasePrice}
                onChange={(e) => setTxPurchasePrice(e.target.value)}
                className="w-full input-md font-mono"
              />
            </div>
          </div>

          {txPrice && txPurchasePrice && parseFloat(txPrice) > parseFloat(txPurchasePrice) && (
            <div className="p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 flex items-center justify-between">
              <span>Прибыль с детали:</span>
              <strong className="text-sm font-bold">+{formatMoney(parseFloat(txPrice) - parseFloat(txPurchasePrice))}</strong>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Дата операции</label>
            <input
              type="date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              className="w-full input-md font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors mt-2 cursor-pointer"
          >
            Добавить деталь в долг
          </button>
        </form>
      </Modal>

      {/* Modal: Add Payment */}
      <Modal isOpen={isAddPaymentModalOpen} onClose={() => setIsAddPaymentModalOpen(false)} title={`Внести оплату от [${currentClient?.name}]`}>
        <form onSubmit={handleAddPayment} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">Сумма оплаты (грн) *</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              autoFocus
              className="w-full input-md font-mono font-bold text-emerald-400 border-emerald-500/30 focus:border-emerald-400 text-base"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Примечание</label>
            <input
              type="text"
              placeholder="напр. Наличные, на карту, аванс"
              value={payNote}
              onChange={(e) => setPayNote(e.target.value)}
              className="w-full input-md"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Дата оплаты</label>
            <input
              type="date"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              className="w-full input-md font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors mt-2 cursor-pointer"
          >
            Зафиксировать оплату
          </button>
        </form>
      </Modal>

    </div>
  );
}
