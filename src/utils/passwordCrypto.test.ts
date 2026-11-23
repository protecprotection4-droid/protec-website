import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AUTHORIZED_ADMIN_EMAIL,
  createAdminPasswordVerifier,
  isAuthorizedAdminEmail,
  normalizeAdminEmailInput,
  PBKDF2_ALGORITHM,
  PBKDF2_ITERATIONS,
  timingSafeHexEqual,
  validateAdminPasswordStrength,
  verifyAdminPassword,
} from './passwordCrypto';

test('normalizes and validates the primary authorized Protec admin email', () => {
  assert.equal(normalizeAdminEmailInput('  ProtecProtection4@GMAIL.com '), AUTHORIZED_ADMIN_EMAIL);
  assert.equal(isAuthorizedAdminEmail('protecprotection4@gmail.com'), true);
  assert.equal(isAuthorizedAdminEmail(' PROTECPROTECTION4@gmail.com '), true);
  assert.equal(isAuthorizedAdminEmail('mohamedmezher555@gmail.com'), false);
  assert.equal(isAuthorizedAdminEmail('attacker@gmail.com'), false);
  assert.equal(isAuthorizedAdminEmail(null), false);
});

test('validates admin password strength bounds', () => {
  assert.deepEqual(validateAdminPasswordStrength(''), { valid: false, reason: 'empty' });
  assert.deepEqual(validateAdminPasswordStrength('1234567'), { valid: false, reason: 'too_short' });
  assert.deepEqual(validateAdminPasswordStrength('a'.repeat(129)), {
    valid: false,
    reason: 'too_long',
  });
  assert.deepEqual(validateAdminPasswordStrength('Protec@2026'), { valid: true });
});

test('timingSafeHexEqual compares hex strings accurately', () => {
  assert.equal(timingSafeHexEqual('abcdef01', 'ABCDEF01'), true);
  assert.equal(timingSafeHexEqual('abcdef01', 'abcdef02'), false);
  assert.equal(timingSafeHexEqual('abcdef01', 'abcdef'), false);
  assert.equal(timingSafeHexEqual('', ''), false);
});

test('creates salted PBKDF2-SHA256 verifiers and verifies matching/non-matching passwords', async () => {
  const verifierA = await createAdminPasswordVerifier('ProtecGarden#2026');
  const verifierB = await createAdminPasswordVerifier('ProtecGarden#2026');

  assert.equal(verifierA.algorithm, PBKDF2_ALGORITHM);
  assert.equal(verifierA.iterations, PBKDF2_ITERATIONS);
  assert.equal(verifierA.salt.length, 32);
  assert.equal(verifierA.passwordHash.length, 64);
  assert.notEqual(verifierA.salt, verifierB.salt);
  assert.notEqual(verifierA.passwordHash, verifierB.passwordHash);

  assert.equal(await verifyAdminPassword('ProtecGarden#2026', verifierA), true);
  assert.equal(await verifyAdminPassword('WrongPassword#2026', verifierA), false);
  assert.equal(await verifyAdminPassword('', verifierA), false);
});

test('rejects weak iteration counts below security rules floor', async () => {
  const verifier = await createAdminPasswordVerifier('ProtecGarden#2026');
  const invalidRecord = { ...verifier, iterations: 1000 };
  assert.equal(await verifyAdminPassword('ProtecGarden#2026', invalidRecord), false);
});
