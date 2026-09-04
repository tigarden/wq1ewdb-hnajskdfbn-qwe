// Supabase Cloud PostgreSQL Client
// Configured for 24/7 cloud persistence directly from GitHub Pages without running any PC.

const SUPABASE_URL_KEY = 'debet_supabase_url_v1';
const SUPABASE_KEY_KEY = 'debet_supabase_key_v1';

// Default project credentials configured for Debet.auto
export const DEFAULT_SUPABASE_URL = 'https://dhvbyvqqqvayfxqsmovn.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_gxkplchBGLUZXd9yt7D5iA_uPmaC_kP';

export function sanitizeSupabaseUrl(url) {
  if (!url) return '';
  let clean = url.trim().replace(/\/+$/, '');
  clean = clean.replace(/\/rest\/v1\/?$/i, '');
  clean = clean.replace(/\/+$/, '');
  return clean;
}

export function getSupabaseConfig() {
  const savedUrl = localStorage.getItem(SUPABASE_URL_KEY);
  const savedKey = localStorage.getItem(SUPABASE_KEY_KEY);
  return {
    url: sanitizeSupabaseUrl(savedUrl || DEFAULT_SUPABASE_URL),
    key: savedKey || DEFAULT_SUPABASE_KEY,
  };
}

export function saveSupabaseConfig(url, key) {
  const cleanUrl = sanitizeSupabaseUrl(url);
  const cleanKey = (key || '').trim();
  if (cleanUrl && cleanKey) {
    localStorage.setItem(SUPABASE_URL_KEY, cleanUrl);
    localStorage.setItem(SUPABASE_KEY_KEY, cleanKey);
  } else {
    localStorage.removeItem(SUPABASE_URL_KEY);
    localStorage.removeItem(SUPABASE_KEY_KEY);
  }
}

function getHeaders(key) {
  const headers = {
    apikey: key,
    'Content-Type': 'application/json',
  };
  // If it is a JWT token (starts with eyJ), include Authorization Bearer
  if (key && key.startsWith('eyJ')) {
    headers['Authorization'] = `Bearer ${key}`;
  }
  return headers;
}

// Test connection to Supabase PostgREST table
export async function testSupabase(rawUrl, key) {
  const url = sanitizeSupabaseUrl(rawUrl);
  if (!url || !key) return { success: false, error: 'URL или API ключ не указан' };

  try {
    const res = await fetch(`${url}/rest/v1/debet_data?select=id&limit=1`, {
      headers: getHeaders(key),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return { success: false, error: `HTTP ${res.status}: ${errText || res.statusText}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Fetch data from Supabase debet_data table
export async function fetchSupabaseData(rawUrl, key) {
  const url = sanitizeSupabaseUrl(rawUrl);
  try {
    const res = await fetch(`${url}/rest/v1/debet_data?id=eq.main&select=*`, {
      headers: getHeaders(key),
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
export async function saveSupabaseData(rawUrl, key, dataObj) {
  const url = sanitizeSupabaseUrl(rawUrl);
  try {
    const payload = {
      id: 'main',
      data: dataObj,
      updated_at: new Date().toISOString(),
    };

    const res = await fetch(`${url}/rest/v1/debet_data`, {
      method: 'POST',
      headers: {
        ...getHeaders(key),
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
