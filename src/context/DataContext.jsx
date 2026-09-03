import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { loadLocalData, saveLocalData, loadSettings, saveSettings } from '../services/storage';
import { fetchRepoFile, saveRepoFile } from '../services/githubApi';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState(() => loadLocalData());
  const [settings, setSettings] = useState(() => loadSettings());
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'unsaved' | 'error' | 'no_token'
  const [syncError, setSyncError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(() => settings.lastSyncTime);
  const [currentSha, setCurrentSha] = useState(() => settings.lastSha);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update local storage when data changes
  const updateData = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveLocalData(next);
      setHasUnsavedChanges(true);
      setSyncStatus('unsaved');
      return next;
    });
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      saveSettings(merged);
      return merged;
    });
  }, []);

  // Sync to GitHub (Push)
  const pushToGitHub = useCallback(async (customCommitMsg) => {
    if (!settings.token) {
      setSyncStatus('no_token');
      return { success: false, error: 'Токен GitHub не настроен' };
    }

    setSyncStatus('syncing');
    setSyncError(null);

    try {
      // First get latest SHA if needed
      let shaToUse = currentSha;
      try {
        const remote = await fetchRepoFile(settings.token, settings.owner, settings.repo, settings.path);
        if (remote.exists && remote.sha) {
          shaToUse = remote.sha;
        }
      } catch (e) {
        // file might not exist yet
      }

      const res = await saveRepoFile(
        settings.token,
        settings.owner,
        settings.repo,
        settings.path,
        data,
        shaToUse,
        customCommitMsg || `Update debet records [${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU')}]`
      );

      const now = new Date().toISOString();
      setCurrentSha(res.sha);
      setLastSyncTime(now);
      setHasUnsavedChanges(false);
      setSyncStatus('synced');
      updateSettings({ lastSyncTime: now, lastSha: res.sha });

      return { success: true };
    } catch (err) {
      console.error('Error syncing to GitHub:', err);
      setSyncStatus('error');
      setSyncError(err.message);
      return { success: false, error: err.message };
    }
  }, [settings, data, currentSha, updateSettings]);

  // Pull from GitHub
  const pullFromGitHub = useCallback(async () => {
    if (!settings.token) {
      setSyncStatus('no_token');
      return { success: false, error: 'Токен GitHub не настроен' };
    }

    setSyncStatus('syncing');
    setSyncError(null);

    try {
      const res = await fetchRepoFile(settings.token, settings.owner, settings.repo, settings.path);
      if (res.exists && res.data) {
        setData(res.data);
        saveLocalData(res.data);
        setCurrentSha(res.sha);
        const now = new Date().toISOString();
        setLastSyncTime(now);
        setHasUnsavedChanges(false);
        setSyncStatus('synced');
        updateSettings({ lastSyncTime: now, lastSha: res.sha });
        return { success: true, loaded: true };
      } else {
        // File doesn't exist yet on GitHub, push current initial data
        await pushToGitHub('Initial commit of debet data structure');
        return { success: true, created: true };
      }
    } catch (err) {
      console.error('Error pulling from GitHub:', err);
      setSyncStatus('error');
      setSyncError(err.message);
      return { success: false, error: err.message };
    }
  }, [settings, pushToGitHub, updateSettings]);

  // Auto-sync on startup if token exists
  useEffect(() => {
    if (settings.token && settings.autoSync) {
      pullFromGitHub();
    } else if (!settings.token) {
      setSyncStatus('no_token');
    }
  }, []); // on mount only

  // --- CRUD: Suppliers ---
  const addSupplier = useCallback((name, initialBalance = 0, notes = '') => {
    const newSup = {
      id: 'sup-' + Date.now(),
      name: name.trim(),
      initialBalance: parseFloat(initialBalance) || 0,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };
    updateData((prev) => ({
      ...prev,
      suppliers: [...prev.suppliers, newSup],
    }));
    return newSup;
  }, [updateData]);

  const updateSupplier = useCallback((id, updates) => {
    updateData((prev) => ({
      ...prev,
      suppliers: prev.suppliers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, [updateData]);

  const deleteSupplier = useCallback((id) => {
    updateData((prev) => ({
      ...prev,
      suppliers: prev.suppliers.filter((s) => s.id !== id),
      supplierTransactions: prev.supplierTransactions.filter((t) => t.supplierId !== id),
    }));
  }, [updateData]);

  // --- CRUD: Supplier Transactions (Purchases / Payments) ---
  const addSupplierTransaction = useCallback(({ supplierId, type, article = '', description = '', amount, date, carOrderId = null, note = '' }) => {
    const newTx = {
      id: 'stx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      supplierId,
      type, // 'item' (закупка детали) or 'payment' (оплата поставщику)
      article: article.trim(),
      description: description.trim(),
      amount: parseFloat(amount) || 0,
      date: date || new Date().toISOString().split('T')[0],
      carOrderId,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };

    updateData((prev) => ({
      ...prev,
      supplierTransactions: [newTx, ...prev.supplierTransactions],
    }));
    return newTx;
  }, [updateData]);

  const updateSupplierTransaction = useCallback((id, updates) => {
    updateData((prev) => ({
      ...prev,
      supplierTransactions: prev.supplierTransactions.map((t) =>
        t.id === id ? { ...t, ...updates, amount: updates.amount !== undefined ? parseFloat(updates.amount) || 0 : t.amount } : t
      ),
    }));
  }, [updateData]);

  const deleteSupplierTransaction = useCallback((id) => {
    updateData((prev) => ({
      ...prev,
      supplierTransactions: prev.supplierTransactions.filter((t) => t.id !== id),
    }));
  }, [updateData]);

  // Calculations for Supplier
  const getSupplierStats = useCallback((supplierId) => {
    const supplier = data.suppliers.find((s) => s.id === supplierId);
    if (!supplier) return null;

    const txs = data.supplierTransactions
      .filter((t) => t.supplierId === supplierId)
      // Sort oldest to newest for ledger balance
      .sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt) || (a.createdAt > b.createdAt ? 1 : -1));

    let runningDebt = supplier.initialBalance || 0;
    const timeline = txs.map((tx) => {
      if (tx.type === 'item') {
        runningDebt += tx.amount;
      } else if (tx.type === 'payment') {
        runningDebt -= tx.amount;
      }
      return {
        ...tx,
        runningDebt,
      };
    });

    const totalItems = txs.filter((t) => t.type === 'item').reduce((sum, t) => sum + t.amount, 0);
    const totalPayments = txs.filter((t) => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0);
    const currentDebt = (supplier.initialBalance || 0) + totalItems - totalPayments;

    return {
      supplier,
      initialBalance: supplier.initialBalance || 0,
      totalItems,
      totalPayments,
      currentDebt,
      timeline: timeline.reverse(), // latest first for display
      rawItemsCount: txs.filter((t) => t.type === 'item').length,
      rawPaymentsCount: txs.filter((t) => t.type === 'payment').length,
    };
  }, [data.suppliers, data.supplierTransactions]);

  // --- CRUD: Car Orders (Учет по автомобилям) ---
  const addCarOrder = useCallback(({ carModel, clientName = '', licensePlate = '', status = 'in_progress', notes = '' }) => {
    const newOrder = {
      id: 'car-' + Date.now(),
      carModel: carModel.trim(),
      clientName: clientName.trim(),
      licensePlate: licensePlate.trim(),
      status, // 'in_progress' | 'waiting_payment' | 'completed'
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };
    updateData((prev) => ({
      ...prev,
      carOrders: [newOrder, ...prev.carOrders],
    }));
    return newOrder;
  }, [updateData]);

  const updateCarOrder = useCallback((id, updates) => {
    updateData((prev) => ({
      ...prev,
      carOrders: prev.carOrders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    }));
  }, [updateData]);

  const deleteCarOrder = useCallback((id) => {
    updateData((prev) => ({
      ...prev,
      carOrders: prev.carOrders.filter((o) => o.id !== id),
      carItems: prev.carItems.filter((i) => i.carOrderId !== id),
      carPayments: prev.carPayments.filter((p) => p.carOrderId !== id),
    }));
  }, [updateData]);

  // Car Items
  const addCarItem = useCallback(({ carOrderId, name, article = '', purchasePrice = 0, salePrice = 0, supplierId = null }) => {
    const newItem = {
      id: 'ci-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      carOrderId,
      name: name.trim(),
      article: article.trim(),
      purchasePrice: parseFloat(purchasePrice) || 0,
      salePrice: parseFloat(salePrice) || 0,
      supplierId,
      createdAt: new Date().toISOString(),
    };
    updateData((prev) => ({
      ...prev,
      carItems: [...prev.carItems, newItem],
    }));
    return newItem;
  }, [updateData]);

  const updateCarItem = useCallback((id, updates) => {
    updateData((prev) => ({
      ...prev,
      carItems: prev.carItems.map((i) =>
        i.id === id
          ? {
              ...i,
              ...updates,
              purchasePrice: updates.purchasePrice !== undefined ? parseFloat(updates.purchasePrice) || 0 : i.purchasePrice,
              salePrice: updates.salePrice !== undefined ? parseFloat(updates.salePrice) || 0 : i.salePrice,
            }
          : i
      ),
    }));
  }, [updateData]);

  const deleteCarItem = useCallback((id) => {
    updateData((prev) => ({
      ...prev,
      carItems: prev.carItems.filter((i) => i.id !== id),
    }));
  }, [updateData]);

  // Car Client Payments
  const addCarPayment = useCallback(({ carOrderId, amount, date, note = '' }) => {
    const newPmt = {
      id: 'cp-' + Date.now(),
      carOrderId,
      amount: parseFloat(amount) || 0,
      date: date || new Date().toISOString().split('T')[0],
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };
    updateData((prev) => ({
      ...prev,
      carPayments: [newPmt, ...prev.carPayments],
    }));
    return newPmt;
  }, [updateData]);

  const deleteCarPayment = useCallback((id) => {
    updateData((prev) => ({
      ...prev,
      carPayments: prev.carPayments.filter((p) => p.id !== id),
    }));
  }, [updateData]);

  // Calculation for Car Order
  const getCarOrderStats = useCallback((orderId) => {
    const order = data.carOrders.find((o) => o.id === orderId);
    if (!order) return null;

    const items = data.carItems.filter((i) => i.carOrderId === orderId);
    const payments = data.carPayments.filter((p) => p.carOrderId === orderId);

    const totalPurchase = items.reduce((sum, i) => sum + (i.purchasePrice || 0), 0);
    const totalSale = items.reduce((sum, i) => sum + (i.salePrice || 0), 0);
    const margin = totalSale - totalPurchase;
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const clientDebt = totalSale - totalPaid;

    return {
      order,
      items,
      payments,
      totalPurchase,
      totalSale,
      margin,
      totalPaid,
      clientDebt,
    };
  }, [data.carOrders, data.carItems, data.carPayments]);

  // --- CRUD: Other Counterparties («Другие») ---
  const addOtherCounterparty = useCallback(({ name, phone = '', notes = '' }) => {
    const newP = {
      id: 'oth-' + Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };
    updateData((prev) => ({
      ...prev,
      otherCounterparties: [...prev.otherCounterparties, newP],
    }));
    return newP;
  }, [updateData]);

  const updateOtherCounterparty = useCallback((id, updates) => {
    updateData((prev) => ({
      ...prev,
      otherCounterparties: prev.otherCounterparties.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, [updateData]);

  const deleteOtherCounterparty = useCallback((id) => {
    updateData((prev) => ({
      ...prev,
      otherCounterparties: prev.otherCounterparties.filter((p) => p.id !== id),
      otherTransactions: prev.otherTransactions.filter((t) => t.counterpartyId !== id),
    }));
  }, [updateData]);

  const addOtherTransaction = useCallback(({ counterpartyId, amount, note = '', date }) => {
    const newTx = {
      id: 'otx-' + Date.now(),
      counterpartyId,
      amount: parseFloat(amount) || 0, // positive = debt, negative = payment
      note: note.trim(),
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    updateData((prev) => ({
      ...prev,
      otherTransactions: [newTx, ...prev.otherTransactions],
    }));
    return newTx;
  }, [updateData]);

  const deleteOtherTransaction = useCallback((id) => {
    updateData((prev) => ({
      ...prev,
      otherTransactions: prev.otherTransactions.filter((t) => t.id !== id),
    }));
  }, [updateData]);

  const getOtherCounterpartyStats = useCallback((counterpartyId) => {
    const p = data.otherCounterparties.find((item) => item.id === counterpartyId);
    if (!p) return null;
    const txs = data.otherTransactions.filter((t) => t.counterpartyId === counterpartyId);
    const balance = txs.reduce((sum, t) => sum + (t.amount || 0), 0);
    return {
      person: p,
      transactions: txs,
      balance,
    };
  }, [data.otherCounterparties, data.otherTransactions]);

  // --- Global Summary Stats ---
  const globalSummary = useMemo(() => {
    let totalSupplierDebt = 0;
    data.suppliers.forEach((s) => {
      const stats = getSupplierStats(s.id);
      if (stats) totalSupplierDebt += stats.currentDebt;
    });

    let totalClientDebt = 0;
    let totalCarMargin = 0;
    data.carOrders.forEach((o) => {
      const stats = getCarOrderStats(o.id);
      if (stats) {
        totalClientDebt += stats.clientDebt;
        totalCarMargin += stats.margin;
      }
    });

    let totalOtherBalance = 0;
    data.otherCounterparties.forEach((p) => {
      const stats = getOtherCounterpartyStats(p.id);
      if (stats) totalOtherBalance += stats.balance;
    });

    // Grand total formula matching Excel 'Другие'!B15
    const grandBalance = totalSupplierDebt + totalOtherBalance;

    return {
      totalSupplierDebt,
      totalClientDebt,
      totalOtherBalance,
      totalCarMargin,
      grandBalance,
      suppliersCount: data.suppliers.length,
      activeOrdersCount: data.carOrders.filter((o) => o.status !== 'completed').length,
      totalItemsCount: data.supplierTransactions.filter((t) => t.type === 'item').length,
    };
  }, [data, getSupplierStats, getCarOrderStats, getOtherCounterpartyStats]);

  // --- Export to Excel (.xlsx) ---
  const exportToExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();

    // 1. Summary Sheet
    const summaryData = [
      ['Отчет Debet.auto', new Date().toLocaleString('ru-RU')],
      [],
      ['Показатель', 'Сумма (руб)'],
      ['Общий долг перед поставщиками', globalSummary.totalSupplierDebt],
      ['Задолженность клиентов (авто)', globalSummary.totalClientDebt],
      ['Взаиморасчеты с физлицами', globalSummary.totalOtherBalance],
      ['Общий сводный баланс', globalSummary.grandBalance],
      [],
      ['Поставщик', 'Начальный долг', 'Закупки', 'Оплаты', 'Текущий долг'],
    ];

    data.suppliers.forEach((s) => {
      const st = getSupplierStats(s.id);
      summaryData.push([s.name, st.initialBalance, st.totalItems, st.totalPayments, st.currentDebt]);
    });

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Сводка');

    // 2. Sheets for each Supplier
    data.suppliers.forEach((s) => {
      const st = getSupplierStats(s.id);
      const rows = [
        ['Поставщик:', s.name],
        ['Начало:', st.initialBalance, 'Остаток долга:', st.currentDebt],
        [],
        ['Дата', 'Тип', 'Артикул', 'Наименование', 'Цена (закупка)', 'Оплата', 'Текущий долг'],
      ];

      const chronological = [...st.timeline].reverse();
      chronological.forEach((t) => {
        rows.push([
          t.date,
          t.type === 'item' ? 'Закупка' : 'Оплата',
          t.article || '',
          t.description || '',
          t.type === 'item' ? t.amount : '',
          t.type === 'payment' ? t.amount : '',
          t.runningDebt,
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const safeName = s.name.substring(0, 30).replace(/[:\\/?*\[\]]/g, '_');
      XLSX.utils.book_append_sheet(wb, ws, safeName);
    });

    // 3. Sheet for Car Orders
    const carRows = [
      ['Автомобиль', 'Клиент', 'Госномер', 'Статус', 'Себестоимость', 'Цена продажи', 'Маржа', 'Оплачено', 'Долг клиента'],
    ];
    data.carOrders.forEach((o) => {
      const st = getCarOrderStats(o.id);
      carRows.push([
        o.carModel,
        o.clientName,
        o.licensePlate,
        o.status === 'in_progress' ? 'В работе' : o.status === 'waiting_payment' ? 'Ожидает оплаты' : 'Закрыт',
        st.totalPurchase,
        st.totalSale,
        st.margin,
        st.totalPaid,
        st.clientDebt,
      ]);
    });
    const wsCars = XLSX.utils.aoa_to_sheet(carRows);
    XLSX.utils.book_append_sheet(wb, wsCars, 'Заказы авто');

    // 4. Sheet for Other Counterparties
    const otherRows = [['Контрагент', 'Телефон', 'Баланс']];
    data.otherCounterparties.forEach((p) => {
      const st = getOtherCounterpartyStats(p.id);
      otherRows.push([p.name, p.phone, st.balance]);
    });
    const wsOther = XLSX.utils.aoa_to_sheet(otherRows);
    XLSX.utils.book_append_sheet(wb, wsOther, 'Другие');

    const fileName = `Debet_Auto_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }, [data, globalSummary, getSupplierStats, getCarOrderStats, getOtherCounterpartyStats]);

  // --- Export / Import JSON Backup ---
  const exportJsonBackup = useCallback(() => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debet_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importJsonBackup = useCallback((jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.suppliers) {
        throw new Error('Некорректный формат файла резервной копии');
      }
      updateData(parsed);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [updateData]);

  const value = {
    data,
    settings,
    updateSettings,
    syncStatus,
    syncError,
    lastSyncTime,
    hasUnsavedChanges,
    pushToGitHub,
    pullFromGitHub,
    // Suppliers
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addSupplierTransaction,
    updateSupplierTransaction,
    deleteSupplierTransaction,
    getSupplierStats,
    // Car Orders
    addCarOrder,
    updateCarOrder,
    deleteCarOrder,
    addCarItem,
    updateCarItem,
    deleteCarItem,
    addCarPayment,
    deleteCarPayment,
    getCarOrderStats,
    // Other Counterparties
    addOtherCounterparty,
    updateOtherCounterparty,
    deleteOtherCounterparty,
    addOtherTransaction,
    deleteOtherTransaction,
    getOtherCounterpartyStats,
    // Global Summary & Tools
    globalSummary,
    exportToExcel,
    exportJsonBackup,
    importJsonBackup,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
