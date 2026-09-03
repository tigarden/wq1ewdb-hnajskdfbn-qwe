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

// Initial clean structure with user's core clients
export const INITIAL_DATA = {
  version: 2,
  updatedAt: new Date().toISOString(),
  clients: [
    { id: 'cli-1', name: 'Тотус', initialBalance: 0, notes: '', createdAt: new Date().toISOString() },
    { id: 'cli-2', name: 'Тотус 2', initialBalance: 0, notes: '', createdAt: new Date().toISOString() },
    { id: 'cli-3', name: 'Эрик', initialBalance: 0, notes: 'Привязка к авто (опционально)', createdAt: new Date().toISOString() },
    { id: 'cli-4', name: 'Витя', initialBalance: 0, notes: 'Привязка к авто (опционально)', createdAt: new Date().toISOString() },
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
    if (!raw) {
      // Check if v1 existed and migrate
      const v1Raw = localStorage.getItem('debet_auto_data_v1');
      if (v1Raw) {
        try {
          const v1 = JSON.parse(v1Raw);
          return {
            ...INITIAL_DATA,
            clients: v1.suppliers ? v1.suppliers.map(s => ({
              ...s,
              name: s.name === 'Эрнест' ? 'Эрик' : s.name
            })) : INITIAL_DATA.clients,
            clientTransactions: v1.supplierTransactions ? v1.supplierTransactions.map(t => ({
              ...t,
              clientId: t.supplierId
            })) : [],
            otherCounterparties: v1.otherCounterparties || INITIAL_DATA.otherCounterparties,
            otherTransactions: v1.otherTransactions || [],
          };
        } catch (err) {}
      }
      return INITIAL_DATA;
    }
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
