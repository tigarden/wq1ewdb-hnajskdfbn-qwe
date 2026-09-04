// WebAuthn / Passkey Service
// Supports Apple Face ID / Touch ID, iCloud Keychain, Windows Hello, and FIDO2 keys.

/**
 * Convert ArrayBuffer to Base64URL string
 */
export function bufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Convert Base64URL string to Uint8Array / ArrayBuffer
 */
export function base64UrlToBuffer(base64Url) {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Detect friendly device name for Passkey registration
 */
export function getDevicePasskeyLabel() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/.test(ua)) {
    return 'Apple Face ID / Touch ID (iOS)';
  }
  if (/Macintosh|Mac OS X/.test(ua)) {
    return 'Apple Touch ID (macOS)';
  }
  if (/Windows NT/.test(ua)) {
    return 'Windows Hello';
  }
  if (/Android/.test(ua)) {
    return 'Android Biometrics';
  }
  return 'Ключ доступа (Passkey)';
}

/**
 * Check if WebAuthn / Passkey is supported in current environment
 */
export async function isPasskeySupported() {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }
  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return Boolean(available);
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Register a new Passkey credential on this device
 */
export async function registerPasskeyCredential(accountName = 'admin@debet.auto') {
  if (!window.PublicKeyCredential) {
    throw new Error('Ключи доступа (Passkey) не поддерживаются вашим браузером');
  }

  // Generate 32 bytes cryptographically secure random challenge
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  // Generate random user ID
  const userId = new Uint8Array(16);
  crypto.getRandomValues(userId);

  // Relying Party identifier (hostname without port or protocol)
  // For localhost, hostname is 'localhost'. For GitHub Pages, it is '<username>.github.io'.
  const rpId = window.location.hostname || 'localhost';

  const publicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: 'Debet.auto',
      id: rpId,
    },
    user: {
      id: userId,
      name: accountName,
      displayName: 'Debet Admin',
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },  // ES256 (ECDSA w/ SHA-256) - default for Apple/iOS
      { alg: -257, type: 'public-key' }, // RS256 (RSA w/ SHA-256) - Windows Hello
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // Platform-native: Touch ID, Face ID, Windows Hello
      userVerification: 'preferred',
      residentKey: 'preferred',
    },
    timeout: 60000,
    attestation: 'none',
  };

  try {
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    });

    if (!credential) {
      throw new Error('Регистрация ключа доступа отменена');
    }

    const credentialId = bufferToBase64Url(credential.rawId);
    const label = getDevicePasskeyLabel();

    return {
      id: credentialId,
      label,
      createdAt: new Date().toISOString(),
      rawId: credentialId,
    };
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Создание ключа доступа отменено пользователем');
    }
    if (err.name === 'InvalidStateError') {
      throw new Error('Такой ключ доступа уже привязан на этом устройстве');
    }
    throw new Error(err.message || 'Ошибка создания ключа доступа Passkey');
  }
}

/**
 * Authenticate using a registered Passkey
 */
export async function authenticateWithPasskey(registeredCredentials = []) {
  if (!window.PublicKeyCredential) {
    throw new Error('Ключи доступа не поддерживаются браузером');
  }

  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  const rpId = window.location.hostname || 'localhost';

  const allowCredentials = (registeredCredentials || []).map((cred) => ({
    id: base64UrlToBuffer(cred.id),
    type: 'public-key',
  }));

  const publicKeyCredentialRequestOptions = {
    challenge,
    rpId,
    timeout: 60000,
    userVerification: 'preferred',
  };

  if (allowCredentials.length > 0) {
    publicKeyCredentialRequestOptions.allowCredentials = allowCredentials;
  }

  try {
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });

    if (!assertion) {
      throw new Error('Вход по ключу доступа отменен');
    }

    const matchedId = bufferToBase64Url(assertion.rawId);
    return {
      success: true,
      credentialId: matchedId,
    };
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Проверка ключа доступа или биометрии была отменена');
    }
    throw new Error(err.message || 'Ошибка проверки ключа доступа');
  }
}
