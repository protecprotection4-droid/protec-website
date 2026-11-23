import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateReferenceCode,
  isSafeHttpOrLocalUrl,
  validateOfferInput,
  validateProjectInput,
  validateQuoteInput,
  validateServiceInput,
} from './validation';

test('validateQuoteInput accepts valid complete quote payload', () => {
  const result = validateQuoteInput({
    fullName: 'أحمد محمود حسن',
    phone: '01036084725',
    email: 'client@example.com',
    governorate: 'القاهرة',
    area: 'التجمع الخامس',
    address: 'فيلا 14، الحي الأول، شارع التسعين',
    serviceType: 'landscape-design',
    projectAreaSqm: 450,
    description: 'تصميم وتنفيذ لاندسكيب كامل مع شبكة ري أوتوماتيكية.',
    attachments: [],
  });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test('validateQuoteInput allows empty description and rejects invalid required fields, bad email, over-limit description, and >10 attachments', () => {
  const withEmptyDescription = validateQuoteInput({
    fullName: 'سارة محمود',
    phone: '01036084725',
    governorate: 'دمياط',
    area: 'دمياط الجديدة',
    address: 'الحي الثاني فيلا 9',
    serviceType: 'landscape-design',
    description: '',
    attachments: [],
  });
  assert.equal(withEmptyDescription.valid, true);

  const tooMany = Array.from({ length: 11 }, (_, idx) => ({
    id: `f-${idx}`,
    filename: `file-${idx}.jpg`,
    originalName: `file-${idx}.jpg`,
    mimeType: 'image/jpeg',
    size: 1024,
    kind: 'image' as const,
    url: `/api/quotes/media/file-${idx}.jpg`,
  }));

  const result = validateQuoteInput({
    fullName: 'A',
    phone: '123',
    email: 'not-an-email',
    governorate: '',
    area: '',
    address: 'x',
    serviceType: '',
    projectAreaSqm: -5,
    description: 'x'.repeat(3001),
    attachments: tooMany,
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.fullName);
  assert.ok(result.errors.phone);
  assert.ok(result.errors.email);
  assert.ok(result.errors.governorate);
  assert.ok(result.errors.area);
  assert.ok(result.errors.address);
  assert.ok(result.errors.serviceType);
  assert.ok(result.errors.projectAreaSqm);
  assert.ok(result.errors.description);
  assert.ok(result.errors.attachments);
});

test('isSafeHttpOrLocalUrl blocks javascript:, data:, and protocol-relative URLs', () => {
  assert.equal(isSafeHttpOrLocalUrl('/src/assets/images/hero.jpg'), true);
  assert.equal(isSafeHttpOrLocalUrl('https://protec-eg.com/photo.jpg'), true);
  assert.equal(isSafeHttpOrLocalUrl('javascript:alert(1)'), false);
  assert.equal(isSafeHttpOrLocalUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.equal(isSafeHttpOrLocalUrl('//evil.com/x.jpg'), false);
});

test('generateReferenceCode adheres to ^[A-Z0-9-]+$ pattern', () => {
  const code = generateReferenceCode(new Date('2026-11-22T10:00:00Z'), 'A9F2');
  assert.equal(code, 'PRT-20261122-A9F2');
  assert.match(code, /^[A-Z0-9-]+$/);
});

test('validateServiceInput, validateProjectInput, validateOfferInput enforce constraints', () => {
  assert.equal(
    validateServiceInput({
      slug: 'plant-protection',
      titleAr: 'وقاية النبات',
      titleEn: 'Plant Protection',
      shortDescAr: 'تشخيص ومكافحة الآفات النباتية بدقة علمية.',
      shortDescEn: 'Scientific plant pest diagnosis and integrated control.',
      fullDescAr: 'برنامج متكامل لفحص وتشخيص الأمراض الفطرية والحشرية.',
      fullDescEn: 'Comprehensive program for inspecting and treating plant diseases.',
      imageUrl: '/src/assets/images/service.jpg',
      order: 1,
    }).valid,
    true
  );

  assert.equal(
    validateProjectInput({
      titleAr: 'مشروع فيلا التجمع',
      titleEn: 'Fifth Settlement Villa',
      category: 'landscaping',
      locationAr: 'القاهرة الجديدة',
      locationEn: 'New Cairo',
      summaryAr: 'تحويل مساحة 350 متر إلى حديقة متكاملة.',
      summaryEn: 'Complete 350 sqm landscape transformation.',
      beforeImageUrl: '/before.jpg',
      afterImageUrl: '/after.jpg',
      areaSqm: 350,
    }).valid,
    true
  );

  assert.equal(
    validateOfferInput({
      titleAr: 'باقة وقاية النخيل',
      titleEn: 'Palm Protection Package',
      descriptionAr: 'فحص ومعالجة وقائية شاملة للنخيل ضد سوسة النخيل.',
      descriptionEn: 'Preventive inspection and treatment for ornamental palms.',
      discountLabelAr: 'خصم 20%',
      discountLabelEn: '20% OFF',
      expiresAt: '2026-12-31',
      serviceType: 'plant-protection-diagnosis',
      imageUrl: '/offer.jpg',
    }).valid,
    true
  );
});
