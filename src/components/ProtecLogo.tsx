import React from 'react';
import { Language } from '../types';

export type ProtecLogoVariant = 'navbar' | 'about' | 'footer';

interface ProtecLogoProps {
  lang: Language;
  variant?: ProtecLogoVariant;
  className?: string;
}

const LOGO_ASSETS = {
  fullLight: '/assets/logo/protec-full-light.png',
  fullDark: '/assets/logo/protec-full-dark.png',
  emblemLight: '/assets/logo/protec-emblem-light.png',
  emblemDark: '/assets/logo/protec-emblem-dark.png',
  navEmblemLight: '/assets/logo/protec-nav-emblem-light.png',
  navEmblemDark: '/assets/logo/protec-nav-emblem-dark.png',
  wordmarkLight: '/assets/logo/protec-wordmark-light.png',
  wordmarkDark: '/assets/logo/protec-wordmark-dark.png',
} as const;

/**
 * Exact Protec ("بروتيك Protec — مكافحة الآفات وصحة النبات") logo extracted cleanly
 * with decontaminated alpha transparency so it blends natively on light & dark surfaces.
 */
export const ProtecLogo: React.FC<ProtecLogoProps> = ({
  lang,
  variant = 'navbar',
  className = '',
}) => {
  const altText =
    lang === 'ar'
      ? 'Protec بروتيك — مكافحة الآفات وصحة النبات'
      : 'Protec — Pest Control & Plant Health';

  if (variant === 'about') {
    return (
      <div className={`flex flex-col items-center justify-center select-none ${className}`}>
        <img
          src={LOGO_ASSETS.fullLight}
          alt={altText}
          draggable={false}
          className="w-44 sm:w-52 h-auto object-contain dark:hidden"
        />
        <img
          src={LOGO_ASSETS.fullDark}
          alt={altText}
          draggable={false}
          className="w-44 sm:w-52 h-auto object-contain hidden dark:block"
        />
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        <img
          src={LOGO_ASSETS.emblemLight}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="h-10 w-auto object-contain dark:hidden"
        />
        <img
          src={LOGO_ASSETS.emblemDark}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="h-10 w-auto object-contain hidden dark:block"
        />
        <img
          src={LOGO_ASSETS.wordmarkLight}
          alt={altText}
          draggable={false}
          className="h-9 w-auto object-contain dark:hidden"
        />
        <img
          src={LOGO_ASSETS.wordmarkDark}
          alt={altText}
          draggable={false}
          className="h-9 w-auto object-contain hidden dark:block"
        />
      </div>
    );
  }

  // Default: 'navbar' — slightly smaller new shield emblem + Arabic "بروتيك" & English "Protec" only
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <img
        src={LOGO_ASSETS.navEmblemLight}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="h-8 sm:h-9 w-auto object-contain shrink-0 dark:hidden"
      />
      <img
        src={LOGO_ASSETS.navEmblemDark}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="h-8 sm:h-9 w-auto object-contain shrink-0 hidden dark:block"
      />
      <div className="flex items-baseline gap-1.5 sm:gap-2 leading-none">
        <span className="text-lg sm:text-xl font-extrabold text-[#0B5D27] dark:text-[#7AD959] tracking-tight">
          بروتيك
        </span>
        <span
          dir="ltr"
          className="text-base sm:text-lg font-extrabold text-[#102116] dark:text-[#ECF4EE] tracking-tight"
        >
          Protec
        </span>
      </div>
    </div>
  );
};
