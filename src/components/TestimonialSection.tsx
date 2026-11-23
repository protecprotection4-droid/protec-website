import React, { useState } from 'react';
import { CheckCircle2, Loader2, MessageSquarePlus, Star } from 'lucide-react';
import { submitReviewToServer } from '../lib/adminApi';
import { Language, ProjectCategory, TestimonialItem } from '../types';
import {
  calculateRatingSummary,
  filterTestimonialsByCategory,
  validateReviewInput,
} from '../utils/testimonials';
import { ScrollReveal } from './ScrollReveal';

interface TestimonialSectionProps {
  lang: Language;
  testimonials: TestimonialItem[];
  onReviewAdded: (review: TestimonialItem) => void;
}

export const TestimonialSection: React.FC<TestimonialSectionProps> = ({
  lang,
  testimonials,
  onReviewAdded,
}) => {
  const isAr = lang === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProjectCategory>('all');

  // Interactive Rating & Write-a-Review state
  const [authorName, setAuthorName] = useState('');
  const [location, setLocation] = useState('');
  const [serviceCategory, setServiceCategory] = useState<ProjectCategory>('plant-protection');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedReview, setSubmittedReview] = useState<TestimonialItem | null>(null);

  const summary = calculateRatingSummary(testimonials);
  const filtered = filterTestimonialsByCategory(testimonials, selectedCategory);

  const filterTabs: { id: 'all' | ProjectCategory; labelAr: string; labelEn: string }[] = [
    { id: 'all', labelAr: 'جميع التقييمات', labelEn: 'All Reviews' },
    { id: 'plant-protection', labelAr: 'وقاية النبات', labelEn: 'Plant Protection' },
    { id: 'landscaping', labelAr: 'اللاندسكيب', labelEn: 'Landscaping' },
    { id: 'irrigation', labelAr: 'شبكات الري', labelEn: 'Irrigation' },
    { id: 'maintenance', labelAr: 'الصيانة الدورية', labelEn: 'Maintenance' },
  ];

  const ratingLabelsAr: Record<number, string> = {
    1: 'ضعيف',
    2: 'مقبول',
    3: 'جيد',
    4: 'جيد جداً',
    5: 'ممتاز',
  };
  const ratingLabelsEn: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  const renderStars = (score: number) => {
    const fullCount = Math.round(score);
    return (
      <div
        className="flex items-center gap-0.5"
        aria-label={isAr ? `تقييم ${score} من 5` : `Rated ${score} out of 5`}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const filled = starIndex <= fullCount;
          return (
            <Star
              key={starIndex}
              className={`w-4 h-4 ${
                filled
                  ? 'fill-[#65B32E] text-[#65B32E]'
                  : 'fill-transparent text-[#C4D4C8] dark:text-[#3A5342]'
              }`}
              aria-hidden="true"
            />
          );
        })}
      </div>
    );
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmittedReview(null);

    const validation = validateReviewInput({
      authorName,
      location,
      serviceCategory,
      rating,
      comment,
    });

    if (!validation.valid) {
      if (validation.errors.authorName) {
        setFormError(
          isAr
            ? 'يرجى كتابة الاسم (حرفان على الأقل).'
            : 'Please enter your name (at least 2 characters).'
        );
      } else if (validation.errors.comment) {
        setFormError(
          isAr
            ? 'يرجى كتابة تقييمك أو رأيك (8 أحرف على الأقل).'
            : 'Please write a short review (at least 8 characters).'
        );
      } else {
        setFormError(
          isAr
            ? 'يرجى التأكد من اختيار التقييم والبيانات المطلوبة.'
            : 'Please verify your star rating and review details.'
        );
      }
      return;
    }

    setSubmitting(true);
    try {
      const created = await submitReviewToServer({
        authorName,
        location,
        serviceCategory,
        rating,
        comment,
      });
      onReviewAdded(created);
      setSubmittedReview(created);
      setAuthorName('');
      setLocation('');
      setComment('');
      setRating(5);
      setSelectedCategory('all');
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : isAr
            ? 'تعذر حفظ التقييم، يرجى المحاولة مرة أخرى.'
            : 'Unable to submit review. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const displayedStarValue = hoverRating ?? rating;
  const inputCls =
    'w-full px-3.5 py-2.5 bg-[#F7FAF7] dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm focus:outline-none focus:border-[#0B5D27] dark:focus:border-[#65B32E] min-h-[44px]';

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="bg-[#F1F6F2]/55 dark:bg-[#0D1711] py-16 lg:py-24 border-b border-[#DCE6DE] dark:border-[#1E3326]"
    >
      <ScrollReveal className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Quantitative Rating Summary */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] mb-2">
              {isAr ? 'شهادات عملاء Protec' : 'Client Proof & Verified Outcomes'}
            </p>
            <h2
              id="testimonials-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102116] dark:text-[#ECF4EE] mb-3"
              style={{ textWrap: 'balance' }}
            >
              {isAr
                ? 'آراء العملاء وتقييمات المشروعات المنفذة'
                : 'Verified Client Reviews & Project Outcomes'}
            </h2>
            <p className="text-sm sm:text-base text-[#4B6152] dark:text-[#A3B9AA]">
              {isAr
                ? 'تقييمات موثقة من ملاك الفيلات ومديري المرافق والكمبوندات بعد تنفيذ أعمال الوقاية واللاندسكيب وشبكات الري.'
                : 'Attributable feedback from villa owners, facility directors, and landscape managers after Protec interventions.'}
            </p>
          </div>

          {/* Summary Score Readout + Jump Action */}
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <div className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl px-6 py-4 flex items-center gap-5">
              <div>
                <div className="font-mono-num text-3xl font-extrabold text-[#0B5D27] dark:text-[#7AD959] tabular-nums leading-none">
                  {summary.averageRating.toFixed(1)}
                  <span className="text-sm font-semibold text-[#4B6152] dark:text-[#A3B9AA]"> / 5.0</span>
                </div>
                <span className="text-xs text-[#4B6152] dark:text-[#A3B9AA] mt-1 block">
                  {isAr ? 'متوسط تقييم العملاء' : 'Average Client Rating'}
                </span>
              </div>

              <div className="h-10 w-px bg-[#DCE6DE] dark:bg-[#213629]" aria-hidden="true" />

              <div>
                {renderStars(summary.averageRating)}
                <span className="text-xs text-[#4B6152] dark:text-[#A3B9AA] mt-1.5 block font-mono-num tabular-nums">
                  {isAr
                    ? `${summary.totalCount} تقييمات مشاريع موثقة`
                    : `${summary.totalCount} verified project reviews`}
                </span>
              </div>
            </div>

            <a
              href="#write-review-card"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] rounded-xl transition-colors min-h-[46px] whitespace-nowrap"
            >
              <MessageSquarePlus className="w-4 h-4" aria-hidden="true" />
              <span>{isAr ? 'أضف تقييمك' : 'Write a Review'}</span>
            </a>
          </div>
        </div>

        {/* Service Category Filter Tabs */}
        <div className="mb-8 flex flex-wrap items-center gap-1.5 p-1.5 bg-white dark:bg-[#111E16] rounded-xl border border-[#DCE6DE] dark:border-[#213629] w-fit max-w-full">
          {filterTabs.map((tab) => {
            const active = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[38px] ${
                  active
                    ? 'bg-[#0B5D27] text-white'
                    : 'text-[#2E4235] dark:text-[#C4D8CA] hover:bg-[#F7FAF7] dark:hover:bg-[#17281D] hover:text-[#102116] dark:hover:text-[#ECF4EE]'
                }`}
              >
                {isAr ? tab.labelAr : tab.labelEn}
              </button>
            );
          })}
        </div>

        {/* Testimonials Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-10 text-center text-sm text-[#4B6152] dark:text-[#A3B9AA] mb-10">
            {isAr
              ? 'لا توجد تقييمات مسجلة تحت هذا التخصص حالياً.'
              : 'No reviews found for this category yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {filtered.map((item) => {
              const author = isAr ? item.authorNameAr : item.authorNameEn;
              const role = isAr ? item.roleAr : item.roleEn;
              const org = isAr ? item.organizationAr : item.organizationEn;
              const locationLabel = isAr ? item.locationAr : item.locationEn;
              const serviceLabel = isAr ? item.serviceLabelAr : item.serviceLabelEn;
              const beforeState = isAr ? item.beforeStateAr : item.beforeStateEn;
              const outcome = isAr ? item.outcomeAr : item.outcomeEn;
              const quote = isAr ? item.quoteAr : item.quoteEn;
              const hasMetrics = Boolean(beforeState || outcome);

              return (
                <article
                  key={item.id}
                  className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-5"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        {renderStars(item.rating)}
                        <span className="font-mono-num text-xs font-bold text-[#102116] dark:text-[#ECF4EE] tabular-nums">
                          {item.rating.toFixed(1)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#4B6152] dark:text-[#A3B9AA]">
                        <span className="font-semibold text-[#0B5D27] dark:text-[#7AD959]">{serviceLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-num tabular-nums">{item.dateLabel}</span>
                      </div>
                    </div>

                    <blockquote className="text-sm sm:text-base text-[#102116] dark:text-[#ECF4EE] leading-relaxed mb-5">
                      “{quote}”
                    </blockquote>

                    {hasMetrics && (
                      <div className="bg-[#F7FAF7] dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {beforeState && (
                          <div>
                            <span className="block font-bold text-[#4B6152] dark:text-[#A3B9AA] mb-0.5">
                              {isAr ? 'قبل التدخل' : 'Before'}
                            </span>
                            <span className="text-[#102116] dark:text-[#ECF4EE]">{beforeState}</span>
                          </div>
                        )}
                        {outcome && (
                          <div>
                            <span className="block font-bold text-[#0B5D27] dark:text-[#7AD959] mb-0.5">
                              {isAr ? 'النتيجة المحققة' : 'Outcome'}
                            </span>
                            <span className="font-semibold text-[#102116] dark:text-[#ECF4EE]">{outcome}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#EDF2EE] dark:border-[#1E3326] flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-[#102116] dark:text-[#ECF4EE]">{author}</div>
                      <div className="text-xs text-[#4B6152] dark:text-[#A3B9AA]">
                        {org ? `${role} · ${org}` : role}
                      </div>
                    </div>
                    <span className="text-xs text-[#4B6152] dark:text-[#A3B9AA]">{locationLabel}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Interactive Rate & Write-a-Review Card */}
        <div
          id="write-review-card"
          className="scroll-mt-24 bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-2xl p-6 sm:p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-3">
              <span className="text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] block">
                {isAr ? 'شاركنا رأيك' : 'Share Your Experience'}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#102116] dark:text-[#ECF4EE]">
                {isAr ? 'تقييم خدمات Protec وكتابة تعليق' : 'Rate Protec & Write a Review'}
              </h3>
              <p className="text-sm text-[#4B6152] dark:text-[#A3B9AA] leading-relaxed">
                {isAr
                  ? 'هل استفدت من خدمات وقاية النبات أو تصميم اللاندسكيب أو شبكات الري؟ اختر التقييم بالنجوم واكتب تجربتك ليتم عرضها للعملاء.'
                  : 'Worked with Protec on pest management, landscaping, irrigation, or maintenance? Select a star rating and share your feedback.'}
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="lg:col-span-8 space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="p-3 bg-[#FEF2F2] dark:bg-[#2A1215] border border-[#FECACA] dark:border-[#7F1D1D] text-xs text-[#B91C1C] dark:text-[#FCA5A5] rounded-lg"
                >
                  {formError}
                </div>
              )}

              {submittedReview && (
                <div
                  role="status"
                  className="p-3.5 bg-[#F1F6F2] dark:bg-[#17281D] border border-[#0B5D27]/30 dark:border-[#65B32E]/40 text-xs font-semibold text-[#0B5D27] dark:text-[#7AD959] rounded-lg flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>
                    {isAr
                      ? 'شكراً لك! تم تسجيل تقييمك وإضافته لقائمة آراء العملاء بنجاح.'
                      : 'Thank you! Your rating and review have been published.'}
                  </span>
                </div>
              )}

              {/* Star Selector */}
              <div className="p-4 bg-[#F7FAF7] dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] rounded-xl flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs sm:text-sm font-bold text-[#102116] dark:text-[#ECF4EE]">
                  {isAr ? 'تقييمك العام للخدمة:' : 'Your Overall Star Rating:'}
                </span>

                <div className="flex items-center gap-3">
                  <div
                    role="radiogroup"
                    aria-label={isAr ? 'اختر التقييم من 1 إلى 5 نجوم' : 'Select rating from 1 to 5 stars'}
                    className="flex items-center gap-1"
                  >
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const active = starValue <= displayedStarValue;
                      return (
                        <button
                          key={starValue}
                          type="button"
                          role="radio"
                          aria-checked={rating === starValue}
                          aria-label={isAr ? `${starValue} من 5 نجوم` : `${starValue} out of 5 stars`}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRating(starValue)}
                          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#14241A] transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-[#0B5D27]"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              active
                                ? 'fill-[#65B32E] text-[#65B32E]'
                                : 'fill-transparent text-[#C4D4C8] dark:text-[#3A5342]'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <span className="font-mono-num text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] min-w-[78px]">
                    {displayedStarValue} / 5 · {isAr ? ratingLabelsAr[displayedStarValue] : ratingLabelsEn[displayedStarValue]}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="review-author" className="block text-xs font-bold text-[#102116] dark:text-[#ECF4EE] mb-1.5">
                    {isAr ? 'الاسم' : 'Your Name'} *
                  </label>
                  <input
                    id="review-author"
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder={isAr ? 'م. أحمد حسن' : 'Ahmed Hassan'}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="review-location" className="block text-xs font-bold text-[#102116] dark:text-[#ECF4EE] mb-1.5">
                    {isAr ? 'المنطقة / المدينة' : 'Area / City'}
                  </label>
                  <input
                    id="review-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={isAr ? 'التجمع الخامس / الشيخ زايد' : 'New Cairo / Sheikh Zayed'}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="review-category" className="block text-xs font-bold text-[#102116] dark:text-[#ECF4EE] mb-1.5">
                    {isAr ? 'الخدمة المقدمة' : 'Service Received'}
                  </label>
                  <select
                    id="review-category"
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value as ProjectCategory)}
                    className={inputCls}
                  >
                    <option value="plant-protection">
                      {isAr ? 'وقاية النبات ومكافحة الآفات' : 'Plant Protection & IPM'}
                    </option>
                    <option value="landscaping">
                      {isAr ? 'تصميم وتنفيذ اللاندسكيب' : 'Landscaping'}
                    </option>
                    <option value="irrigation">
                      {isAr ? 'تصميم وتنفيذ شبكات الري' : 'Irrigation Networks'}
                    </option>
                    <option value="maintenance">
                      {isAr ? 'صيانة الحدائق والتسميد' : 'Garden Maintenance'}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="review-comment" className="block text-xs font-bold text-[#102116] dark:text-[#ECF4EE] mb-1.5">
                  {isAr ? 'اكتب تقييمك وتجربتك' : 'Your Review'} *
                </label>
                <textarea
                  id="review-comment"
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    isAr
                      ? 'صف جودة التشخيص أو التنفيذ أو التزام فريق بروتيك بالمواعيد...'
                      : 'Describe how Protec handled diagnostics, execution, or garden maintenance...'
                  }
                  className={`${inputCls} py-2.5`}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] disabled:opacity-60 rounded-lg transition-colors min-h-[46px]"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                  <span>{isAr ? 'نشر التقييم' : 'Publish Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
