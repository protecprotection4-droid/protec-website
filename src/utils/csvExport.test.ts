import assert from 'node:assert/strict';
import test from 'node:test';
import { QuoteRequest, TestimonialItem } from '../types';
import { buildQuotesCsv, buildReviewsCsv, escapeCsvCell } from './csvExport';

test('escapeCsvCell neutralizes spreadsheet formula prefixes and escapes quotes', () => {
  assert.equal(escapeCsvCell('=SUM(A1:A2)'), `"'=SUM(A1:A2)"`);
  assert.equal(escapeCsvCell('+123'), `"'+123"`);
  assert.equal(escapeCsvCell('-cmd'), `"'-cmd"`);
  assert.equal(escapeCsvCell('@evil'), `"'@evil"`);
  assert.equal(escapeCsvCell('He said "Hi", friend'), `"He said ""Hi"", friend"`);
  assert.equal(escapeCsvCell('بروتيك، دمياط'), `"بروتيك، دمياط"`);
});

test('buildQuotesCsv emits UTF-8 BOM, headers, and quote rows accurately', () => {
  const quotes: QuoteRequest[] = [
    {
      id: 'q-1',
      referenceCode: 'PRT-20261123-ABCD',
      fullName: 'أحمد محمود',
      phone: '01012345678',
      email: 'ahmed@example.com',
      governorate: 'دمياط',
      area: 'دمياط الجديدة',
      address: 'الحي الأول',
      serviceType: 'landscape-design',
      projectAreaSqm: 280,
      description: 'تنسيق حديقة فيلا',
      attachments: [],
      status: 'new',
      adminNotes: 'متابعة',
      createdAt: '2026-11-23T10:00:00.000Z',
    },
  ];

  const csv = buildQuotesCsv(quotes);
  assert.ok(csv.startsWith('\uFEFF'), 'Must include UTF-8 BOM for Arabic Excel');
  assert.ok(csv.includes('"Reference Code","Full Name","Phone"'));
  assert.ok(csv.includes('"PRT-20261123-ABCD","أحمد محمود","01012345678"'));
  assert.ok(csv.includes('"دمياط","دمياط الجديدة"'));
});

test('buildReviewsCsv emits UTF-8 BOM and review fields accurately', () => {
  const reviews: TestimonialItem[] = [
    {
      id: 'rev-1',
      authorNameAr: 'م. طارق الشناوي',
      authorNameEn: 'Eng. Tarek',
      roleAr: 'مدير مرافق',
      roleEn: 'Facilities Manager',
      organizationAr: 'بالم هيلز',
      organizationEn: 'Palm Hills',
      locationAr: 'المنصورة',
      locationEn: 'Mansoura',
      serviceCategory: 'plant-protection',
      serviceLabelAr: 'وقاية النبات',
      serviceLabelEn: 'Plant Protection',
      rating: 5,
      beforeStateAr: '',
      beforeStateEn: '',
      outcomeAr: '',
      outcomeEn: '',
      quoteAr: 'خدمة ممتازة وتشخيص علمي',
      quoteEn: 'Excellent scientific diagnosis',
      dateLabel: '2026-11',
      source: 'visitor',
    },
  ];

  const csv = buildReviewsCsv(reviews);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('"ID","Author (AR)","Author (EN)"'));
  assert.ok(csv.includes('"rev-1","م. طارق الشناوي","Eng. Tarek"'));
  assert.ok(csv.includes('"visitor"'));
});
