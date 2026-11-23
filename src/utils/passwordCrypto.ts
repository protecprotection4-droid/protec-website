export const AUTHORIZED_ADMIN_EMAIL = 'protecprotection4@gmail.com';
export const AUTHORIZED_ADMIN_EMAILS = [
  'protecprotection4@gmail.com',
] as const;
export const PBKDF2_ITERATIONS = 120000;
export const PBKDF2_ALGORITHM = 'PBKDF2-SHA256' as const;

export interface AdminPasswordVerifier {
  passwordHash: string;
  salt: string;
  iterations: number;
  algorithm: typeof PBKDF2_ALGORITHM;
}

export function normalizeAdminEmailInput(email: string): string {
  return email.trim().toLowerCase();
}

export function isAuthorizedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = normalizeAdminEmailInput(email);
  return (AUTHORIZED_ADMIN_EMAILS as readonly string[]).includes(normalized);
}

export function validateAdminPasswordStrength(password: string): {
  valid: boolean;
  reason?: 'empty' | 'too_short' | 'too_long';
} {
  if (!password) {
    return { valid: false, reason: 'empty' };
  }
  if (password.length < 8) {
    return { valid: false, reason: 'too_short' };
  }
  if (password.length > 128) {
    return { valid: false, reason: 'too_long' };
  }
  return { valid: true };
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const clean = hex.trim().toLowerCase();
  if (clean.length === 0 || clean.length % 2 !== 0 || !/^[0-9a-f]+$/.test(clean)) {
    throw new Error('Invalid hex string');
  }
  const buffer = new ArrayBuffer(clean.length / 2);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function timingSafeHexEqual(a: string, b: string): boolean {
  const normA = a.trim().toLowerCase();
  const normB = b.trim().toLowerCase();
  if (normA.length === 0 || normA.length !== normB.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < normA.length; i += 1) {
    diff |= normA.charCodeAt(i) ^ normB.charCodeAt(i);
  }
  return diff === 0;
}

export function generateSaltHex(byteLength = 16): string {
  const bytes = new Uint8Array(byteLength);
  globalThis.crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export async function derivePasswordHashHex(
  password: string,
  saltHex: string,
  iterations = PBKDF2_ITERATIONS
): Promise<string> {
  if (!Number.isFinite(iterations) || iterations < 100000 || iterations > 1000000) {
    throw new Error('PBKDF2 iterations must be between 100,000 and 1,000,000');
  }
  const encoder = new TextEncoder();
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const saltBytes = hexToBytes(saltHex);
  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return bytesToHex(new Uint8Array(derivedBits));
}

export async function createAdminPasswordVerifier(
  password: string,
  iterations = PBKDF2_ITERATIONS
): Promise<AdminPasswordVerifier> {
  const check = validateAdminPasswordStrength(password);
  if (!check.valid) {
    throw new Error('Password does not meet security requirements (8–128 characters).');
  }
  const salt = generateSaltHex(16);
  const passwordHash = await derivePasswordHashHex(password, salt, iterations);
  return {
    passwordHash,
    salt,
    iterations,
    algorithm: PBKDF2_ALGORITHM,
  };
}

export async function verifyAdminPassword(
  password: string,
  record: Pick<AdminPasswordVerifier, 'passwordHash' | 'salt' | 'iterations'>
): Promise<boolean> {
  if (!password || !record.passwordHash || !record.salt) {
    return false;
  }
  try {
    const derived = await derivePasswordHashHex(password, record.salt, record.iterations);
    return timingSafeHexEqual(derived, record.passwordHash);
  } catch {
    return false;
  }
}
