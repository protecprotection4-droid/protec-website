import test from 'node:test';
import assert from 'node:assert/strict';
import { filterProjectsByCategory, getActiveOffers, getOfferCountdown, localizePriceLabel } from './offers';
import { OfferItem, ProjectItem } from '../types';

test('getOfferCountdown accurately computes active, ending-soon, and expired states', () => {
  const now = Date.parse('2026-11-22T12:00:00Z');

  const active = getOfferCountdown('2026-12-15', now);
  assert.equal(active.isExpired, false);
  assert.equal(active.status, 'active');
  assert.ok(active.days >= 20);

  const endingSoon = getOfferCountdown('2026-11-25', now);
  assert.equal(endingSoon.isExpired, false);
  assert.equal(endingSoon.status, 'ending-soon');
  assert.equal(endingSoon.days, 3);

  const expired = getOfferCountdown('2026-11-20', now);
  assert.equal(expired.isExpired, true);
  assert.equal(expired.status, 'expired');
  assert.equal(expired.days, 0);
});

test('getActiveOffers excludes inactive and expired offers', () => {
  const now = Date.parse('2026-11-22T12:00:00Z');
  const sampleOffers: OfferItem[] = [
    {
      id: '1',
      titleAr: 'عرض نشط',
      titleEn: 'Active Offer',
      descriptionAr: 'وصف',
      descriptionEn: 'Desc',
      discountLabelAr: '20%',
      discountLabelEn: '20%',
      expiresAt: '2026-12-31',
      serviceType: 'landscaping',
      imageUrl: '/a.jpg',
      active: true,
    },
    {
      id: '2',
      titleAr: 'عرض منتهي',
      titleEn: 'Expired Offer',
      descriptionAr: 'وصف',
      descriptionEn: 'Desc',
      discountLabelAr: '15%',
      discountLabelEn: '15%',
      expiresAt: '2026-11-01',
      serviceType: 'irrigation',
      imageUrl: '/b.jpg',
      active: true,
    },
    {
      id: '3',
      titleAr: 'عرض معطل',
      titleEn: 'Disabled Offer',
      descriptionAr: 'وصف',
      descriptionEn: 'Desc',
      discountLabelAr: '10%',
      discountLabelEn: '10%',
      expiresAt: '2026-12-31',
      serviceType: 'maintenance',
      imageUrl: '/c.jpg',
      active: false,
    },
  ];

  const active = getActiveOffers(sampleOffers, now);
  assert.equal(active.length, 1);
  assert.equal(active[0].id, '1');
});

test('filterProjectsByCategory filters accurately and supports all', () => {
  const projects: ProjectItem[] = [
    {
      id: 'p1',
      titleAr: 'أ',
      titleEn: 'A',
      category: 'landscaping',
      locationAr: 'القاهرة',
      locationEn: 'Cairo',
      summaryAr: 'ملخص',
      summaryEn: 'Summary',
      beforeImageUrl: '/1.jpg',
      afterImageUrl: '/2.jpg',
      featured: true,
    },
    {
      id: 'p2',
      titleAr: 'ب',
      titleEn: 'B',
      category: 'irrigation',
      locationAr: 'الجيزة',
      locationEn: 'Giza',
      summaryAr: 'ملخص',
      summaryEn: 'Summary',
      beforeImageUrl: '/3.jpg',
      afterImageUrl: '/4.jpg',
      featured: false,
    },
  ];

  assert.equal(filterProjectsByCategory(projects, 'all').length, 2);
  assert.equal(filterProjectsByCategory(projects, 'irrigation').length, 1);
  assert.equal(filterProjectsByCategory(projects, 'irrigation')[0].id, 'p2');
});

test('localizePriceLabel translates EGP and standard Arabic price strings for English view', () => {
  assert.equal(localizePriceLabel('3,600 ج.م', 'ar'), '3,600 ج.م');
  assert.equal(localizePriceLabel('3,600 ج.م', 'en'), '3,600 EGP');
  assert.equal(localizePriceLabel('باقة شاملة', 'en'), 'Turnkey Package');
  assert.equal(localizePriceLabel('حسب المساحة', 'en'), 'Based on Area');
});

