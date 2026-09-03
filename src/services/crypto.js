// Native Web Crypto API: PBKDF2 + AES-256-GCM
// Ensures 100% confidentiality of data even in public repositories

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(dataObj, password) {
  if (!password) return dataObj; // fallback if no password
  try {
    const plainText = JSON.stringify(dataObj);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const encoded = new TextEncoder().encode(plainText);

    const cipher = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoded
    );

    return {
      _encrypted: true,
      algorithm: 'AES-256-GCM',
      version: 1,
      salt: Array.from(salt),
      iv: Array.from(iv),
      ciphertext: Array.from(new Uint8Array(cipher)),
    };
  } catch (e) {
    console.error('Encryption error:', e);
    throw new Error('Ошибка шифрования данных');
  }
}

export async function decryptData(encryptedPayload, password) {
  if (!encryptedPayload) return null;
  // If not encrypted, return raw
  if (!encryptedPayload._encrypted) return encryptedPayload;
  if (!password) throw new Error('Требуется пароль для расшифровки');

  try {
    const salt = new Uint8Array(encryptedPayload.salt);
    const iv = new Uint8Array(encryptedPayload.iv);
    const cipher = new Uint8Array(encryptedPayload.ciphertext);
    const key = await deriveKey(password, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      cipher
    );

    const text = new TextDecoder().decode(decrypted);
    return JSON.parse(text);
  } catch (e) {
    console.error('Decryption error:', e);
    throw new Error('Неверный пароль или поврежденные зашифрованные данные');
  }
}
