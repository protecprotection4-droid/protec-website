import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { Language, ServiceItem } from '../types';
import { SafeImage } from './SafeImage';
import { ScrollReveal } from './ScrollReveal';

interface ServicesSectionProps {
  lang: Language;
  services: ServiceItem[];
  onSelectServiceForQuote: (serviceSlug: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  lang,
  services,
  onSelectServiceForQuote,
}) => {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const activeServices = services.filter((s) => s.active).sort((a, b) => a.order - b.order);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  return (
    <section
      id="services"
      className="bg-[#F7FAF7] dark:bg-[#0D1711] py-16 lg:py-24 border-b border-[#DCE6DE] dark:border-[#1E3326]"
    >
      <ScrollReveal className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] mb-2">
              {isAr ? 'خدمات بروتيك المتكاملة' : 'Protec Specialized Services'}
            </p>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102116] dark:text-[#ECF4EE]"
              style={{ textWrap: 'balance' }}
            >
              {isAr
                ? 'منظومة هندسية وزراعية تغطي التصميم والوقاية والصيانة'
                : 'End-to-End Landscape Architecture, Plant Protection & Maintenance'}
            </h2>
          </div>
          <p className="text-sm text-[#4B6152] dark:text-[#A3B9AA] max-w-md">
            {isAr
              ? 'اضغط على أي خدمة لعرض التفاصيل الفنية وبروتوكول التنفيذ أو لطلب عرض سعر مخصص.'
              : 'Select any discipline below to inspect technical deliverables or request a tailored site quote.'}
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeServices.map((service, idx) => {
            const isHeroCard = idx === 0 && activeServices.length >= 4;
            const title = isAr ? service.titleAr : service.titleEn;
            const shortDesc = isAr ? service.shortDescAr : service.shortDescEn;
            const features = (isAr ? service.featuresAr : service.featuresEn) || [];

            return (
              <article
                key={service.id}
                className={`bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-2xl overflow-hidden flex flex-col justify-between transition-colors hover:border-[#0B5D27]/50 dark:hover:border-[#65B32E]/50 ${
                  isHeroCard ? 'md:col-span-2 lg:col-span-2 lg:grid lg:grid-cols-12' : ''
                }`}
              >
                <div
                  className={`relative ${
                    isHeroCard ? 'lg:col-span-6 h-64 lg:h-full' : 'aspect-[4/3]'
                  } bg-gradient-to-br from-[#E6EFE8] via-[#EDF5EF] to-[#DCE9DF] dark:from-[#122118] dark:via-[#17281D] dark:to-[#0E1A13] overflow-hidden`}
                >
                  <SafeImage
                    src={service.imageUrl}
                    alt={title}
                    fallbackTitle={title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div
                  className={`p-6 sm:p-7 flex flex-col justify-between ${
                    isHeroCard ? 'lg:col-span-6' : 'flex-1'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-[#4B6152] dark:text-[#A3B9AA] mb-2">
                      <span className="font-mono-num font-bold text-[#0B5D27] dark:text-[#7AD959]">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span>
                        {isAr ? 'خدمة متخصصة' : 'Specialized Service'}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-[#102116] dark:text-[#ECF4EE] mb-2.5">
                      {title}
                    </h3>

                    <p className="text-sm text-[#4B6152] dark:text-[#A3B9AA] leading-relaxed mb-4">
                      {shortDesc}
                    </p>

                    {isHeroCard && features.length > 0 && (
                      <ul className="space-y-1.5 mb-5">
                        {features.slice(0, 3).map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2 text-xs text-[#2E4235] dark:text-[#C4D8CA]">
                            <Check className="w-3.5 h-3.5 text-[#65B32E] dark:text-[#7AD959] mt-0.5 shrink-0" aria-hidden="true" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#EDF2EE] dark:border-[#1E3326] flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedService(service)}
                      className="text-xs sm:text-sm font-bold text-[#0B5D27] dark:text-[#7AD959] hover:text-[#08431C] dark:hover:text-[#9BE97D] py-2 whitespace-nowrap shrink-0"
                    >
                      {isAr ? 'التفاصيل الفنية' : 'View Details'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectServiceForQuote(service.slug)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0B5D27] hover:bg-[#08431C] rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
                    >
                      <span>{isAr ? 'اطلب الخدمة' : 'Request Service'}</span>
                      <ArrowIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Service Details Modal */}
      {selectedService && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-modal-title"
        >
          <div className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="aspect-[16/9] bg-[#EDF5EF] dark:bg-[#17281D] relative">
              <SafeImage
                src={selectedService.imageUrl}
                alt={isAr ? selectedService.titleAr : selectedService.titleEn}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                aria-label={isAr ? 'إغلاق التفاصيل' : 'Close details'}
                className="absolute top-3 end-3 w-10 h-10 bg-white/95 dark:bg-[#0B150E]/90 text-[#102116] dark:text-[#ECF4EE] rounded-lg flex items-center justify-center border border-[#DCE6DE] dark:border-[#243D2D] hover:bg-white dark:hover:bg-[#14241A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <h3 id="service-modal-title" className="text-2xl font-extrabold text-[#102116] dark:text-[#ECF4EE] mb-3">
                {isAr ? selectedService.titleAr : selectedService.titleEn}
              </h3>

              <p className="text-sm sm:text-base text-[#4B6152] dark:text-[#A3B9AA] leading-relaxed mb-6">
                {isAr ? selectedService.fullDescAr : selectedService.fullDescEn}
              </p>

              <div className="bg-[#F7FAF7] dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-5 mb-6">
                <h4 className="text-sm font-bold text-[#0B5D27] dark:text-[#7AD959] mb-3">
                  {isAr ? 'ما يشمله نطاق العمل' : 'Technical Scope & Deliverables'}
                </h4>
                <ul className="space-y-2.5">
                  {(isAr ? selectedService.featuresAr : selectedService.featuresEn).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-[#102116] dark:text-[#ECF4EE]">
                      <Check className="w-4 h-4 text-[#65B32E] dark:text-[#7AD959] mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="px-4 py-2.5 text-sm font-semibold text-[#4B6152] dark:text-[#A3B9AA] hover:bg-[#F1F6F2] dark:hover:bg-[#14241A] rounded-lg min-h-[44px]"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const slug = selectedService.slug;
                    setSelectedService(null);
                    onSelectServiceForQuote(slug);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] rounded-lg min-h-[44px]"
                >
                  <span>{isAr ? 'اطلب عرض سعر لهذه الخدمة' : 'Request Quote for This Service'}</span>
                  <ArrowIcon className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
