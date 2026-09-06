// Lazy-loaded Excel export and import utility using dynamic import('xlsx')
// Prevents heavy XLSX library from slowing down initial page render

export async function exportToExcel(
  data, 
  getClientStats, 
  incomeStats, 
  getOtherCounterpartyStats, 
  globalSummary
) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  // 1. Sheet: Summary financial report
  const summaryRows = [
    { 'Финансовый показатель': 'Дебиторская задолженность (долги клиентов нам)', 'Значение (грн / %)': globalSummary?.totalClientDebt ?? 0 },
    { 'Финансовый показатель': 'Кредиторская задолженность (наш долг поставщикам)', 'Значение (грн / %)': globalSummary?.totalSupplierDebt ?? 0 },
    { 'Финансовый показатель': 'Чистая расчетная позиция (Дебиторка - Кредиторка)', 'Значение (грн / %)': globalSummary?.netPosition ?? ((globalSummary?.totalClientDebt || 0) - (globalSummary?.totalSupplierDebt || 0)) },
    { 'Финансовый показатель': 'Выручка от оцененных запчастей', 'Значение (грн / %)': incomeStats?.totalRevenueWithCost ?? 0 },
    { 'Финансовый показатель': 'Себестоимость закупки запчастей', 'Значение (грн / %)': incomeStats?.totalPurchaseCost ?? 0 },
    { 'Финансовый показатель': 'Расчетная чистая прибыль', 'Значение (грн / %)': incomeStats?.totalProfit ?? 0 },
    { 'Финансовый показатель': 'Маржинальность продаж (%)', 'Значение (грн / %)': `${incomeStats?.marginPercent ?? 0}%` },
    { 'Финансовый показатель': 'Наценка на закупку (%)', 'Значение (грн / %)': `${incomeStats?.markupPercent ?? 0}%` },
    { 'Финансовый показатель': 'Позиций без указанной закупки (в очереди)', 'Значение (грн / %)': incomeStats?.pendingCount ?? 0 },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Сводный отчет');

  // 2. Sheet: Clients Summary & Balances
  const clientsData = (data.clients || []).map((cli) => {
    const stats = getClientStats ? getClientStats(cli.id) : null;
    return {
      'ID Клиента': cli.id,
      'Имя / Контакт': cli.name,
      'Телефон': cli.phone || '',
      'Автомобиль': cli.car || '',
      'Начальный долг (грн)': cli.initialBalance || 0,
      'Сумма запчастей (грн)': stats?.totalItems || 0,
      'Сумма оплат (грн)': stats?.totalPayments || 0,
      'Текущий долг (грн)': stats?.currentDebt || 0,
      'Заметки': cli.notes || '',
    };
  });
  const wsClients = XLSX.utils.json_to_sheet(clientsData);
  XLSX.utils.book_append_sheet(wb, wsClients, 'Клиенты');

  // 3. Sheet: Parts and Transactions
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
      'Сумма клиенту (грн)': t.amount || 0,
      'Закупка (грн)': t.purchasePrice || 0,
      'Прибыль (грн)': t.type === 'item' && t.purchasePrice > 0 ? (t.amount - t.purchasePrice) : '',
      'Примечание': t.note || '',
    };
  });
  const wsTx = XLSX.utils.json_to_sheet(txData);
  XLSX.utils.book_append_sheet(wb, wsTx, 'Запчасти и Платежи');

  // 4. Sheet: Suppliers
  const otherData = (data.otherCounterparties || []).map((p) => {
    const stats = getOtherCounterpartyStats ? getOtherCounterpartyStats(p.id) : null;
    return {
      'ID': p.id,
      'Поставщик': p.name,
      'Телефон': p.phone || '',
      'Закуплено запчастей (грн)': stats?.totalSuppliedParts || 0,
      'Оплачено поставщику (грн)': stats?.totalPayments || 0,
      'Текущий долг к оплате (грн)': stats?.balance || 0,
      'Заметки': p.notes || '',
    };
  });
  const wsOther = XLSX.utils.json_to_sheet(otherData);
  XLSX.utils.book_append_sheet(wb, wsOther, 'Поставщики');

  // Write and download
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Debet_Auto_Export_${dateStr}.xlsx`);
}
