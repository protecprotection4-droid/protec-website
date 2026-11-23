import { isSafeHttpOrLocalUrl } from './validation';

export const MAX_HERO_SLIDES = 8;

export function resolveHeroImages(
  heroImages: string[] | undefined,
  heroImageUrl: string | undefined,
  fallbackUrl: string
): string[] {
  const seen = new Set<string>();
  const resolved: string[] = [];

  if (Array.isArray(heroImages)) {
    for (const raw of heroImages) {
      if (typeof raw !== 'string') continue;
      const trimmed = raw.trim();
      if (!trimmed || !isSafeHttpOrLocalUrl(trimmed) || seen.has(trimmed)) continue;
      seen.add(trimmed);
      resolved.push(trimmed);
      if (resolved.length >= MAX_HERO_SLIDES) break;
    }
  }

  if (resolved.length === 0 && typeof heroImageUrl === 'string') {
    const trimmed = heroImageUrl.trim();
    if (trimmed && isSafeHttpOrLocalUrl(trimmed)) {
      resolved.push(trimmed);
    }
  }

  if (resolved.length === 0 && fallbackUrl) {
    resolved.push(fallbackUrl);
  }

  return resolved;
}

export function clampHeroSlideIndex(index: number, total: number): number {
  if (!Number.isFinite(total) || total <= 1) return 0;
  const floored = Math.floor(index);
  return ((floored % total) + total) % total;
}

export function nextHeroSlideIndex(currentIndex: number, total: number): number {
  if (!Number.isFinite(total) || total <= 1) return 0;
  return clampHeroSlideIndex(currentIndex + 1, total);
}

export function prevHeroSlideIndex(currentIndex: number, total: number): number {
  if (!Number.isFinite(total) || total <= 1) return 0;
  return clampHeroSlideIndex(currentIndex - 1, total);
}

export function reorderHeroImages(
  images: string[],
  fromIndex: number,
  toIndex: number
): string[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= images.length ||
    toIndex >= images.length ||
    fromIndex === toIndex
  ) {
    return images;
  }
  const copy = [...images];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
}
