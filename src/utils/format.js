// Common formatting utilities for Debet.auto

export function formatMoney(val, currency = 'грн') {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0;
  const formatted = num.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('ru-RU');
  } catch {
    return dateString;
  }
}

export function pluralize(number, [one, few, many]) {
  const n = Math.abs(number) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return `${number} ${many}`;
  if (n1 > 1 && n1 < 5) return `${number} ${few}`;
  if (n1 === 1) return `${number} ${one}`;
  return `${number} ${many}`;
}
