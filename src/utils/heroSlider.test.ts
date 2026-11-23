import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampHeroSlideIndex,
  nextHeroSlideIndex,
  prevHeroSlideIndex,
  reorderHeroImages,
  resolveHeroImages,
} from './heroSlider';

test('resolveHeroImages deduplicates valid URLs, filters unsafe URLs, and falls back gracefully', () => {
  const result = resolveHeroImages(
    [
      '/src/assets/images/hero.jpg',
      'javascript:alert(1)',
      '/src/assets/images/hero.jpg',
      'https://example.com/garden.jpg',
      '   ',
    ],
    '/fallback.jpg',
    '/default.jpg'
  );
  assert.deepEqual(result, [
    '/src/assets/images/hero.jpg',
    'https://example.com/garden.jpg',
  ]);

  assert.deepEqual(resolveHeroImages([], '/single-hero.jpg', '/default.jpg'), ['/single-hero.jpg']);
  assert.deepEqual(resolveHeroImages(undefined, '', '/default.jpg'), ['/default.jpg']);
});

test('nextHeroSlideIndex and prevHeroSlideIndex wrap cleanly around total slide count', () => {
  assert.equal(nextHeroSlideIndex(0, 4), 1);
  assert.equal(nextHeroSlideIndex(3, 4), 0);
  assert.equal(prevHeroSlideIndex(0, 4), 3);
  assert.equal(prevHeroSlideIndex(2, 4), 1);
  assert.equal(clampHeroSlideIndex(5, 4), 1);
  assert.equal(nextHeroSlideIndex(0, 1), 0);
});

test('reorderHeroImages moves items cleanly within bounds', () => {
  const list = ['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg'];
  assert.deepEqual(reorderHeroImages(list, 2, 0), ['c.jpg', 'a.jpg', 'b.jpg', 'd.jpg']);
  assert.deepEqual(reorderHeroImages(list, 0, 9), list);
});
