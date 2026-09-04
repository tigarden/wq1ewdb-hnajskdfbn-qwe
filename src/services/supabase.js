// Supabase Cloud PostgreSQL Client
// Allows GitHub Pages to connect directly to a 24/7 free cloud PostgreSQL database with zero servers running on your PC.

const SUPABASE_URL_KEY = 'debet_supabase_url_v1';
const SUPABASE_KEY_KEY = 'debet_supabase_key_v1';

export function getSupabaseConfig() {
  return {
    url: localStorage.getItem(SUPABASE_URL_KEY) || '',
    key: localStorage.getItem(SUPABASE_KEY_KEY) || '',
  };
}

export function saveSupabaseConfig(url, key) {
  const cleanUrl = (url || '').trim().replace(/\/$/, '');
  const cleanKey = (key || '').trim();
  if (cleanUrl && cleanKey) {
    localStorage.setItem(SUPABASE_URL_KEY, cleanUrl);
    localStorage.setItem(SUPABASE_KEY_KEY, cleanKey);
  } else {
    localStorage.removeItem(SUPABASE_URL_KEY);
    localStorage.removeItem(SUPABASE_KEY_KEY);
  }
}

// Test connection to Supabase PostgREST
export async function testSupabase(url, key) {
  if (!url || !key) return { success: false, error: 'URL или API ключ не указан' };
  try {
    const res = await fetch(`${url}/rest/v1/?apikey=${key}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Fetch data from Supabase debet_data table
export async function fetchSupabaseData(url, key) {
  try {
    const res = await fetch(`${url}/rest/v1/debet_data?id=eq.main&select=*`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error(`Ошибка Supabase HTTP ${res.status}`);
    }
    const rows = await res.json();
    if (rows && rows.length > 0 && rows[0].data) {
      return { success: true, data: rows[0].data, updatedAt: rows[0].updated_at };
    }
    return { success: true, data: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Save data to Supabase debet_data table (Upsert)
export async function saveSupabaseData(url, key, dataObj) {
  try {
    const payload = {
      id: 'main',
      data: dataObj,
      updated_at: new Date().toISOString(),
    };

    const res = await fetch(`${url}/rest/v1/debet_data`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Ошибка сохранения: ${errText || res.statusText}`);
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
