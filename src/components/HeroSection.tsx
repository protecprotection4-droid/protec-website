import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { GENERATED_IMAGES } from '../data/protecDefaults';
import { Language, SiteContent } from '../types';
import {
  nextHeroSlideIndex,
  prevHeroSlideIndex,
  resolveHeroImages,
} from '../utils/heroSlider';
import { SafeImage } from './SafeImage';

interface HeroSectionProps {
  lang: Language;
  content: SiteContent;
  servicesCount: number;
  onRequestQuote: () => void;
  onExploreServices: () => void;
}

const SLIDE_INTERVAL_MS = 4500;

export const HeroSection: React.FC<HeroSectionProps> = ({
  lang,
  content,
  servicesCount,
  onRequestQuote,
  onExploreServices,
}) => {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const slides = resolveHeroImages(
    content.heroImages,
    content.heroImageUrl,
    GENERATED_IMAGES.hero
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setActiveIndex((prev) => (prev >= slides.length ? 0 : prev));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => nextHeroSlideIndex(prev, slides.length));
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [slides.length, isPaused]);

  const stats = isAr
    ? [
        { value: `${servicesCount}`, label: 'تخصصات هندسية وزراعية' },
        { value: '40%', label: 'توفير مياه بشبكات الري الذكية' },
        { value: '48h', label: 'معاينة وتقييم فني مبدئي' },
        { value: '100%', label: 'برامج وقاية معتمدة وآمنة' },
      ]
    : [
        { value: `${servicesCount}`, label: 'Engineering & Agronomy Disciplines' },
        { value: '40%', label: 'Water Saved via Hydro-Zoned Irrigation' },
        { value: '48h', label: 'Initial Site Inspection Turnaround' },
        { value: '100%', label: 'Certified Low-Residue IPM Safety' },
      ];

  return (
    <section
      id="top"
      className="bg-white dark:bg-[#09110C] border-b border-[#DCE6DE] dark:border-[#1E3326]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Copy Column */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#0B5D27] dark:text-[#7AD959] mb-5">
              <span>{isAr ? 'بروتيك لوقاية النبات' : 'Protec Plant Health'}</span>
              <span aria-hidden="true" className="text-[#9DB3A4] dark:text-[#4E6957]">
                ·
              </span>
              <span>{isAr ? 'مكافحة الآفات' : 'Integrated Pest Control'}</span>
              <span aria-hidden="true" className="text-[#9DB3A4] dark:text-[#4E6957]">
                ·
              </span>
              <span>{isAr ? 'اللاندسكيب وشبكات الري' : 'Landscaping & Irrigation'}</span>
            </div>

            <h1
              className="text-[clamp(2.1rem,3.8vw,3.4rem)] font-extrabold text-[#102116] dark:text-[#ECF4EE] leading-[1.2] tracking-tight mb-6"
              style={{ textWrap: 'balance' }}
            >
              {isAr ? content.heroTitleAr : content.heroTitleEn}
            </h1>

            <p className="text-base sm:text-lg text-[#4B6152] dark:text-[#A3B9AA] leading-relaxed mb-8 max-w-2xl">
              {isAr ? content.heroSubtitleAr : content.heroSubtitleEn}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onRequestQuote}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[48px]"
              >
                <span>{isAr ? 'اطلب عرض سعر ومعاينة' : 'Request Site Quote'}</span>
                <ArrowIcon className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onExploreServices}
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm sm:text-base font-semibold text-[#0B5D27] dark:text-[#7AD959] bg-[#F1F6F2] dark:bg-[#14241A] hover:bg-[#E2EDE5] dark:hover:bg-[#1C3224] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[48px]"
              >
                {isAr ? 'استعراض خدماتنا' : 'Explore Services'}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-[#DCE6DE] dark:border-[#1E3326] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-[#4B6152] dark:text-[#A3B9AA]">
              <span>
                {isAr ? 'استشارات مباشرة:' : 'Direct Line:'}{' '}
                <a
                  href={`tel:${content.phones[0] || '01036084725'}`}
                  dir="ltr"
                  className="font-mono-num font-semibold text-[#102116] dark:text-[#ECF4EE] hover:text-[#0B5D27] dark:hover:text-[#7AD959]"
                >
                  {content.phones[0] || '01036084725'}
                </a>
              </span>
              <span aria-hidden="true" className="text-[#C4D4C8] dark:text-[#3A5342]">
                /
              </span>
              <a
                href={`tel:${content.phones[1] || '01065324190'}`}
                dir="ltr"
                className="font-mono-num font-semibold text-[#102116] dark:text-[#ECF4EE] hover:text-[#0B5D27] dark:hover:text-[#7AD959]"
              >
                {content.phones[1] || '01065324190'}
              </a>
            </div>

            <div
              data-testid="hero-coverage-info"
              className="mt-4 inline-flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1.5 sm:gap-3 px-3.5 py-2.5 rounded-xl bg-[#F7FAF7] dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] text-xs text-[#2E4235] dark:text-[#C4D8CA]"
            >
              <span className="inline-flex items-center gap-1.5 font-bold text-[#0B5D27] dark:text-[#7AD959]">
                <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {isAr
                    ? content.coverageStatementAr || 'تخدم شركة بروتيك جميع محافظات جمهورية مصر العربية'
                    : content.coverageStatementEn || 'Protec serves all governorates across Egypt'}
                </span>
              </span>
              <span aria-hidden="true" className="hidden sm:inline text-[#C4D4C8] dark:text-[#3A5342]">
                ·
              </span>
              <span className="font-semibold">
                {isAr ? 'المناطق المتاحة للمعاينة حالياً: ' : 'Currently available for site visits: '}
                <strong className="text-[#102116] dark:text-[#ECF4EE]">
                  {isAr
                    ? content.availableAreasAr || 'دمياط والمنصورة'
                    : content.availableAreasEn || 'Damietta and Mansoura'}
                </strong>
              </span>
            </div>
          </div>

          {/* Dominant Multi-Image Hero Slider */}
          <div className="lg:col-span-6">
            <div
              className="relative w-full h-full min-h-[320px] lg:min-h-[460px] rounded-2xl overflow-hidden border border-[#DCE6DE] dark:border-[#1E3326] bg-[#EDF5EF] dark:bg-[#111E16]"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onFocusCapture={() => setIsPaused(true)}
              onBlurCapture={() => setIsPaused(false)}
              role="region"
              aria-roledescription="carousel"
              aria-label={
                isAr ? 'معرض صور مشروعات بروتيك الرئيسية' : 'Protec featured project gallery slider'
              }
              data-testid="hero-slider"
            >
              {slides.map((slideUrl, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <div
                    key={`${slideUrl}-${idx}`}
                    aria-hidden={!isActive}
                    className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
                      isActive
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-[1.03] z-0 pointer-events-none'
                    }`}
                  >
                    <SafeImage
                      src={slideUrl}
                      fallbackSrc={GENERATED_IMAGES.hero}
                      eager={idx === 0}
                      alt={
                        isAr
                          ? `مشروع وقاية نبات ولاندسكيب شركة بروتيك — صورة ${idx + 1}`
                          : `Protec plant protection and landscaping project — Slide ${idx + 1}`
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}

              {slides.length > 1 && (
                <>
                  {/* Measured Bottom Gradient Scrim for Contrast */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/25 to-transparent z-20"
                  />

                  {/* Bottom Controls Strip */}
                  <div
                    dir="ltr"
                    className="absolute inset-x-4 bottom-4 z-30 flex items-center justify-between gap-3"
                  >
                    {/* Slide Indicators */}
                    <div className="flex items-center gap-1.5">
                      {slides.map((_, idx) => {
                        const isActive = idx === activeIndex;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveIndex(idx)}
                            aria-label={
                              isAr ? `عرض الصورة ${idx + 1}` : `View slide ${idx + 1}`
                            }
                            aria-current={isActive ? 'true' : undefined}
                            className={`h-2 rounded-full transition-all ${
                              isActive
                                ? 'w-7 bg-[#7AD959]'
                                : 'w-2.5 bg-white/65 hover:bg-white'
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Counter + Next/Prev */}
                    <div className="flex items-center gap-2">
                      <span
                        data-testid="hero-slide-counter"
                        className="font-mono-num text-xs font-bold text-white bg-black/55 backdrop-blur-xs px-2.5 py-1 rounded-md tabular-nums"
                      >
                        {String(activeIndex + 1).padStart(2, '0')} /{' '}
                        {String(slides.length).padStart(2, '0')}
                      </span>

                      <button
                        type="button"
                        data-testid="hero-prev-slide"
                        onClick={() =>
                          setActiveIndex((prev) => prevHeroSlideIndex(prev, slides.length))
                        }
                        aria-label={isAr ? 'الصورة السابقة' : 'Previous slide'}
                        className="w-8 h-8 rounded-lg bg-black/55 hover:bg-black/75 text-white backdrop-blur-xs inline-flex items-center justify-center transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        data-testid="hero-next-slide"
                        onClick={() =>
                          setActiveIndex((prev) => nextHeroSlideIndex(prev, slides.length))
                        }
                        aria-label={isAr ? 'الصورة التالية' : 'Next slide'}
                        className="w-8 h-8 rounded-lg bg-black/55 hover:bg-black/75 text-white backdrop-blur-xs inline-flex items-center justify-center transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width 4-Column Proof Strip */}
      <div className="bg-[#F7FAF7] dark:bg-[#0E1912] border-t border-[#DCE6DE] dark:border-[#1E3326]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:rtl:divide-x-reverse divide-[#DCE6DE] dark:divide-[#1E3326]">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-center lg:px-6 first:lg:ps-0 last:lg:pe-0"
            >
              <span className="font-mono-num text-2xl sm:text-3xl font-bold text-[#0B5D27] dark:text-[#7AD959] tabular-nums">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm text-[#4B6152] dark:text-[#A3B9AA] mt-1 font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
