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
  version: 1,
  updatedAt: new Date().toISOString(),
  suppliers: [
    { id: 'sup-1', name: 'Тотус', initialBalance: 0, createdAt: new Date().toISOString() },
    { id: 'sup-2', name: 'Эрнест', initialBalance: 0, createdAt: new Date().toISOString() },
    { id: 'sup-3', name: 'Витя', initialBalance: 0, createdAt: new Date().toISOString() },
  ],
  supplierTransactions: [],
  carOrders: [],
  carItems: [],
  carPayments: [],
  otherCounterparties: [],
  otherTransactions: [],
};

const LOCAL_STORAGE_KEY = 'debet_auto_data_v1';
const SETTINGS_STORAGE_KEY = 'debet_auto_settings_v1';

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
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
