import assert from 'node:assert/strict';
import test from 'node:test';
import {
  computeQuoteProgress,
  firstInvalidQuoteStep,
  validateQuoteStep,
} from './quoteWizard';
import { QuoteFormInput } from './validation';

const baseValidInput: QuoteFormInput = {
  fullName: 'كريم عبد الله',
  phone: '01036084725',
  email: '',
  governorate: 'دمياط',
  area: 'دمياط الجديدة',
  address: 'الحي الأول، شارع 14',
  serviceType: 'landscape-design',
  projectAreaSqm: '320',
  description: '',
  attachments: [],
};

test('computeQuoteProgress returns exact percentages across steps 1..3', () => {
  assert.deepEqual(computeQuoteProgress(1), { step: 1, totalSteps: 3, percent: 33 });
  assert.deepEqual(computeQuoteProgress(2), { step: 2, totalSteps: 3, percent: 67 });
  assert.deepEqual(computeQuoteProgress(3), { step: 3, totalSteps: 3, percent: 100 });
});

test('validateQuoteStep validates step-by-step and allows Damietta + empty description', () => {
  assert.equal(validateQuoteStep(1, baseValidInput).valid, true);
  assert.equal(validateQuoteStep(2, baseValidInput).valid, true);
  assert.equal(validateQuoteStep(3, baseValidInput).valid, true);

  const missingStep1 = validateQuoteStep(1, { ...baseValidInput, fullName: '', phone: '12' });
  assert.equal(missingStep1.valid, false);
  assert.ok(missingStep1.errors.fullName);
  assert.ok(missingStep1.errors.phone);

  const missingStep2 = validateQuoteStep(2, { ...baseValidInput, governorate: '', address: 'x' });
  assert.equal(missingStep2.valid, false);
  assert.ok(missingStep2.errors.governorate);
  assert.ok(missingStep2.errors.address);
});

test('firstInvalidQuoteStep navigates back to the earliest step containing errors', () => {
  assert.equal(firstInvalidQuoteStep({ fullName: 'invalid_full_name', address: 'invalid_address' }), 1);
  assert.equal(firstInvalidQuoteStep({ governorate: 'invalid_governorate' }), 2);
  assert.equal(firstInvalidQuoteStep({ description: 'invalid_description' }), 3);
});
