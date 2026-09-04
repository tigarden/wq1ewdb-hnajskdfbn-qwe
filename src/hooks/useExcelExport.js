// Lazy-loaded Excel export and import utility using dynamic import('xlsx')
// Prevents heavy XLSX library from slowing down initial page render

export async function exportToExcel(data, getClientStats, incomeStats) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  // 1. Sheet: Clients Summary & Balances
  const clientsData = (data.clients || []).map((cli) => {
    const stats = getClientStats ? getClientStats(cli.id) : null;
    return {
      'ID Клиента': cli.id,
      'Имя / Контакт': cli.name,
      'Телефон': cli.phone || '',
      'Автомобиль': cli.car || '',
      'Начальный долг ($)': cli.initialBalance || 0,
      'Сумма запчастей ($)': stats?.totalItems || 0,
      'Сумма оплат ($)': stats?.totalPayments || 0,
      'Текущий долг ($)': stats?.currentDebt || 0,
      'Заметок': cli.notes || '',
    };
  });
  const wsClients = XLSX.utils.json_to_sheet(clientsData);
  XLSX.utils.book_append_sheet(wb, wsClients, 'Клиенты');

  // 2. Sheet: Parts and Transactions
  const txData = (data.clientTransactions || []).map((t) => {
    const cli = (data.clients || []).find((c) => c.id === t.clientId);
    return {
      'ID': t.id,
      'Дата': t.date || '',
      'Клиент': cli?.name || t.clientId,
      'Тип': t.type === 'item' ? 'Запчасть' : 'Оплата',
      'Артикул': t.article || '',
      'Наименование': t.description || '',
      'Автомобиль': t.carName || '',
      'Поставщик': t.supplierName || '',
      'Сумма клиенту ($)': t.amount || 0,
      'Закупка ($)': t.purchasePrice || 0,
      'Примечание': t.note || '',
    };
  });
  const wsTx = XLSX.utils.json_to_sheet(txData);
  XLSX.utils.book_append_sheet(wb, wsTx, 'Запчасти и Платежи');

  // 3. Sheet: Suppliers
  const otherData = (data.otherCounterparties || []).map((p) => {
    const txs = (data.otherTransactions || []).filter((ot) => ot.counterpartyId === p.id);
    const balance = txs.reduce((sum, ot) => sum + (parseFloat(ot.amount) || 0), 0);
    return {
      'ID': p.id,
      'Поставщик': p.name,
      'Телефон': p.phone || '',
      'Баланс (₴)': balance,
      'Заметки': p.notes || '',
    };
  });
  const wsOther = XLSX.utils.json_to_sheet(otherData);
  XLSX.utils.book_append_sheet(wb, wsOther, 'Поставщики');

  // Write and download
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Debet_Auto_Export_${dateStr}.xlsx`);
}
