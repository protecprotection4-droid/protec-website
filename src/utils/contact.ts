import { Language } from '../types';

export function normalizeWhatsAppNumber(rawNumber: string): string {
  const digits = rawNumber.replace(/[^0-9]/g, '');
  if (!digits) {
    return '';
  }
  // Normalize Egyptian 11-digit local mobile format (01XXXXXXXXX) to international 201XXXXXXXXX
  if (digits.length === 11 && digits.startsWith('01')) {
    return `2${digits}`;
  }
  return digits;
}

export function buildWhatsAppUrl(
  rawNumber: string,
  lang: Language,
  customMessage?: string
): string | null {
  const normalized = normalizeWhatsAppNumber(rawNumber);
  if (!normalized) {
    return null;
  }

  const defaultMessage =
    lang === 'ar'
      ? 'مرحباً فريق Protec، أود الاستفسار عن خدمات وقاية النبات واللاندسكيب.'
      : 'Hello Protec team, I would like to inquire about your plant protection and landscaping services.';

  const text = (customMessage ?? defaultMessage).trim();
  if (!text) {
    return `https://wa.me/${normalized}`;
  }

  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}
