import { OfferItem, ProjectCategory, ProjectItem } from '../types';

export interface OfferCountdown {
  isExpired: boolean;
  days: number;
  hours: number;
  minutes: number;
  status: 'active' | 'ending-soon' | 'expired';
}

export function getOfferCountdown(expiresAtIso: string, nowMs: number = Date.now()): OfferCountdown {
  const normalized = expiresAtIso.length === 10 ? `${expiresAtIso}T23:59:59Z` : expiresAtIso;
  const targetMs = Date.parse(normalized);

  if (Number.isNaN(targetMs) || targetMs <= nowMs) {
    return {
      isExpired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      status: 'expired',
    };
  }

  const diffMs = targetMs - nowMs;
  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return {
    isExpired: false,
    days,
    hours,
    minutes,
    status: days <= 5 ? 'ending-soon' : 'active',
  };
}

export function getActiveOffers(offers: OfferItem[], nowMs: number = Date.now()): OfferItem[] {
  return offers.filter((offer) => {
    if (!offer.active) return false;
    return !getOfferCountdown(offer.expiresAt, nowMs).isExpired;
  });
}

export function filterProjectsByCategory(
  projects: ProjectItem[],
  category: 'all' | ProjectCategory
): ProjectItem[] {
  if (category === 'all') return projects;
  return projects.filter((p) => p.category === category);
}

export function localizePriceLabel(raw: string | undefined, lang: 'ar' | 'en'): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (lang === 'ar') return trimmed;

  if (trimmed === 'باقة شاملة') return 'Turnkey Package';
  if (trimmed === 'حسب المساحة') return 'Based on Area';
  return trimmed.replace(/ج\.م/g, 'EGP').trim();
}

