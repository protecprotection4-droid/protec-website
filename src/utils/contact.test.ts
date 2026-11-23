import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from './contact';

test('normalizeWhatsAppNumber strips formatting and normalizes local 01x numbers', () => {
  assert.equal(normalizeWhatsAppNumber('201036084725'), '201036084725');
  assert.equal(normalizeWhatsAppNumber('+20 103-608-4725'), '201036084725');
  assert.equal(normalizeWhatsAppNumber('01036084725'), '201036084725');
  assert.equal(normalizeWhatsAppNumber('   '), '');
});

test('buildWhatsAppUrl constructs valid bilingual wa.me links and rejects empty numbers', () => {
  const arUrl = buildWhatsAppUrl('201036084725', 'ar');
  assert.ok(arUrl);
  assert.match(arUrl, /^https:\/\/wa\.me\/201036084725\?text=/);
  assert.ok(decodeURIComponent(arUrl).includes('Protec'));

  const enUrl = buildWhatsAppUrl('01065324190', 'en');
  assert.ok(enUrl);
  assert.match(enUrl, /^https:\/\/wa\.me\/201065324190\?text=/);
  assert.ok(decodeURIComponent(enUrl).includes('plant protection'));

  assert.equal(buildWhatsAppUrl('', 'ar'), null);
});
