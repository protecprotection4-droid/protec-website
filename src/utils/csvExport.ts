import { QuoteRequest, TestimonialItem } from '../types';

const FORMULA_PREFIX_REGEX = /^[=+\-@\t\r]/;

export function escapeCsvCell(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value);
  const cleaned = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const safe = FORMULA_PREFIX_REGEX.test(cleaned) ? `'${cleaned}` : cleaned;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function buildCsvDocument(headers: string[], rows: unknown[][]): string {
  const lines = [
    headers.map((h) => escapeCsvCell(h)).join(','),
    ...rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(',')),
  ];
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

function formatCreatedAtValue(createdAt: unknown): string {
  if (typeof createdAt === 'string') return createdAt;
  if (createdAt && typeof createdAt === 'object' && 'toDate' in createdAt) {
    const fn = (createdAt as { toDate?: () => Date }).toDate;
    if (typeof fn === 'function') {
      return fn.call(createdAt).toISOString();
    }
  }
  return '';
}

export function buildQuotesCsv(quotes: QuoteRequest[]): string {
  const headers = [
    'Reference Code',
    'Full Name',
    'Phone',
    'Email',
    'Governorate',
    'Area',
    'Address',
    'Service Type',
    'Project Area (sqm)',
    'Description',
    'Status',
    'Admin Notes',
    'Attachments Count',
    'Created At',
  ];

  const rows = quotes.map((q) => [
    q.referenceCode,
    q.fullName,
    q.phone,
    q.email || '',
    q.governorate,
    q.area,
    q.address,
    q.serviceType,
    q.projectAreaSqm ?? '',
    q.description || '',
    q.status,
    q.adminNotes || '',
    q.attachments?.length || 0,
    formatCreatedAtValue(q.createdAt),
  ]);

  return buildCsvDocument(headers, rows);
}

export function buildReviewsCsv(reviews: TestimonialItem[]): string {
  const headers = [
    'ID',
    'Author (AR)',
    'Author (EN)',
    'Role (AR)',
    'Organization (AR)',
    'Location (AR)',
    'Location (EN)',
    'Service Category',
    'Rating',
    'Quote (AR)',
    'Quote (EN)',
    'Date Label',
    'Source',
  ];

  const rows = reviews.map((r) => [
    r.id,
    r.authorNameAr,
    r.authorNameEn,
    r.roleAr || '',
    r.organizationAr || '',
    r.locationAr || '',
    r.locationEn || '',
    r.serviceCategory,
    r.rating,
    r.quoteAr,
    r.quoteEn,
    r.dateLabel,
    r.source || 'default',
  ]);

  return buildCsvDocument(headers, rows);
}

export function downloadCsvFile(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
