export type Language = 'ar' | 'en';

export type ProjectCategory =
  | 'landscaping'
  | 'plant-protection'
  | 'irrigation'
  | 'maintenance';

export type QuoteStatus =
  | 'new'
  | 'reviewing'
  | 'scheduled'
  | 'quoted'
  | 'completed';

export interface SiteContent {
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  heroImageUrl: string;
  heroImages?: string[];
  aboutSummaryAr: string;
  aboutSummaryEn: string;
  visionAr: string;
  visionEn: string;
  missionAr: string;
  missionEn: string;
  goalsAr: string[];
  goalsEn: string[];
  valuesAr: string[];
  valuesEn: string[];
  differentiatorsAr: string[];
  differentiatorsEn: string[];
  phones: string[];
  whatsappNumber: string;
  email: string;
  addressAr: string;
  addressEn: string;
  facebookUrl: string;
  tiktokUrl: string;
  instagramUrl?: string;
  coverageStatementAr?: string;
  coverageStatementEn?: string;
  availableAreasAr?: string;
  availableAreasEn?: string;
  googleSheetId?: string;
  googleSheetUrl?: string;
  googleDriveFolderId?: string;
  updatedAt?: unknown;
}

export interface AdminStats {
  totalVisits: number;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  order: number;
  slug: string;
  titleAr: string;
  titleEn: string;
  shortDescAr: string;
  shortDescEn: string;
  fullDescAr: string;
  fullDescEn: string;
  featuresAr: string[];
  featuresEn: string[];
  imageUrl: string;
  active: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ProjectItem {
  id: string;
  titleAr: string;
  titleEn: string;
  category: ProjectCategory;
  locationAr: string;
  locationEn: string;
  areaSqm?: number;
  summaryAr: string;
  summaryEn: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  featured: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface OfferItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  discountLabelAr: string;
  discountLabelEn: string;
  originalPrice?: string;
  offerPrice?: string;
  expiresAt: string;
  serviceType: string;
  imageUrl: string;
  active: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface QuoteAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  kind: 'image' | 'video';
  url: string;
}

export interface QuoteRequest {
  id: string;
  referenceCode: string;
  fullName: string;
  phone: string;
  email?: string;
  governorate: string;
  area: string;
  address: string;
  serviceType: string;
  projectAreaSqm?: number;
  description: string;
  offerId?: string;
  attachments: QuoteAttachment[];
  status: QuoteStatus;
  adminNotes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface TestimonialItem {
  id: string;
  authorNameAr: string;
  authorNameEn: string;
  roleAr: string;
  roleEn: string;
  organizationAr: string;
  organizationEn: string;
  locationAr: string;
  locationEn: string;
  serviceCategory: ProjectCategory;
  serviceLabelAr: string;
  serviceLabelEn: string;
  rating: number;
  beforeStateAr: string;
  beforeStateEn: string;
  outcomeAr: string;
  outcomeEn: string;
  quoteAr: string;
  quoteEn: string;
  dateLabel: string;
  source?: 'default' | 'visitor';
  createdAt?: unknown;
}

