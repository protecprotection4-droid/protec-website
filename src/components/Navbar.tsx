import React, { useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { Language } from '../types';
import { ThemeMode } from '../utils/theme';
import { ProtecLogo } from './ProtecLogo';

interface NavbarProps {
  lang: Language;
  theme: ThemeMode;
  onToggleLang: () => void;
  onToggleTheme: () => void;
  onNavigate: (sectionId: string) => void;
  isAdminView: boolean;
  onExitAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  theme,
  onToggleLang,
  onToggleTheme,
  onNavigate,
  isAdminView,
  onExitAdmin,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = theme === 'dark';

  const navItems =
    lang === 'ar'
      ? [
          { id: 'about', label: 'من نحن' },
          { id: 'services', label: 'خدماتنا' },
          { id: 'projects', label: 'أعمالنا' },
          { id: 'offers', label: 'عروضنا' },
          { id: 'contact', label: 'تواصل معنا' },
        ]
      : [
          { id: 'about', label: 'About' },
          { id: 'services', label: 'Services' },
          { id: 'projects', label: 'Projects' },
          { id: 'offers', label: 'Offers' },
          { id: 'contact', label: 'Contact' },
        ];

  const handleLinkClick = (id: string) => {
    setMobileOpen(false);
    if (isAdminView) {
      onExitAdmin();
      setTimeout(() => onNavigate(id), 50);
    } else {
      onNavigate(id);
    }
  };

  const themeToggleLabel = isDark
    ? lang === 'ar'
      ? 'التبديل إلى الوضع النهاري'
      : 'Switch to light mode'
    : lang === 'ar'
      ? 'التبديل إلى الوضع الداكن'
      : 'Switch to dark mode';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B150E]/95 backdrop-blur-sm border-b border-[#DCE6DE] dark:border-[#1E3326] transition-colors">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('top');
          }}
          aria-label="بروتيك Protec"
          className="flex items-center whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#0B5D27] rounded-lg py-1"
        >
          <ProtecLogo lang={lang} variant="navbar" />
        </a>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label={lang === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'}
          className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#2E4235] dark:text-[#C4D8CA]"
        >
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id);
              }}
              className="hover:text-[#0B5D27] dark:hover:text-[#7AD959] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#65B32E]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Theme Toggle, Language Toggle & Primary Action */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={themeToggleLabel}
            aria-pressed={isDark}
            title={themeToggleLabel}
            data-testid="theme-toggle"
            className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold text-[#102116] dark:text-[#ECF4EE] bg-[#F7FAF7] dark:bg-[#14241A] hover:bg-[#EDF5EF] dark:hover:bg-[#1C3224] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] min-w-[40px]"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#FACC15]" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-[#0B5D27]" aria-hidden="true" />
            )}
            <span className="hidden lg:inline">
              {isDark ? (lang === 'ar' ? 'نهاري' : 'Light') : lang === 'ar' ? 'داكن' : 'Dark'}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleLang}
            aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            className="px-3 py-2 text-xs font-semibold text-[#0B5D27] dark:text-[#7AD959] hover:bg-[#F1F6F2] dark:hover:bg-[#14241A] rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>

          <button
            type="button"
            onClick={() => handleLinkClick('quote')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0B5D27] hover:bg-[#08431C] rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
          >
            {lang === 'ar' ? 'طلب عرض سعر' : 'Request Quote'}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={
              mobileOpen
                ? lang === 'ar'
                  ? 'إغلاق القائمة'
                  : 'Close menu'
                : lang === 'ar'
                  ? 'فتح القائمة'
                  : 'Open menu'
            }
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 text-[#102116] dark:text-[#ECF4EE] hover:bg-[#F1F6F2] dark:hover:bg-[#14241A] rounded-lg"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#DCE6DE] dark:border-[#1E3326] bg-white dark:bg-[#0B150E] px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id);
              }}
              className="block px-3 py-3 text-sm font-semibold text-[#102116] dark:text-[#ECF4EE] hover:bg-[#F7FAF7] dark:hover:bg-[#14241A] hover:text-[#0B5D27] dark:hover:text-[#7AD959] rounded-lg"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleLinkClick('quote')}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#0B5D27] hover:bg-[#08431C] rounded-lg transition-colors"
            >
              {lang === 'ar' ? 'طلب عرض سعر' : 'Request Quote'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
