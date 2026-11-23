import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { Language, OfferItem } from '../types';
import { getActiveOffers, getOfferCountdown, localizePriceLabel } from '../utils/offers';
import { SafeImage } from './SafeImage';
import { ScrollReveal } from './ScrollReveal';

interface OffersSectionProps {
  lang: Language;
  offers: OfferItem[];
  whatsappNumber: string;
  onClaimOffer: (offer: OfferItem) => void;
}

export const OffersSection: React.FC<OffersSectionProps> = ({
  lang,
  offers,
  whatsappNumber,
  onClaimOffer,
}) => {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const activeOffers = getActiveOffers(offers, nowMs);

  return (
    <section
      id="offers"
      className="bg-[#F7FAF7] dark:bg-[#0D1711] py-16 lg:py-24 border-b border-[#DCE6DE] dark:border-[#1E3326]"
    >
      <ScrollReveal className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] mb-2">
              {isAr ? 'عروض وباقات موسمية' : 'Seasonal Packages & Discounts'}
            </p>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102116] dark:text-[#ECF4EE]"
              style={{ textWrap: 'balance' }}
            >
              {isAr
                ? 'باقات وقاية النبات وتنسيق الحدائق المتاحة حالياً'
                : 'Current Plant Protection & Landscaping Offers'}
            </h2>
          </div>
          <p className="text-sm text-[#4B6152] dark:text-[#A3B9AA] max-w-md">
            {isAr
              ? 'جميع العروض محددة بتاريخ انتهاء واضح ويمكن طلبها مباشرة مع ربط العرض بطلب المعاينة.'
              : 'Every promotional package includes a verified expiration deadline and direct quote booking.'}
          </p>
        </div>

        {activeOffers.length === 0 ? (
          <div className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-2xl p-12 text-center">
            <p className="text-sm text-[#4B6152] dark:text-[#A3B9AA]">
              {isAr
                ? 'لا توجد عروض موسمية نشطة حالياً، يمكنك طلب عرض سعر مخصص لمشروعك في أي وقت.'
                : 'No active seasonal offers right now—request a custom project quote anytime below.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeOffers.map((offer) => {
              const countdown = getOfferCountdown(offer.expiresAt, nowMs);
              const title = isAr ? offer.titleAr : offer.titleEn;
              const desc = isAr ? offer.descriptionAr : offer.descriptionEn;
              const discountLabel = isAr ? offer.discountLabelAr : offer.discountLabelEn;
              const waText = encodeURIComponent(
                isAr
                  ? `مرحباً شركة Protec، أرغب في الاستفادة من العرض: ${offer.titleAr}`
                  : `Hello Protec, I would like to inquire about the offer: ${offer.titleEn}`
              );

              return (
                <article
                  key={offer.id}
                  className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] bg-[#EDF5EF] dark:bg-[#17281D] overflow-hidden">
                      <SafeImage
                        src={offer.imageUrl}
                        alt={title}
                        fallbackTitle={title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                        <span className="font-bold text-[#0B5D27] dark:text-[#7AD959]">{discountLabel}</span>
                        <span aria-hidden="true" className="text-[#9DB3A4] dark:text-[#4E6957]">
                          ·
                        </span>
                        <span className="text-[#4B6152] dark:text-[#A3B9AA] flex items-center gap-1 font-mono-num tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-[#0B5D27] dark:text-[#7AD959]" aria-hidden="true" />
                          {isAr ? `ينتهي ${offer.expiresAt}` : `Ends ${offer.expiresAt}`}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#102116] dark:text-[#ECF4EE] mb-2">{title}</h3>
                      <p className="text-sm text-[#4B6152] dark:text-[#A3B9AA] leading-relaxed mb-4">{desc}</p>

                      {(offer.offerPrice || offer.originalPrice) && (
                        <div className="flex items-baseline gap-3 mb-4 pb-4 border-b border-[#EDF2EE] dark:border-[#1E3326]">
                          {offer.offerPrice && (
                            <span className="text-lg font-extrabold text-[#0B5D27] dark:text-[#7AD959] tabular-nums">
                              {localizePriceLabel(offer.offerPrice, lang)}
                            </span>
                          )}
                          {offer.originalPrice && (
                            <span className="text-xs text-[#4B6152] dark:text-[#A3B9AA] line-through tabular-nums">
                              {localizePriceLabel(offer.originalPrice, lang)}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-[#4B6152] dark:text-[#A3B9AA] font-mono-num tabular-nums">
                        {isAr
                          ? `متبقي: ${countdown.days} يوم · ${countdown.hours} ساعة`
                          : `Remaining: ${countdown.days}d · ${countdown.hours}h`}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onClaimOffer(offer)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] rounded-lg transition-colors whitespace-nowrap min-h-[44px]"
                    >
                      <span>{isAr ? 'اطلب العرض الآن' : 'Claim This Offer'}</span>
                      <ArrowIcon className="w-4 h-4" aria-hidden="true" />
                    </button>

                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${waText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-3.5 py-2.5 text-xs font-semibold text-[#0B5D27] dark:text-[#7AD959] bg-[#F1F6F2] dark:bg-[#14241A] hover:bg-[#E2EDE5] dark:hover:bg-[#1C3224] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg transition-colors whitespace-nowrap min-h-[44px]"
                    >
                      {isAr ? 'واتساب' : 'WhatsApp'}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </ScrollReveal>
    </section>
  );
};
