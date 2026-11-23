import React from 'react';
import { Lock, Mail, MessageCircle, Phone } from 'lucide-react';
import { Language, SiteContent } from '../types';
import { ProtecLogo } from './ProtecLogo';
import { ScrollReveal } from './ScrollReveal';

interface ContactFooterProps {
  lang: Language;
  content: SiteContent;
  onOpenAdmin: () => void;
}

export const ContactFooter: React.FC<ContactFooterProps> = ({
  lang,
  content,
  onOpenAdmin,
}) => {
  const isAr = lang === 'ar';
  const cleanWa = content.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <>
      {/* Contact Us Section */}
      <section
        id="contact"
        className="bg-[#F7FAF7] dark:bg-[#0D1711] py-16 lg:py-20 border-b border-[#DCE6DE] dark:border-[#1E3326]"
      >
        <ScrollReveal className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <p className="text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] mb-2">
                {isAr ? 'تواصل مباشر مع فريق Protec' : 'Direct Contact'}
              </p>
              <h2
                className="text-2xl sm:text-3xl font-extrabold text-[#102116] dark:text-[#ECF4EE] mb-4"
                style={{ textWrap: 'balance' }}
              >
                {isAr
                  ? 'هل تحتاج لمعاينة عاجلة أو استشارة زراعية؟'
                  : 'Need an Urgent Site Inspection or Agronomic Consultation?'}
              </h2>
              <p className="text-sm sm:text-base text-[#4B6152] dark:text-[#A3B9AA] leading-relaxed mb-3">
                {isAr ? content.addressAr : content.addressEn}
              </p>

              <p className="text-xs sm:text-sm font-semibold text-[#2E4235] dark:text-[#C4D8CA] leading-relaxed mb-6">
                <span className="text-[#0B5D27] dark:text-[#7AD959] font-bold">
                  {isAr
                    ? content.coverageStatementAr ||
                      'تخدم شركة بروتيك جميع محافظات جمهورية مصر العربية'
                    : content.coverageStatementEn ||
                      'Protec serves all governorates across Egypt'}
                </span>
                {' · '}
                <span>
                  {isAr
                    ? `المعاينة الميدانية متاحة حالياً في: ${content.availableAreasAr || 'دمياط والمنصورة'}`
                    : `Currently available for site visits: ${content.availableAreasEn || 'Damietta and Mansoura'}`}
                </span>
              </p>

              <a
                href={`https://wa.me/${cleanWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] rounded-lg transition-colors min-h-[48px]"
              >
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                <span>{isAr ? 'تواصل عبر واتساب مباشرة' : 'Chat Directly on WhatsApp'}</span>
              </a>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-6">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] mb-3">
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span>{isAr ? 'أرقام التواصل' : 'Phone Numbers'}</span>
                </div>
                <div className="space-y-2">
                  {content.phones.map((phone, idx) => (
                    <a
                      key={idx}
                      href={`tel:${phone}`}
                      dir="ltr"
                      className="block font-mono-num text-base font-bold text-[#102116] dark:text-[#ECF4EE] hover:text-[#0B5D27] dark:hover:text-[#7AD959] tabular-nums"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-6">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] mb-3">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  <span>{isAr ? 'البريد الإلكتروني' : 'Official Email'}</span>
                </div>
                <a
                  href={`mailto:${content.email}`}
                  dir="ltr"
                  className="block text-sm font-semibold text-[#102116] dark:text-[#ECF4EE] hover:text-[#0B5D27] dark:hover:text-[#7AD959] break-all mb-4"
                >
                  {content.email}
                </a>

                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#EDF2EE] dark:border-[#1E3326] text-xs font-semibold text-[#4B6152] dark:text-[#A3B9AA]">
                  {content.facebookUrl && (
                    <a
                      href={content.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-[#0B5D27] dark:hover:text-[#7AD959] transition-colors"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.6V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H8v3h2.3v8h3.2z" />
                      </svg>
                      <span>Facebook</span>
                    </a>
                  )}
                  {content.instagramUrl && (
                    <a
                      href={content.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-[#0B5D27] dark:hover:text-[#7AD959] transition-colors"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                      <span>Instagram</span>
                    </a>
                  )}
                  {content.tiktokUrl && (
                    <a
                      href={content.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-[#0B5D27] dark:hover:text-[#7AD959] transition-colors"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.57a8.18 8.18 0 0 0 4.78 1.52V6.64c-.3 0-.59.02-.86.05z" />
                      </svg>
                      <span>TikTok</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Quiet Footer */}
      <footer className="bg-white dark:bg-[#09110C] pt-8 pb-20 sm:pb-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4B6152] dark:text-[#A3B9AA]">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <ProtecLogo lang={lang} variant="footer" />
            <span>
              © {new Date().getFullYear()} —{' '}
              {isAr
                ? 'مكافحة الآفات وصحة النبات واللاندسكيب'
                : 'Plant Protection, Pest Control & Landscaping'}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#2E4235] dark:text-[#C4D8CA] hover:text-[#0B5D27] dark:hover:text-[#7AD959] hover:bg-[#F7FAF7] dark:hover:bg-[#14241A] rounded-lg transition-colors min-h-[38px]"
          >
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isAr ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}</span>
          </button>
        </div>
      </footer>
    </>
  );
};
