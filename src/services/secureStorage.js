// Secure Client Storage Service using Web Crypto API
// Protects session tokens, TOTP secrets, and passwords without plaintext leaks.

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_STORAGE_KEY = 'debet_sec_session_v2';
const PASS_HASH_KEY = 'debet_sec_phash_v2';
const PASS_SALT_KEY = 'debet_sec_psalt_v2';
const TOTP_SECRET_KEY = 'debet_sec_totp_v2';
const TOTP_ENABLED_KEY = 'debet_sec_totp_en_v2';

// Default initial master password (overrideable via VITE_DEFAULT_MASTER_PASSWORD)
export const DEFAULT_MASTER_PASSWORD = import.meta.env?.VITE_DEFAULT_MASTER_PASSWORD || '010700GkO';

// Helper to convert ArrayBuffer to hex string
function bufToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Obfuscate/encrypt string with device salt so sensitive tokens aren't plaintext in localStorage
function maskWithSalt(text, saltHex) {
  if (!text) return '';
  const enc = new TextEncoder();
  const bytes = enc.encode(text);
  const saltBytes = new Uint8Array(
    saltHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
  const masked = bytes.map((b, i) => b ^ saltBytes[i % saltBytes.length]);
  return bufToHex(masked.buffer);
}

function unmaskWithSalt(hex, saltHex) {
  if (!hex) return '';
  const saltBytes = new Uint8Array(
    saltHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
  const bytes = new Uint8Array(
    hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
  const unmasked = bytes.map((b, i) => b ^ saltBytes[i % saltBytes.length]);
  return new TextDecoder().decode(unmasked);
}

// Generate random salt
function generateSalt(length = 16) {
  const salt = new Uint8Array(length);
  crypto.getRandomValues(salt);
  return bufToHex(salt);
}

// Hash password with salt using PBKDF2 (SHA-256, 100,000 iterations)
export async function hashPasswordWithSalt(password, saltHex) {
  const enc = new TextEncoder();
  const saltBytes = new Uint8Array(
    saltHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return bufToHex(derivedBits);
}

// Get or initialize salt for master password
function getMasterSalt() {
  let salt = localStorage.getItem(PASS_SALT_KEY);
  if (!salt) {
    salt = generateSalt(16);
    localStorage.setItem(PASS_SALT_KEY, salt);
  }
  return salt;
}

// Verify entered master password
export async function verifyMasterPassword(enteredPassword) {
  if (!enteredPassword) return false;
  const salt = getMasterSalt();
  const enteredHash = await hashPasswordWithSalt(enteredPassword, salt);

  const storedHash = localStorage.getItem(PASS_HASH_KEY);
  if (!storedHash) {
    // Check against default initial password
    const defaultHash = await hashPasswordWithSalt(DEFAULT_MASTER_PASSWORD, salt);
    if (enteredHash === defaultHash) {
      // Save hashed default password
      localStorage.setItem(PASS_HASH_KEY, defaultHash);
      return true;
    }
    // Also check legacy plaintext if exists
    const legacyPass = localStorage.getItem('debet_custom_pass_v1');
    if (legacyPass && enteredPassword === legacyPass) {
      localStorage.setItem(PASS_HASH_KEY, enteredHash);
      localStorage.removeItem('debet_custom_pass_v1');
      return true;
    }
    return false;
  }

  return enteredHash === storedHash;
}

// Set new master password
export async function updateMasterPassword(newPassword) {
  const salt = getMasterSalt();
  const hash = await hashPasswordWithSalt(newPassword, salt);
  localStorage.setItem(PASS_HASH_KEY, hash);
  // Clean legacy plaintext if any
  localStorage.removeItem('debet_custom_pass_v1');
  localStorage.removeItem('debet_enc_pwd');
  sessionStorage.removeItem('debet_enc_pwd');
}

// Create cryptographically signed session token (7-day or session)
export async function createSecureSession(rememberMe = true) {
  const expiresAt = rememberMe ? Date.now() + SEVEN_DAYS_MS : Date.now() + 24 * 60 * 60 * 1000;
  const sessionData = {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    exp: expiresAt,
    remember: rememberMe,
  };

  const payload = JSON.stringify(sessionData);
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(payload + getMasterSalt()));
  const signature = bufToHex(hashBuffer);

  const sessionObj = { ...sessionData, sig: signature };
  const serialized = JSON.stringify(sessionObj);

  if (rememberMe) {
    localStorage.setItem(SESSION_STORAGE_KEY, serialized);
  } else {
    sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
  }

  return sessionObj;
}

// Validate active session
export async function validateSecureSession() {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    // Check legacy fallback
    const legacy = localStorage.getItem('debet_auth_session_v1');
    const legacyExp = localStorage.getItem('debet_auth_expiry_v1');
    if (legacy === 'unlocked' && legacyExp && Date.now() < parseInt(legacyExp, 10)) {
      // Migrate to secure session
      await createSecureSession(true);
      localStorage.removeItem('debet_auth_session_v1');
      localStorage.removeItem('debet_auth_expiry_v1');
      return true;
    }
    return false;
  }

  try {
    const session = JSON.parse(raw);
    if (!session || !session.exp || !session.sig) return false;

    // Check expiration
    if (Date.now() > session.exp) {
      clearSecureSession();
      return false;
    }

    // Verify signature
    const baseData = { id: session.id, exp: session.exp, remember: session.remember };
    const enc = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(JSON.stringify(baseData) + getMasterSalt()));
    const expectedSig = bufToHex(hashBuffer);

    if (session.sig !== expectedSig) {
      clearSecureSession();
      return false;
    }

    return true;
  } catch (e) {
    clearSecureSession();
    return false;
  }
}

// Clear session
export function clearSecureSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  // Clear legacy tokens
  localStorage.removeItem('debet_auth_session_v1');
  localStorage.removeItem('debet_auth_expiry_v1');
  localStorage.removeItem('debet_enc_pwd');
  sessionStorage.removeItem('debet_enc_pwd');
}

// TOTP Secret helpers
export function getStoredTotpSecret() {
  const raw = localStorage.getItem(TOTP_SECRET_KEY) || localStorage.getItem('debet_totp_secret_v1') || '';
  if (!raw) return '';
  if (raw.startsWith('enc:')) {
    try {
      const salt = getMasterSalt();
      return unmaskWithSalt(raw.slice(4), salt);
    } catch (e) {
      console.warn('Failed to unmask TOTP secret:', e);
      return '';
    }
  }
  return raw;
}

export function setStoredTotpSecret(secret) {
  if (secret) {
    const salt = getMasterSalt();
    const masked = 'enc:' + maskWithSalt(secret, salt);
    localStorage.setItem(TOTP_SECRET_KEY, masked);
    localStorage.setItem(TOTP_ENABLED_KEY, 'true');
    // Clean legacy
    localStorage.removeItem('debet_totp_secret_v1');
    localStorage.removeItem('debet_totp_enabled_v1');
  } else {
    localStorage.removeItem(TOTP_SECRET_KEY);
    localStorage.removeItem(TOTP_ENABLED_KEY);
  }
}

export function isStoredTotpEnabled() {
  return (
    localStorage.getItem(TOTP_ENABLED_KEY) === 'true' ||
    localStorage.getItem('debet_totp_enabled_v1') === 'true'
  );
}
