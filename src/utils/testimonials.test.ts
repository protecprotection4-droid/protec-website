import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_TESTIMONIALS } from '../data/protecDefaults';
import {
  buildTestimonialFromReviewInput,
  calculateRatingSummary,
  filterTestimonialsByCategory,
  mergeTestimonials,
  validateReviewInput,
} from './testimonials';

test('calculateRatingSummary handles populated and empty testimonial arrays', () => {
  const empty = calculateRatingSummary([]);
  assert.deepEqual(empty, {
    averageRating: 0,
    totalCount: 0,
    fiveStarCount: 0,
  });

  const summary = calculateRatingSummary(DEFAULT_TESTIMONIALS);
  assert.equal(summary.totalCount, 4);
  assert.equal(summary.averageRating, 5.0);
  assert.equal(summary.fiveStarCount, 3);
});

test('filterTestimonialsByCategory filters cleanly by serviceCategory', () => {
  assert.equal(filterTestimonialsByCategory(DEFAULT_TESTIMONIALS, 'all').length, 4);
  const irrigation = filterTestimonialsByCategory(DEFAULT_TESTIMONIALS, 'irrigation');
  assert.equal(irrigation.length, 1);
  assert.equal(irrigation[0].id, 'rev-smart-irrigation-katameya');
});

test('validateReviewInput checks name, rating bounds, category, and comment length', () => {
  const bad = validateReviewInput({
    authorName: 'A',
    location: 'Cairo',
    serviceCategory: 'landscaping',
    rating: 6,
    comment: 'short',
  });
  assert.equal(bad.valid, false);
  assert.equal(bad.errors.authorName, 'invalid_author_name');
  assert.equal(bad.errors.rating, 'invalid_rating');
  assert.equal(bad.errors.comment, 'invalid_comment');

  const good = validateReviewInput({
    authorName: 'م. كريم عادل',
    location: 'التجمع الخامس',
    serviceCategory: 'irrigation',
    rating: 5,
    comment: 'خدمة ممتازة والتزام رائع في تنفيذ شبكة الري الأوتوماتيكية.',
  });
  assert.equal(good.valid, true);
  assert.deepEqual(good.errors, {});
});

test('buildTestimonialFromReviewInput and mergeTestimonials build and deduplicate visitor reviews', () => {
  const built = buildTestimonialFromReviewInput(
    'rev-visitor-1',
    {
      authorName: 'سارة محمود',
      location: 'الشيخ زايد',
      serviceCategory: 'plant-protection',
      rating: 4,
      comment: 'تشخيص دقيق وسريع لمشكلة النخيل مع رش آمن بدون رائحة.',
    },
    new Date('2026-11-22T10:00:00.000Z')
  );

  assert.equal(built.id, 'rev-visitor-1');
  assert.equal(built.rating, 4);
  assert.equal(built.source, 'visitor');
  assert.equal(built.dateLabel, '2026-11');
  assert.equal(built.beforeStateAr, '');
  assert.equal(built.outcomeAr, '');

  const merged = mergeTestimonials([built, built], DEFAULT_TESTIMONIALS);
  assert.equal(merged.length, DEFAULT_TESTIMONIALS.length + 1);
  assert.equal(merged[0].id, 'rev-visitor-1');
});
