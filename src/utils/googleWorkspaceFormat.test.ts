import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildQuoteSheetValues,
  buildReviewSheetValues,
  columnIndexToA1,
  extractSpreadsheetIdFromInput,
  formatA1SheetRange,
  isExpectedWorkspaceAccount,
  PRIMARY_WORKSPACE_EMAIL,
} from './googleWorkspaceFormat';
import { QuoteRequest, TestimonialItem } from '../types';

test('isExpectedWorkspaceAccount matches protecprotection4@gmail.com case-insensitively', () => {
  assert.equal(isExpectedWorkspaceAccount(PRIMARY_WORKSPACE_EMAIL), true);
  assert.equal(isExpectedWorkspaceAccount('  PROTECPROTECTION4@GMAIL.COM '), true);
  assert.equal(isExpectedWorkspaceAccount('other@gmail.com'), false);
  assert.equal(isExpectedWorkspaceAccount(null), false);
});

test('extractSpreadsheetIdFromInput extracts ID from URLs and raw IDs', () => {
  assert.equal(
    extractSpreadsheetIdFromInput(
      'https://docs.google.com/spreadsheets/d/1AbCdefGHijKLmnopQRstuVWxyZ_0123456789/edit#gid=0'
    ),
    '1AbCdefGHijKLmnopQRstuVWxyZ_0123456789'
  );
  assert.equal(
    extractSpreadsheetIdFromInput('1AbCdefGHijKLmnopQRstuVWxyZ_0123456789'),
    '1AbCdefGHijKLmnopQRstuVWxyZ_0123456789'
  );
  assert.equal(extractSpreadsheetIdFromInput('short'), null);
  assert.equal(extractSpreadsheetIdFromInput('https://example.com/bad'), null);
});

test('columnIndexToA1 and formatA1SheetRange quote sheet names safely', () => {
  assert.equal(columnIndexToA1(1), 'A');
  assert.equal(columnIndexToA1(14), 'N');
  assert.equal(columnIndexToA1(27), 'AA');
  assert.equal(formatA1SheetRange('Quote Requests', 10, 14), "'Quote Requests'!A1:N10");
  assert.equal(formatA1SheetRange("Client's Log", 5, 12), "'Client''s Log'!A1:L5");
});

test('buildQuoteSheetValues formats header, phone zero preservation, and formula escaping', () => {
  const quotes: QuoteRequest[] = [
    {
      id: 'q-1',
      referenceCode: 'PRT-20261123-ABCD',
      fullName: 'أحمد علي',
      phone: '01036084725',
      email: 'client@example.com',
      governorate: 'دمياط',
      area: 'رأس البر',
      address: 'شارع النيل',
      serviceType: 'plant-protection',
      projectAreaSqm: 350,
      description: '=SUM(A1:A2)',
      attachments: [],
      status: 'new',
      adminNotes: '+urgent',
      createdAt: '2026-11-23T10:00:00.000Z',
    },
  ];

  const rows = buildQuoteSheetValues(quotes);
  assert.equal(rows.length, 2);
  assert.equal(rows[0][0], 'Reference Code');
  assert.equal(rows[1][0], 'PRT-20261123-ABCD');
  assert.equal(rows[1][4], "'01036084725");
  assert.equal(rows[1][11], "'=SUM(A1:A2)");
  assert.equal(rows[1][12], "'+urgent");
  assert.equal(rows[1][13], '0');
});

test('buildReviewSheetValues outputs header and review rows cleanly', () => {
  const reviews: TestimonialItem[] = [
    {
      id: 'rev-1',
      authorNameAr: 'م. طارق',
      authorNameEn: 'Eng. Tarek',
      roleAr: '',
      roleEn: '',
      organizationAr: '',
      organizationEn: '',
      locationAr: 'دمياط',
      locationEn: 'Damietta',
      serviceCategory: 'plant-protection',
      serviceLabelAr: 'وقاية النبات',
      serviceLabelEn: 'Plant Protection',
      rating: 5,
      beforeStateAr: '',
      beforeStateEn: '',
      outcomeAr: '',
      outcomeEn: '',
      quoteAr: 'خدمة ممتازة وتشخيص دقيق للآفات.',
      quoteEn: 'Excellent service and accurate pest diagnosis.',
      dateLabel: '2026-11',
      source: 'visitor',
    },
  ];

  const rows = buildReviewSheetValues(reviews);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].length, 12);
  assert.equal(rows[1][2], 'visitor');
  assert.equal(rows[1][3], '5');
});
