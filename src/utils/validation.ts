import { ProjectCategory, QuoteAttachment } from '../types';

export interface QuoteFormInput {
  fullName: string;
  phone: string;
  email?: string;
  governorate: string;
  area: string;
  address: string;
  serviceType: string;
  projectAreaSqm?: string | number;
  description: string;
  offerId?: string;
  attachments: QuoteAttachment[];
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const REFERENCE_CODE_REGEX = /^[A-Z0-9-]+$/;
const SLUG_REGEX = /^[a-z0-9-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+0-9\s()-]{7,30}$/;

export function isSafeHttpOrLocalUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 500) return false;
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//');
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function generateReferenceCode(now: Date = new Date(), suffix?: string): string {
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const rand =
    suffix && REFERENCE_CODE_REGEX.test(suffix)
      ? suffix
      : Math.random().toString(36).slice(2, 6).toUpperCase();
  const code = `PRT-${yyyy}${mm}${dd}-${rand}`;
  return code.slice(0, 32);
}

export function validateQuoteInput(input: QuoteFormInput): ValidationResult {
  const errors: Record<string, string> = {};

  const fullName = input.fullName.trim();
  if (fullName.length < 2 || fullName.length > 120) {
    errors.fullName = 'invalid_full_name';
  }

  const phone = input.phone.trim();
  if (!PHONE_REGEX.test(phone)) {
    errors.phone = 'invalid_phone';
  }

  const email = (input.email ?? '').trim();
  if (email.length > 0 && (email.length > 150 || !EMAIL_REGEX.test(email))) {
    errors.email = 'invalid_email';
  }

  const governorate = input.governorate.trim();
  if (governorate.length < 2 || governorate.length > 80) {
    errors.governorate = 'invalid_governorate';
  }

  const area = input.area.trim();
  if (area.length < 1 || area.length > 120) {
    errors.area = 'invalid_area';
  }

  const address = input.address.trim();
  if (address.length < 2 || address.length > 240) {
    errors.address = 'invalid_address';
  }

  const serviceType = input.serviceType.trim();
  if (serviceType.length < 2 || serviceType.length > 100) {
    errors.serviceType = 'invalid_service_type';
  }

  if (
    input.projectAreaSqm !== undefined &&
    input.projectAreaSqm !== '' &&
    input.projectAreaSqm !== null
  ) {
    const parsedArea = Number(input.projectAreaSqm);
    if (!Number.isFinite(parsedArea) || parsedArea < 0 || parsedArea > 10_000_000) {
      errors.projectAreaSqm = 'invalid_project_area';
    }
  }

  const description = (input.description ?? '').trim();
  if (description.length > 3000) {
    errors.description = 'invalid_description';
  }

  if (input.attachments.length > 10) {
    errors.attachments = 'too_many_attachments';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateServiceInput(input: {
  slug: string;
  titleAr: string;
  titleEn: string;
  shortDescAr: string;
  shortDescEn: string;
  fullDescAr: string;
  fullDescEn: string;
  imageUrl: string;
  order: number;
}): ValidationResult {
  const errors: Record<string, string> = {};
  if (!SLUG_REGEX.test(input.slug.trim()) || input.slug.trim().length < 2 || input.slug.trim().length > 80) {
    errors.slug = 'invalid_slug';
  }
  if (input.titleAr.trim().length < 2 || input.titleAr.trim().length > 140) errors.titleAr = 'invalid_title_ar';
  if (input.titleEn.trim().length < 2 || input.titleEn.trim().length > 140) errors.titleEn = 'invalid_title_en';
  if (input.shortDescAr.trim().length < 5 || input.shortDescAr.trim().length > 320) errors.shortDescAr = 'invalid_short_ar';
  if (input.shortDescEn.trim().length < 5 || input.shortDescEn.trim().length > 320) errors.shortDescEn = 'invalid_short_en';
  if (input.fullDescAr.trim().length < 10 || input.fullDescAr.trim().length > 2000) errors.fullDescAr = 'invalid_full_ar';
  if (input.fullDescEn.trim().length < 10 || input.fullDescEn.trim().length > 2000) errors.fullDescEn = 'invalid_full_en';
  if (!isSafeHttpOrLocalUrl(input.imageUrl)) errors.imageUrl = 'invalid_image_url';
  if (!Number.isFinite(input.order) || input.order < 0 || input.order > 1000) errors.order = 'invalid_order';

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateProjectInput(input: {
  titleAr: string;
  titleEn: string;
  category: ProjectCategory;
  locationAr: string;
  locationEn: string;
  summaryAr: string;
  summaryEn: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  areaSqm?: number;
}): ValidationResult {
  const errors: Record<string, string> = {};
  const validCats: ProjectCategory[] = ['landscaping', 'plant-protection', 'irrigation', 'maintenance'];
  if (!validCats.includes(input.category)) errors.category = 'invalid_category';
  if (input.titleAr.trim().length < 2 || input.titleAr.trim().length > 160) errors.titleAr = 'invalid_title_ar';
  if (input.titleEn.trim().length < 2 || input.titleEn.trim().length > 160) errors.titleEn = 'invalid_title_en';
  if (input.locationAr.trim().length < 2 || input.locationAr.trim().length > 120) errors.locationAr = 'invalid_location_ar';
  if (input.locationEn.trim().length < 2 || input.locationEn.trim().length > 120) errors.locationEn = 'invalid_location_en';
  if (input.summaryAr.trim().length < 5 || input.summaryAr.trim().length > 800) errors.summaryAr = 'invalid_summary_ar';
  if (input.summaryEn.trim().length < 5 || input.summaryEn.trim().length > 800) errors.summaryEn = 'invalid_summary_en';
  if (!isSafeHttpOrLocalUrl(input.beforeImageUrl)) errors.beforeImageUrl = 'invalid_before_image';
  if (!isSafeHttpOrLocalUrl(input.afterImageUrl)) errors.afterImageUrl = 'invalid_after_image';
  if (input.areaSqm !== undefined && (!Number.isFinite(input.areaSqm) || input.areaSqm < 0 || input.areaSqm > 10_000_000)) {
    errors.areaSqm = 'invalid_area';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateOfferInput(input: {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  discountLabelAr: string;
  discountLabelEn: string;
  expiresAt: string;
  serviceType: string;
  imageUrl: string;
}): ValidationResult {
  const errors: Record<string, string> = {};
  if (input.titleAr.trim().length < 2 || input.titleAr.trim().length > 160) errors.titleAr = 'invalid_title_ar';
  if (input.titleEn.trim().length < 2 || input.titleEn.trim().length > 160) errors.titleEn = 'invalid_title_en';
  if (input.descriptionAr.trim().length < 5 || input.descriptionAr.trim().length > 1000) errors.descriptionAr = 'invalid_desc_ar';
  if (input.descriptionEn.trim().length < 5 || input.descriptionEn.trim().length > 1000) errors.descriptionEn = 'invalid_desc_en';
  if (input.discountLabelAr.trim().length < 1 || input.discountLabelAr.trim().length > 60) errors.discountLabelAr = 'invalid_discount_ar';
  if (input.discountLabelEn.trim().length < 1 || input.discountLabelEn.trim().length > 60) errors.discountLabelEn = 'invalid_discount_en';
  if (input.expiresAt.trim().length < 10 || input.expiresAt.trim().length > 30) errors.expiresAt = 'invalid_expires_at';
  if (input.serviceType.trim().length < 2 || input.serviceType.trim().length > 80) errors.serviceType = 'invalid_service_type';
  if (!isSafeHttpOrLocalUrl(input.imageUrl)) errors.imageUrl = 'invalid_image_url';
  return { valid: Object.keys(errors).length === 0, errors };
}
