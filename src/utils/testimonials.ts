import { ProjectCategory, TestimonialItem } from '../types';

export interface RatingSummary {
  averageRating: number;
  totalCount: number;
  fiveStarCount: number;
}

export interface ReviewFormInput {
  authorName: string;
  location?: string;
  serviceCategory: ProjectCategory;
  rating: number;
  comment: string;
}

export interface ReviewValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const VALID_REVIEW_CATEGORIES = new Set<ProjectCategory>([
  'plant-protection',
  'landscaping',
  'irrigation',
  'maintenance',
]);

export const SERVICE_CATEGORY_LABELS: Record<
  ProjectCategory,
  { ar: string; en: string }
> = {
  'plant-protection': {
    ar: 'وقاية النبات ومكافحة الآفات',
    en: 'Plant Protection & IPM',
  },
  landscaping: {
    ar: 'تصميم وتنفيذ اللاندسكيب',
    en: 'Landscape Design & Execution',
  },
  irrigation: {
    ar: 'تصميم وتنفيذ شبكات الري',
    en: 'Smart Irrigation Networks',
  },
  maintenance: {
    ar: 'صيانة الحدائق والتسميد',
    en: 'Periodic Maintenance & Nutrition',
  },
};

export function validateReviewInput(input: ReviewFormInput): ReviewValidationResult {
  const errors: Record<string, string> = {};

  const name = (input.authorName || '').trim();
  if (name.length < 2 || name.length > 100) {
    errors.authorName = 'invalid_author_name';
  }

  const location = (input.location || '').trim();
  if (location.length > 120) {
    errors.location = 'invalid_location';
  }

  if (!VALID_REVIEW_CATEGORIES.has(input.serviceCategory)) {
    errors.serviceCategory = 'invalid_category';
  }

  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = 'invalid_rating';
  }

  const comment = (input.comment || '').trim();
  if (comment.length < 8 || comment.length > 1200) {
    errors.comment = 'invalid_comment';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function buildTestimonialFromReviewInput(
  id: string,
  input: ReviewFormInput,
  now: Date = new Date()
): TestimonialItem {
  const cleanName = input.authorName.trim().slice(0, 100);
  const cleanLocation = (input.location || '').trim().slice(0, 120);
  const cleanComment = input.comment.trim().slice(0, 1200);
  const labels = SERVICE_CATEGORY_LABELS[input.serviceCategory];
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');

  return {
    id,
    authorNameAr: cleanName,
    authorNameEn: cleanName,
    roleAr: 'تقييم عميل',
    roleEn: 'Verified Client Review',
    organizationAr: 'خدمة ميدانية',
    organizationEn: 'Field Service',
    locationAr: cleanLocation || 'مصر',
    locationEn: cleanLocation || 'Egypt',
    serviceCategory: input.serviceCategory,
    serviceLabelAr: labels.ar,
    serviceLabelEn: labels.en,
    rating: Math.min(5, Math.max(1, Math.round(Number(input.rating)))),
    beforeStateAr: '',
    beforeStateEn: '',
    outcomeAr: '',
    outcomeEn: '',
    quoteAr: cleanComment,
    quoteEn: cleanComment,
    dateLabel: `${yyyy}-${mm}`,
    source: 'visitor',
    createdAt: now.toISOString(),
  };
}

export function mergeTestimonials(
  visitorReviews: TestimonialItem[],
  defaultTestimonials: TestimonialItem[]
): TestimonialItem[] {
  const seen = new Set<string>();
  const merged: TestimonialItem[] = [];
  for (const item of visitorReviews) {
    if (!item || !item.id || seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }
  for (const item of defaultTestimonials) {
    if (!item || !item.id || seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }
  return merged;
}

export function calculateRatingSummary(testimonials: TestimonialItem[]): RatingSummary {
  if (testimonials.length === 0) {
    return {
      averageRating: 0,
      totalCount: 0,
      fiveStarCount: 0,
    };
  }

  const total = testimonials.reduce((sum, item) => sum + item.rating, 0);
  const averageRating = Math.round((total / testimonials.length) * 10) / 10;
  const fiveStarCount = testimonials.filter((item) => item.rating >= 4.9).length;

  return {
    averageRating,
    totalCount: testimonials.length,
    fiveStarCount,
  };
}

export function filterTestimonialsByCategory(
  testimonials: TestimonialItem[],
  category: 'all' | ProjectCategory
): TestimonialItem[] {
  if (category === 'all') return testimonials;
  return testimonials.filter((item) => item.serviceCategory === category);
}
