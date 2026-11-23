import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampRevealDelayMs,
  getScrollRevealClasses,
  SCROLL_REVEAL_THRESHOLD,
} from './motion';

test('clampRevealDelayMs clamps negative, NaN, and excessive millisecond delays safely', () => {
  assert.equal(clampRevealDelayMs(0), 0);
  assert.equal(clampRevealDelayMs(-120), 0);
  assert.equal(clampRevealDelayMs(Number.NaN), 0);
  assert.equal(clampRevealDelayMs(80), 80);
  assert.equal(clampRevealDelayMs(1500), 400);
});

test('getScrollRevealClasses outputs compositor-only Tailwind fade/translate classes and reduced-motion safeguards', () => {
  assert.equal(SCROLL_REVEAL_THRESHOLD, 0.01);

  const hidden = getScrollRevealClasses(false);
  assert.match(hidden, /\bopacity-0\b/);
  assert.match(hidden, /\btranslate-y-3\b/);
  assert.match(hidden, /motion-reduce:opacity-100/);

  const visible = getScrollRevealClasses(true);
  assert.match(visible, /\bopacity-100\b/);
  assert.match(visible, /\btranslate-y-0\b/);
});
