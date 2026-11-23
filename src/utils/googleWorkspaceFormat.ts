import { QuoteRequest, TestimonialItem } from '../types';

export const PRIMARY_WORKSPACE_EMAIL = 'protecprotection4@gmail.com';

export function isExpectedWorkspaceAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === PRIMARY_WORKSPACE_EMAIL;
}

export function extractSpreadsheetIdFromInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Match full Google Sheets / Drive URLs like:
  // https://docs.google.com/spreadsheets/d/1abcDef_12345/edit#gid=0
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]{10,128})/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  // Raw ID fallback
  if (/^[a-zA-Z0-9_-]{12,128}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function columnIndexToA1(colNumber: number): string {
  let n = Math.max(1, Math.floor(colNumber));
  let result = '';
  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

export function formatA1SheetRange(
  sheetTitle: string,
  rowCount: number,
  colCount: number
): string {
  const escapedTitle = sheetTitle.replace(/'/g, "''");
  const safeRows = Math.max(1, Math.floor(rowCount));
  const endCol = columnIndexToA1(Math.max(1, Math.floor(colCount)));
  return `'${escapedTitle}'!A1:${endCol}${safeRows}`;
}

function formatTimestampIso(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'toDate' in value) {
    const fn = (value as { toDate?: () => Date }).toDate;
    if (typeof fn === 'function') {
      return fn.call(value).toISOString();
    }
  }
  return '';
}

function sanitizeSheetCell(value: unknown): string {
  const str = String(value ?? '').replace(/\r\n/g, '\n');
  // Prevent accidental formula evaluation from user-entered strings in Google Sheets USER_ENTERED mode
  if (/^[=+\-@]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export function buildQuoteSheetValues(quotes: QuoteRequest[]): string[][] {
  const header = [
    'Reference Code',
    'Created At',
    'Status',
    'Full Name',
    'Phone',
    'Email',
    'Governorate',
    'Area',
    'Address',
    'Service Type',
    'Area (m2)',
    'Project Details',
    'Admin Notes',
    'Attachments Count',
  ];

  const rows = quotes.map((q) => [
    sanitizeSheetCell(q.referenceCode),
    sanitizeSheetCell(formatTimestampIso(q.createdAt)),
    sanitizeSheetCell(q.status),
    sanitizeSheetCell(q.fullName),
    // Keep leading zero on Egyptian phone numbers by prefixing apostrophe
    q.phone ? `'${q.phone.trim()}` : '',
    sanitizeSheetCell(q.email || ''),
    sanitizeSheetCell(q.governorate),
    sanitizeSheetCell(q.area),
    sanitizeSheetCell(q.address),
    sanitizeSheetCell(q.serviceType),
    q.projectAreaSqm !== undefined && q.projectAreaSqm !== null ? String(q.projectAreaSqm) : '',
    sanitizeSheetCell(q.description || ''),
    sanitizeSheetCell(q.adminNotes || ''),
    String(Array.isArray(q.attachments) ? q.attachments.length : 0),
  ]);

  return [header, ...rows];
}

export function buildReviewSheetValues(reviews: TestimonialItem[]): string[][] {
  const header = [
    'ID',
    'Date',
    'Source',
    'Rating',
    'Author (AR)',
    'Author (EN)',
    'Service (AR)',
    'Service (EN)',
    'Location (AR)',
    'Location (EN)',
    'Quote (AR)',
    'Quote (EN)',
  ];

  const rows = reviews.map((r) => [
    sanitizeSheetCell(r.id),
    sanitizeSheetCell(r.dateLabel),
    sanitizeSheetCell(r.source || 'default'),
    String(r.rating),
    sanitizeSheetCell(r.authorNameAr),
    sanitizeSheetCell(r.authorNameEn),
    sanitizeSheetCell(r.serviceLabelAr),
    sanitizeSheetCell(r.serviceLabelEn),
    sanitizeSheetCell(r.locationAr || ''),
    sanitizeSheetCell(r.locationEn || ''),
    sanitizeSheetCell(r.quoteAr),
    sanitizeSheetCell(r.quoteEn),
  ]);

  return [header, ...rows];
}
