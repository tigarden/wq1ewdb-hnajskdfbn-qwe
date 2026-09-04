// Client service for interacting with the Debet.auto PostgreSQL / FastAPI Backend

const API_URL_KEY = 'debet_backend_api_url';
const API_TOKEN_KEY = 'debet_backend_api_token';

// If running in browser and NOT localhost, don't default to localhost
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const DEFAULT_API_URL = import.meta.env?.VITE_API_URL || (isLocalhost ? 'http://localhost:8000/api' : '');

export function getApiUrl() {
  const saved = localStorage.getItem(API_URL_KEY);
  if (saved !== null) return saved;
  return DEFAULT_API_URL;
}

export function setApiUrl(url) {
  const clean = (url || '').trim().replace(/\/$/, '');
  localStorage.setItem(API_URL_KEY, clean);
  return clean;
}

export function getApiToken() {
  return localStorage.getItem(API_TOKEN_KEY) || '';
}

export function setApiToken(token) {
  if (token) {
    localStorage.setItem(API_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(API_TOKEN_KEY);
  }
}

async function request(endpoint, options = {}) {
  const baseUrl = getApiUrl();
  if (!baseUrl) {
    throw new Error('API URL не настроен');
  }

  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const token = getApiToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      if (res.status === 401) {
        setApiToken('');
      }
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `HTTP Error ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Healthcheck & Database info
  async checkHealth() {
    const baseUrl = getApiUrl();
    if (!baseUrl) {
      return { success: false, notConfigured: true, error: 'Сервер API не подключен' };
    }
    try {
      const data = await request('/health');
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Auth & 2FA
  async login(password, totp_code, remember_days = 7) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password, totp_code, remember_days }),
    });
    if (res.access_token) {
      setApiToken(res.access_token);
    }
    return res;
  },

  async getTotpSetup() {
    return await request('/auth/totp/setup');
  },

  async enableTotp(secret, code) {
    return await request('/auth/totp/enable', {
      method: 'POST',
      body: JSON.stringify({ secret, code }),
    });
  },

  async disableTotp() {
    return await request('/auth/totp/disable', {
      method: 'POST',
    });
  },

  async changePassword(old_password, new_password) {
    return await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password, new_password }),
    });
  },

  // Clients
  async getClients() {
    return await request('/clients');
  },

  async createClient(clientData) {
    return await request('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  },

  async updateClient(id, updates) {
    return await request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteClient(id) {
    return await request(`/clients/${id}`, {
      method: 'DELETE',
    });
  },

  // Transactions
  async getTransactions(clientId, type) {
    const params = new URLSearchParams();
    if (clientId) params.append('client_id', clientId);
    if (type) params.append('type', type);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await request(`/transactions${query}`);
  },

  async createTransaction(txData) {
    return await request('/transactions', {
      method: 'POST',
      body: JSON.stringify(txData),
    });
  },

  async updateTransaction(id, updates) {
    return await request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteTransaction(id) {
    return await request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  // Suppliers
  async getSuppliers() {
    return await request('/suppliers');
  },

  async addSupplier(name) {
    return await request('/suppliers', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  // Other Counterparties & Transactions
  async getOtherCounterparties() {
    return await request('/other-counterparties');
  },

  async createOtherCounterparty(data) {
    return await request('/other-counterparties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteOtherCounterparty(id) {
    return await request(`/other-counterparties/${id}`, {
      method: 'DELETE',
    });
  },

  async getOtherTransactions() {
    return await request('/other-transactions');
  },

  async createOtherTransaction(data) {
    return await request('/other-transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteOtherTransaction(id) {
    return await request(`/other-transactions/${id}`, {
      method: 'DELETE',
    });
  },

  // Full Database Sync & Backup
  async exportBackup() {
    return await request('/backup/export');
  },

  async importBackup(fullData) {
    return await request('/backup/import', {
      method: 'POST',
      body: JSON.stringify(fullData),
    });
  },
};
