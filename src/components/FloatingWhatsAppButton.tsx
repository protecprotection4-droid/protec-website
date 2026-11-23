import React from 'react';
import { Language } from '../types';
import { buildWhatsAppUrl } from '../utils/contact';

interface FloatingWhatsAppButtonProps {
  lang: Language;
  whatsappNumber: string;
}

export const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({
  lang,
  whatsappNumber,
}) => {
  const isAr = lang === 'ar';
  const href = buildWhatsAppUrl(whatsappNumber, lang);

  if (!href) {
    return null;
  }

  const label = isAr ? 'تواصل عبر واتساب' : 'WhatsApp Us';
  const ariaLabel = isAr
    ? 'تواصل مع شركة Protec مباشرة عبر واتساب'
    : 'Chat directly with Protec on WhatsApp';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      title={label}
      data-testid="floating-whatsapp-button"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 inline-flex items-center justify-center gap-2.5 h-12 w-12 sm:w-auto sm:px-4 rounded-full bg-[#0B5D27] hover:bg-[#08431C] active:scale-[0.98] text-white border border-white/15 shadow-[0_8px_24px_rgba(16,33,22,0.2)] transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5D27]"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 shrink-0"
        aria-hidden="true"
      >
        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
      </svg>
      <span className="hidden sm:inline text-xs font-bold whitespace-nowrap shrink-0">
        {label}
      </span>
    </a>
  );
};
