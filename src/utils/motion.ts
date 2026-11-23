export const SCROLL_REVEAL_THRESHOLD = 0.01;

export function clampRevealDelayMs(delayMs = 0): number {
  if (!Number.isFinite(delayMs) || delayMs <= 0) {
    return 0;
  }
  return Math.min(Math.round(delayMs), 400);
}

export function getScrollRevealClasses(isVisible: boolean): string {
  const base =
    'transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0';
  const state = isVisible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-3';

  return `${base} ${state}`;
}
