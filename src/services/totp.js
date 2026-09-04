// Google Authenticator TOTP Service (RFC 6238 / RFC 4226)
// Works 100% locally with native Web Crypto API for maximum privacy and security.

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Generate random Base32 secret (160-bit / 20 bytes -> 32 characters)
export function generateTotpSecret(length = 32) {
  const randomBytes = new Uint8Array(20);
  crypto.getRandomValues(randomBytes);
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[randomBytes[i % randomBytes.length] % 32];
  }
  return secret;
}

// Decode Base32 string to Uint8Array
function base32ToBytes(base32Str) {
  const clean = base32Str.replace(/[\s=-]/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}

// Generate TOTP token for a specific time step offset
export async function generateTotpToken(secret, timeStepOffset = 0) {
  try {
    const keyBytes = base32ToBytes(secret);
    if (keyBytes.length === 0) return null;

    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: { name: 'SHA-1' } },
      false,
      ['sign']
    );

    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / 30) + timeStepOffset;

    // 8-byte big-endian buffer
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setUint32(0, 0, false); // High 32 bits
    view.setUint32(4, counter, false); // Low 32 bits

    const signature = await crypto.subtle.sign('HMAC', key, buffer);
    const hash = new Uint8Array(signature);

    // Dynamic truncation
    const offset = hash[hash.length - 1] & 0x0f;
    const binary =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    const otp = (binary % 1000000).toString().padStart(6, '0');
    return otp;
  } catch (err) {
    console.error('Error generating TOTP token:', err);
    return null;
  }
}

// Verify entered 6-digit TOTP code with +- 1 time step window (30s)
export async function verifyTotpCode(secret, userCode, window = 1) {
  if (!secret || !userCode) return false;
  const cleanCode = userCode.toString().replace(/\s/g, '').trim();
  if (cleanCode.length !== 6) return false;

  for (let offset = -window; offset <= window; offset++) {
    const validOtp = await generateTotpToken(secret, offset);
    if (validOtp && validOtp === cleanCode) {
      return true;
    }
  }
  return false;
}

// Build standard otpauth URI for Google Authenticator
export function getOtpAuthUrl(secret, accountName = 'master@debet.auto', issuer = 'Debet.auto') {
  const cleanSecret = secret.replace(/[\s=-]/g, '').toUpperCase();
  const encodedAccount = encodeURIComponent(accountName);
  const encodedIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${cleanSecret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}
