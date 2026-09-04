import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { loadLocalData, saveLocalData, INITIAL_DATA } from '../services/storage';
import { AuthProvider, useAuth } from './AuthContext';
import { SyncProvider, useSync } from './SyncContext';
import { exportToExcel } from '../hooks/useExcelExport';

const DataContext = createContext(null);

function round2(num) {
  return Math.round((Number(num) || 0) * 100) / 100;
}

export function DataProviderInternal({ children }) {
  const [data, setData] = useState(() => loadLocalData());
  const auth = useAuth();

  // Save to local storage on changes
  useEffect(() => {
    saveLocalData(data);
  }, [data]);

  // Handle external data updates (from PostgreSQL, Supabase, or GitHub)
  const handleDataUpdated = useCallback((newData) => {
    if (newData && typeof newData === 'object') {
      setData((prev) => {
        const merged = {
          ...prev,
          ...newData,
          updatedAt: new Date().toISOString(),
        };
        saveLocalData(merged);
        return merged;
      });
    }
  }, []);

  // --- Clients CRUD ---
  const addClient = useCallback((clientData) => {
    const newClient = {
      id: clientData.id || `cli-${Date.now().toString(36)}`,
      name: clientData.name.trim(),
      phone: (clientData.phone || '').trim(),
      car: (clientData.car || '').trim(),
      initialBalance: round2(clientData.initialBalance || 0),
      notes: (clientData.notes || '').trim(),
      createdAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      clients: [...(prev.clients || []), newClient],
    }));
    return newClient;
  }, []);

  const updateClient = useCallback((id, updates) => {
    setData((prev) => ({
      ...prev,
      clients: (prev.clients || []).map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          ...updates,
          name: updates.name !== undefined ? updates.name.trim() : c.name,
          phone: updates.phone !== undefined ? updates.phone.trim() : c.phone,
          car: updates.car !== undefined ? updates.car.trim() : c.car,
          initialBalance:
            updates.initialBalance !== undefined
              ? round2(updates.initialBalance)
              : c.initialBalance,
          notes: updates.notes !== undefined ? updates.notes.trim() : c.notes,
        };
      }),
    }));
  }, []);

  const deleteClient = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      clients: (prev.clients || []).filter((c) => c.id !== id),
      clientTransactions: (prev.clientTransactions || []).filter((t) => t.clientId !== id),
    }));
  }, []);

  // --- Client Transactions CRUD ---
  const addClientTransaction = useCallback((txData) => {
    const newTx = {
      id: txData.id || `ctx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      clientId: txData.clientId,
      type: txData.type, // 'item' or 'payment'
      article: (txData.article || '').trim().toUpperCase(),
      description: (txData.description || '').trim(),
      carName: (txData.carName || '').trim(),
      supplierName: (txData.supplierName || '').trim(),
      amount: round2(txData.amount || 0),
      purchasePrice: round2(txData.purchasePrice || 0),
      date: txData.date || new Date().toISOString().split('T')[0],
      note: (txData.note || '').trim(),
      createdAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      clientTransactions: [newTx, ...(prev.clientTransactions || [])],
    }));
    return newTx;
  }, []);

  const updateClientTransaction = useCallback((id, updates) => {
    setData((prev) => ({
      ...prev,
      clientTransactions: (prev.clientTransactions || []).map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          ...updates,
          article: updates.article !== undefined ? updates.article.trim().toUpperCase() : t.article,
          amount: updates.amount !== undefined ? round2(updates.amount) : t.amount,
          purchasePrice:
            updates.purchasePrice !== undefined
              ? round2(updates.purchasePrice)
              : t.purchasePrice,
        };
      }),
    }));
  }, []);

  const deleteClientTransaction = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      clientTransactions: (prev.clientTransactions || []).filter((t) => t.id !== id),
    }));
  }, []);

  const updateItemPurchasePrice = useCallback((txId, purchasePrice, supplierName) => {
    setData((prev) => ({
      ...prev,
      clientTransactions: (prev.clientTransactions || []).map((t) => {
        if (t.id !== txId) return t;
        return {
          ...t,
          purchasePrice: round2(purchasePrice),
          supplierName:
            supplierName !== undefined ? supplierName.trim() : t.supplierName,
        };
      }),
    }));
  }, []);

  // --- Suppliers Directory ---
  const addSupplierToDirectory = useCallback((supplierName) => {
    const clean = (supplierName || '').trim();
    if (!clean) return;
    setData((prev) => {
      const list = prev.suppliersList || [];
      if (list.some((s) => s.toLowerCase() === clean.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        suppliersList: [...list, clean],
      };
    });
  }, []);

  // --- Other Counterparties CRUD ---
  const addOtherCounterparty = useCallback((cpData) => {
    const newCp = {
      id: cpData.id || `oth-${Date.now().toString(36)}`,
      name: cpData.name.trim(),
      phone: (cpData.phone || '').trim(),
      notes: (cpData.notes || '').trim(),
      createdAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      otherCounterparties: [...(prev.otherCounterparties || []), newCp],
    }));
    return newCp;
  }, []);

  const deleteOtherCounterparty = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      otherCounterparties: (prev.otherCounterparties || []).filter((p) => p.id !== id),
      otherTransactions: (prev.otherTransactions || []).filter((ot) => ot.counterpartyId !== id),
    }));
  }, []);

  const addOtherTransaction = useCallback((txData) => {
    const newTx = {
      id: txData.id || `otx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      counterpartyId: txData.counterpartyId,
      amount: round2(txData.amount || 0),
      note: (txData.note || '').trim(),
      date: txData.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      otherTransactions: [newTx, ...(prev.otherTransactions || [])],
    }));
    return newTx;
  }, []);

  const deleteOtherTransaction = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      otherTransactions: (prev.otherTransactions || []).filter((ot) => ot.id !== id),
    }));
  }, []);

  // --- Calculated Domain Stats ---
  const getClientStats = useCallback(
    (clientId) => {
      const client = (data.clients || []).find((c) => c.id === clientId);
      if (!client) return null;

      const txs = (data.clientTransactions || []).filter((t) => t.clientId === clientId);
      let totalItems = 0;
      let totalPayments = 0;
      let totalPurchase = 0;
      let itemsCount = 0;
      let paymentsCount = 0;

      txs.forEach((t) => {
        const amt = round2(t.amount || 0);
        if (t.type === 'item') {
          totalItems += amt;
          totalPurchase += round2(t.purchasePrice || 0);
          itemsCount += 1;
        } else if (t.type === 'payment') {
          totalPayments += amt;
          paymentsCount += 1;
        }
      });

      const initialDebt = round2(client.initialBalance || 0);
      const currentDebt = round2(initialDebt + totalItems - totalPayments);
      const totalMargin = round2(totalItems - totalPurchase);

      return {
        initialDebt,
        totalItems: round2(totalItems),
        totalPayments: round2(totalPayments),
        totalPurchase: round2(totalPurchase),
        currentDebt,
        totalMargin,
        itemsCount,
        paymentsCount,
        txsCount: txs.length,
      };
    },
    [data.clients, data.clientTransactions]
  );

  const globalSummary = useMemo(() => {
    let totalClientDebt = 0;
    let totalItemsSum = 0;
    let totalPaymentsSum = 0;
    let debtorsCount = 0;

    (data.clients || []).forEach((cli) => {
      const stats = getClientStats(cli.id);
      if (stats) {
        totalClientDebt += stats.currentDebt;
        totalItemsSum += stats.totalItems;
        totalPaymentsSum += stats.totalPayments;
        if (stats.currentDebt > 0) {
          debtorsCount += 1;
        }
      }
    });

    let otherSettlementsSum = 0;
    (data.otherTransactions || []).forEach((ot) => {
      otherSettlementsSum += round2(ot.amount || 0);
    });

    return {
      grandBalance: round2(totalClientDebt + otherSettlementsSum),
      totalClientDebt: round2(totalClientDebt),
      totalItemsSum: round2(totalItemsSum),
      totalPaymentsSum: round2(totalPaymentsSum),
      debtorsCount,
      totalClients: (data.clients || []).length,
      clientsCount: (data.clients || []).length,
      otherSettlementsSum: round2(otherSettlementsSum),
      totalOtherBalance: round2(otherSettlementsSum),
    };
  }, [data.clients, data.otherTransactions, getClientStats]);

  const incomeStats = useMemo(() => {
    let pendingPurchaseCount = 0;
    let totalFilledSales = 0;
    let totalFilledPurchase = 0;
    let totalMargin = 0;

    (data.clientTransactions || []).forEach((t) => {
      if (t.type === 'item') {
        const pPrice = round2(t.purchasePrice || 0);
        const salePrice = round2(t.amount || 0);
        if (pPrice <= 0) {
          pendingPurchaseCount += 1;
        } else {
          totalFilledSales += salePrice;
          totalFilledPurchase += pPrice;
          totalMargin += salePrice - pPrice;
        }
      }
    });

    return {
      pendingCount: pendingPurchaseCount,
      pendingPurchaseCount,
      totalFilledSales: round2(totalFilledSales),
      totalFilledPurchase: round2(totalFilledPurchase),
      totalProfit: round2(totalMargin),
      totalMargin: round2(totalMargin),
      marginPercent: totalFilledSales > 0 ? Math.round((totalMargin / totalFilledSales) * 100) : 0,
    };
  }, [data.clientTransactions]);

  const getOtherCounterpartyStats = useCallback(
    (cpId) => {
      const txs = (data.otherTransactions || []).filter((t) => t.counterpartyId === cpId);
      let balance = 0;
      txs.forEach((t) => {
        balance += round2(t.amount || 0);
      });
      return {
        balance: round2(balance),
        transactionsCount: txs.length,
        transactions: txs,
      };
    },
    [data.otherTransactions]
  );

  // --- Export / Import ---
  const handleExportToExcel = useCallback(async () => {
    return await exportToExcel(data, getClientStats, incomeStats);
  }, [data, getClientStats, incomeStats]);

  const exportJsonBackup = useCallback(() => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Debet_Auto_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importJsonBackup = useCallback((jsonData) => {
    if (!jsonData || typeof jsonData !== 'object' || Array.isArray(jsonData)) {
      return { success: false, error: 'Неверный формат: файл должен содержать объект данных' };
    }

    // Schema validation and sanitization
    const sanitized = {
      version: typeof jsonData.version === 'number' ? jsonData.version : 3,
      updatedAt: typeof jsonData.updatedAt === 'string' ? jsonData.updatedAt : new Date().toISOString(),
      clients: Array.isArray(jsonData.clients)
        ? jsonData.clients
            .map((c) => ({
              id: String(c.id || `cli-${Date.now().toString(36)}`),
              name: String(c.name || '').trim(),
              phone: String(c.phone || '').trim(),
              car: String(c.car || '').trim(),
              initialBalance: round2(c.initialBalance || 0),
              notes: String(c.notes || '').trim(),
              createdAt: c.createdAt || new Date().toISOString(),
            }))
            .filter((c) => c.name.length > 0)
        : [],
      clientTransactions: Array.isArray(jsonData.clientTransactions)
        ? jsonData.clientTransactions
            .map((t) => ({
              id: String(t.id || `ctx-${Date.now().toString(36)}`),
              clientId: String(t.clientId || ''),
              type: t.type === 'payment' ? 'payment' : 'item',
              article: String(t.article || '').trim().toUpperCase(),
              description: String(t.description || '').trim(),
              carName: String(t.carName || '').trim(),
              supplierName: String(t.supplierName || '').trim(),
              amount: round2(t.amount || 0),
              purchasePrice: round2(t.purchasePrice || 0),
              date: String(t.date || '').trim(),
              note: String(t.note || '').trim(),
              createdAt: t.createdAt || new Date().toISOString(),
            }))
            .filter((t) => t.clientId.length > 0)
        : [],
      suppliersList: Array.isArray(jsonData.suppliersList)
        ? Array.from(new Set(jsonData.suppliersList.map((s) => String(s).trim()).filter(Boolean)))
        : [],
      otherCounterparties: Array.isArray(jsonData.otherCounterparties)
        ? jsonData.otherCounterparties
            .map((p) => ({
              id: String(p.id || `oth-${Date.now().toString(36)}`),
              name: String(p.name || '').trim(),
              phone: String(p.phone || '').trim(),
              notes: String(p.notes || '').trim(),
              createdAt: p.createdAt || new Date().toISOString(),
            }))
            .filter((p) => p.name.length > 0)
        : [],
      otherTransactions: Array.isArray(jsonData.otherTransactions)
        ? jsonData.otherTransactions
            .map((ot) => ({
              id: String(ot.id || `otx-${Date.now().toString(36)}`),
              counterpartyId: String(ot.counterpartyId || ''),
              amount: round2(ot.amount || 0),
              note: String(ot.note || '').trim(),
              date: String(ot.date || '').trim(),
              createdAt: ot.createdAt || new Date().toISOString(),
            }))
            .filter((ot) => ot.counterpartyId.length > 0)
        : [],
    };

    setData(sanitized);
    saveLocalData(sanitized);
    return { success: true };
  }, []);

  return (
    <SyncProvider data={data} onDataUpdated={handleDataUpdated}>
      <DataContextConsumer
        data={data}
        setData={setData}
        auth={auth}
        addClient={addClient}
        updateClient={updateClient}
        deleteClient={deleteClient}
        addClientTransaction={addClientTransaction}
        updateClientTransaction={updateClientTransaction}
        deleteClientTransaction={deleteClientTransaction}
        updateItemPurchasePrice={updateItemPurchasePrice}
        addSupplierToDirectory={addSupplierToDirectory}
        addOtherCounterparty={addOtherCounterparty}
        deleteOtherCounterparty={deleteOtherCounterparty}
        addOtherTransaction={addOtherTransaction}
        deleteOtherTransaction={deleteOtherTransaction}
        getClientStats={getClientStats}
        globalSummary={globalSummary}
        incomeStats={incomeStats}
        getOtherCounterpartyStats={getOtherCounterpartyStats}
        exportToExcel={handleExportToExcel}
        exportJsonBackup={exportJsonBackup}
        importJsonBackup={importJsonBackup}
      >
        {children}
      </DataContextConsumer>
    </SyncProvider>
  );
}

// Intermediary consumer to merge Data, Auth, and Sync contexts
function DataContextConsumer({ children, auth, ...dataProps }) {
  const sync = useSync();

  const mergedValue = {
    ...dataProps,
    // Auth aliases
    isUnlocked: auth.isUnlocked,
    isCheckingSession: auth.isCheckingSession,
    isTotpEnabled: auth.isTotpEnabled,
    unlockApp: auth.unlockWithPassword,
    verifyTotp: auth.unlockWithTotp,
    lockApp: auth.lockApp,
    changeMasterPassword: auth.changeMasterPassword,
    getTotpSetupData: auth.getTotpSetupData,
    enableTotp: auth.enableTotp,
    disableTotp: auth.disableTotp,

    // Sync aliases
    settings: sync.settings,
    updateSettings: sync.updateSettings,
    syncStatus: sync.syncStatus,
    syncError: sync.syncError,
    lastSyncTime: sync.lastSyncTime,
    pushToGitHub: sync.pushToGitHub,
    pullFromGitHub: sync.pullFromGitHub,
    supabaseConfig: sync.supabaseConfig,
    updateSupabase: sync.updateSupabase,
    syncToSupabase: sync.syncToSupabase,
    pullFromSupabase: sync.pullFromSupabase,
    supabaseStatus: sync.supabaseStatus,
  };

  return <DataContext.Provider value={mergedValue}>{children}</DataContext.Provider>;
}

export function DataProvider({ children }) {
  return (
    <AuthProvider>
      <DataProviderInternal>{children}</DataProviderInternal>
    </AuthProvider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
