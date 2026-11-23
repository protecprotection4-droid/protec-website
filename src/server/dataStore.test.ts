import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { DEFAULT_TESTIMONIALS } from '../data/protecDefaults';
import { ServerDataStore } from './dataStore';

test('ServerDataStore persists, updates, and deletes quote requests with status enforcement', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'protec-store-quotes-'));
  try {
    const store = new ServerDataStore(tempDir);

    const created = store.createQuote({
      fullName: 'Karim Mansour',
      phone: '01012345678',
      governorate: 'Cairo',
      area: 'New Cairo',
      address: 'Fifth Settlement Villa 12',
      serviceType: 'landscape-design',
      projectAreaSqm: 420,
      description: 'Need full garden redesign and drip irrigation.',
      attachments: [
        {
          id: 'att-1',
          filename: '1234-site.jpg',
          originalName: 'garden.jpg',
          mimeType: 'image/jpeg',
          size: 204800,
          kind: 'image',
          url: '/api/quotes/media/1234-site.jpg',
        },
      ],
    });

    assert.equal(created.ok, true);
    if (!created.ok) return;

    assert.equal(created.quote.status, 'new');
    assert.equal(created.quote.attachments.length, 1);

    const list = store.listQuotes();
    assert.equal(list.length, 1);
    assert.equal(list[0].fullName, 'Karim Mansour');

    const updated = store.updateQuote(created.quote.id, 'scheduled', 'Site survey Thursday 10 AM');
    assert.equal(updated.ok, true);
    if (updated.ok) {
      assert.equal(updated.quote.status, 'scheduled');
      assert.equal(updated.quote.adminNotes, 'Site survey Thursday 10 AM');
    }

    assert.equal(store.updateQuote(created.quote.id, 'invalid-status', '').ok, false);
    assert.equal(store.deleteQuote(created.quote.id), true);
    assert.equal(store.listQuotes().length, 0);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('ServerDataStore persists new offer with uploaded photo URL alongside default offers', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'protec-store-offers-'));
  try {
    const store = new ServerDataStore(tempDir);
    const saved = store.upsertOffer({
      id: 'off-custom-photo',
      titleAr: 'باقة فحص وحماية النخيل',
      titleEn: 'Palm Protection Spring Package',
      descriptionAr: 'فحص ومعالجة وقائية متكاملة ضد سوسة النخيل الحمراء.',
      descriptionEn: 'Complete preventive palm weevil inspection and treatment.',
      discountLabelAr: 'خصم 25%',
      discountLabelEn: '25% OFF',
      originalPrice: '4000 EGP',
      offerPrice: '3000 EGP',
      expiresAt: '2026-12-31',
      serviceType: 'plant-protection',
      imageUrl: '/uploads/public/1700000-offer.jpg',
      active: true,
    });

    assert.equal(saved.ok, true);
    const catalog = store.getPublicCatalog();
    assert.ok(catalog.offers && catalog.offers.length >= 2);
    const added = catalog.offers?.find((o) => o.id === 'off-custom-photo');
    assert.ok(added);
    assert.equal(added.imageUrl, '/uploads/public/1700000-offer.jpg');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('ServerDataStore creates, lists, and deletes visitor reviews and enforces validation', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'protec-store-reviews-'));
  try {
    const store = new ServerDataStore(tempDir);

    const invalid = store.createReview({
      authorName: 'X',
      serviceCategory: 'landscaping',
      rating: 5,
      comment: 'too short',
    });
    assert.equal(invalid.ok, false);

    const created = store.createReview({
      authorName: 'م. أحمد سليم',
      location: 'الشيخ زايد',
      serviceCategory: 'plant-protection',
      rating: 5,
      comment: 'تجربة ممتازة في فحص وعلاج سوسة النخيل بمتابعة مستمرة.',
    });
    assert.equal(created.ok, true);
    if (!created.ok) return;

    assert.equal(created.review.source, 'visitor');
    assert.equal(created.review.rating, 5);

    const catalog = store.getPublicCatalog();
    assert.equal(catalog.reviews?.length, 1);
    assert.equal(catalog.reviews?.[0].authorNameAr, 'م. أحمد سليم');

    assert.equal(store.deleteReview(created.review.id), true);
    assert.equal(store.listReviews().length, 0);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('ServerDataStore seeds, updates, and permanently deletes default reviews without resurrection', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'protec-store-seeded-reviews-'));
  try {
    const store = new ServerDataStore(tempDir);
    store.seedDefaultReviewsIfUninitialized(DEFAULT_TESTIMONIALS);
    const catalog1 = store.getPublicCatalog();
    assert.equal(catalog1.reviewsInitialized, true);
    assert.equal(catalog1.reviews?.length, DEFAULT_TESTIMONIALS.length);

    const target = catalog1.reviews![0];
    const edited = store.updateReview(target.id, {
      authorNameAr: 'م. طارق الشناوي (مُحدّث)',
      rating: 4.5,
      quoteAr: 'تم تحديث نص التقييم من لوحة التحكم للتأكد من حفظ التعديلات.',
    });
    assert.equal(edited.ok, true);
    if (edited.ok) {
      assert.equal(edited.review.authorNameAr, 'م. طارق الشناوي (مُحدّث)');
      assert.equal(edited.review.rating, 4.5);
    }

    assert.equal(store.deleteReview(target.id), true);
    // Re-running startup seed must NOT restore the deleted review
    store.seedDefaultReviewsIfUninitialized(DEFAULT_TESTIMONIALS);
    const catalog2 = store.getPublicCatalog();
    assert.equal(catalog2.reviews?.length, DEFAULT_TESTIMONIALS.length - 1);
    assert.equal(catalog2.reviews?.some((r) => r.id === target.id), false);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('ServerDataStore accepts Damietta quote submission with empty description', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'protec-store-empty-desc-'));
  try {
    const store = new ServerDataStore(tempDir);
    const created = store.createQuote({
      fullName: 'محمود رزق',
      phone: '01099887766',
      governorate: 'دمياط',
      area: 'رأس البر',
      address: 'شارع النيل رقم 22',
      serviceType: 'irrigation-networks',
      description: '',
    });
    assert.equal(created.ok, true);
    if (created.ok) {
      assert.equal(created.quote.governorate, 'دمياط');
      assert.equal(created.quote.description, '');
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('ServerDataStore sets up, verifies, and updates scrypt admin password securely', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'protec-store-auth-'));
  const prevEnvPass = process.env.ADMIN_PASSCODE;
  delete process.env.ADMIN_PASSCODE;

  try {
    const store = new ServerDataStore(tempDir);
    assert.equal(store.isServerAdminPasswordConfigured(), false);

    const tooShort = store.setupInitialServerAdminPassword('12345');
    assert.equal(tooShort.ok, false);

    const setup = store.setupInitialServerAdminPassword('ProtecOwner#2026');
    assert.equal(setup.ok, true);
    assert.equal(store.isServerAdminPasswordConfigured(), true);

    const duplicateSetup = store.setupInitialServerAdminPassword('AnotherPass#2026');
    assert.equal(duplicateSetup.ok, false);

    assert.equal(store.verifyServerAdminPassword('ProtecOwner#2026'), true);
    assert.equal(store.verifyServerAdminPassword('WrongPass#2026'), false);

    const wrongCurrent = store.updateServerAdminPassword('WrongPass#2026', 'NewStrong#2026');
    assert.equal(wrongCurrent.ok, false);

    const rotated = store.updateServerAdminPassword('ProtecOwner#2026', 'NewStrong#2026');
    assert.equal(rotated.ok, true);
    assert.equal(store.verifyServerAdminPassword('ProtecOwner#2026'), false);
    assert.equal(store.verifyServerAdminPassword('NewStrong#2026'), true);
  } finally {
    if (prevEnvPass !== undefined) {
      process.env.ADMIN_PASSCODE = prevEnvPass;
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('ServerDataStore sanitizes multi-image heroImages slider up to 8 and syncs heroImageUrl', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'protec-store-hero-slides-'));
  try {
    const store = new ServerDataStore(tempDir);
    const saved = store.saveSiteContent({
      heroTitleAr: 'هندسة اللاندسكيب ووقاية النبات',
      heroTitleEn: 'Scientific Plant Protection',
      heroSubtitleAr: 'بروتيك لوقاية النبات واللاندسكيب',
      heroSubtitleEn: 'Protec Landscaping',
      heroImageUrl: '/uploads/public/slide-1.jpg',
      heroImages: [
        '/uploads/public/slide-1.jpg',
        'javascript:alert(1)',
        '/uploads/public/slide-2.jpg',
        '/uploads/public/slide-2.jpg',
        '/uploads/public/slide-3.jpg',
        '/uploads/public/slide-4.jpg',
        '/uploads/public/slide-5.jpg',
        '/uploads/public/slide-6.jpg',
        '/uploads/public/slide-7.jpg',
        '/uploads/public/slide-8.jpg',
        '/uploads/public/slide-9.jpg',
      ],
      aboutSummaryAr: 'عن بروتيك',
      aboutSummaryEn: 'About Protec',
      visionAr: 'الرؤية',
      visionEn: 'Vision',
      missionAr: 'الرسالة',
      missionEn: 'Mission',
      goalsAr: [],
      goalsEn: [],
      valuesAr: [],
      valuesEn: [],
      differentiatorsAr: [],
      differentiatorsEn: [],
      phones: ['01036084725'],
      whatsappNumber: '201036084725',
      email: 'protecprotection4@gmail.com',
      addressAr: 'القاهرة',
      addressEn: 'Cairo',
      facebookUrl: 'https://www.facebook.com',
      tiktokUrl: 'https://www.tiktok.com',
    });

    assert.equal(saved.ok, true);
    if (!saved.ok) return;

    assert.equal(saved.siteContent.heroImages?.length, 8);
    assert.equal(saved.siteContent.heroImages?.[0], '/uploads/public/slide-1.jpg');
    assert.equal(saved.siteContent.heroImageUrl, '/uploads/public/slide-1.jpg');
    assert.equal(
      saved.siteContent.heroImages?.some((u) => u.startsWith('javascript:')),
      false
    );

    const catalog = store.getPublicCatalog();
    assert.equal(catalog.siteContent?.heroImages?.length, 8);
    assert.equal(catalog.siteContent?.heroImages?.[1], '/uploads/public/slide-2.jpg');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('ServerDataStore records persistent visitor count and preserves last hero image + coverage settings', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'protec-store-visits-coverage-'));
  try {
    const store = new ServerDataStore(tempDir);
    assert.equal(store.getStats().totalVisits, 0);
    assert.equal(store.recordVisit().totalVisits, 1);
    assert.equal(store.recordVisit().totalVisits, 2);

    const storeReloaded = new ServerDataStore(tempDir);
    assert.equal(storeReloaded.getStats().totalVisits, 2);

    const updated = storeReloaded.saveSiteContent({
      heroTitleAr: 'بروتيك لوقاية النبات',
      heroTitleEn: 'Protec Plant Protection',
      heroSubtitleAr: 'بروتيك لوقاية النبات واللاندسكيب المتكامل',
      heroSubtitleEn: 'Integrated pest management and architectural landscaping',
      heroImageUrl: '/uploads/public/first.jpg',
      heroImages: [
        '/uploads/public/first.jpg',
        '/uploads/public/second.jpg',
        '/uploads/public/third.jpg',
        '/uploads/public/latest-last-image.jpg',
      ],
      aboutSummaryAr: 'عن بروتيك الهندسية الزراعية',
      aboutSummaryEn: 'About Protec engineering & plant science',
      visionAr: 'رؤيتنا المستدامة',
      visionEn: 'Sustainable Vision',
      missionAr: 'رسالتنا العلمية',
      missionEn: 'Scientific Mission',
      goalsAr: [],
      goalsEn: [],
      valuesAr: [],
      valuesEn: [],
      differentiatorsAr: [],
      differentiatorsEn: [],
      phones: ['01036084725'],
      whatsappNumber: '201036084725',
      email: 'protecprotection4@gmail.com',
      addressAr: 'جميع المحافظات',
      addressEn: 'All Egypt',
      facebookUrl: 'https://www.facebook.com',
      tiktokUrl: 'https://www.tiktok.com',
      instagramUrl: 'https://www.instagram.com/protec.eg',
      coverageStatementAr: 'تخدم بروتيك جميع محافظات مصر',
      coverageStatementEn: 'Protec serves all governorates across Egypt',
      availableAreasAr: 'دمياط والمنصورة وبورسعيد',
      availableAreasEn: 'Damietta, Mansoura and Port Said',
    });

    assert.equal(updated.ok, true);
    const catalog = storeReloaded.getPublicCatalog();
    assert.equal(catalog.siteContent?.heroImages?.[3], '/uploads/public/latest-last-image.jpg');
    assert.equal(catalog.siteContent?.instagramUrl, 'https://www.instagram.com/protec.eg');
    assert.equal(catalog.siteContent?.availableAreasAr, 'دمياط والمنصورة وبورسعيد');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
