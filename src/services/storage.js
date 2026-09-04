// Local storage and settings service

export const DEFAULT_SETTINGS = {
  token: '',
  owner: 'tigarden',
  repo: 'wq1ewdb-hnajskdfbn-qwe',
  path: 'data/debet-data.json',
  autoSync: true,
  lastSyncTime: null,
  lastSha: null,
};

export const INITIAL_DATA = {
  version: 3,
  updatedAt: new Date().toISOString(),
  clients: [
    { id: 'cli-1', name: 'Тотус', phone: '', car: '', initialBalance: 0, notes: '', createdAt: new Date().toISOString() },
    { id: 'cli-2', name: 'Тотус 2', phone: '', car: '', initialBalance: 0, notes: '', createdAt: new Date().toISOString() },
    { id: 'cli-3', name: 'Эрик', phone: '', car: 'Range Rover / Chery', initialBalance: 0, notes: '', createdAt: new Date().toISOString() },
    { id: 'cli-4', name: 'Витя', phone: '', car: 'Passat / Vito', initialBalance: 0, notes: '', createdAt: new Date().toISOString() },
  ],
  clientTransactions: [],
  suppliersList: ['Склад', 'Партс-Трейд', 'Автодок', 'Одесса'],
  otherCounterparties: [
    { id: 'oth-1', name: 'Махмуд', phone: '', notes: '', createdAt: new Date().toISOString() },
    { id: 'oth-2', name: 'Ваня ОД2', phone: '', notes: '', createdAt: new Date().toISOString() },
    { id: 'oth-3', name: 'Саня', phone: '', notes: '', createdAt: new Date().toISOString() },
  ],
  otherTransactions: [],
};

const LOCAL_STORAGE_KEY = 'debet_auto_data_v2';
const SETTINGS_STORAGE_KEY = 'debet_auto_settings_v1';
const TOKEN_PREFIX = 'enc_tk:';

function maskToken(str) {
  if (!str) return '';
  try {
    return TOKEN_PREFIX + btoa(encodeURIComponent(str).split('').reverse().join(''));
  } catch {
    return str;
  }
}

function unmaskToken(str) {
  if (!str) return '';
  if (!str.startsWith(TOKEN_PREFIX)) return str;
  try {
    return decodeURIComponent(atob(str.slice(TOKEN_PREFIX.length)).split('').reverse().join(''));
  } catch {
    return '';
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      token: unmaskToken(parsed.token || ''),
    };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  try {
    const safe = {
      ...settings,
      token: maskToken(settings.token || ''),
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(safe));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadLocalData() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return INITIAL_DATA;
    const data = JSON.parse(raw);
    return {
      ...INITIAL_DATA,
      ...data,
      clients: (data.clients || INITIAL_DATA.clients).map(c => ({
        ...c,
        phone: c.phone || '',
        car: c.car || '',
      })),
      clientTransactions: (data.clientTransactions || []).map(t => ({
        ...t,
        purchasePrice: t.purchasePrice !== undefined ? parseFloat(t.purchasePrice) || 0 : 0,
      })),
    };
  } catch (e) {
    console.error('Failed to load local data:', e);
    return INITIAL_DATA;
  }
}

export function saveLocalData(data) {
  try {
    const enriched = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(enriched));
    return enriched;
  } catch (e) {
    console.error('Failed to save local data:', e);
    return data;
  }
}
