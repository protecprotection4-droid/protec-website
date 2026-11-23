import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Language } from '../types';

interface ScrollToTopButtonProps {
  lang: Language;
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ lang }) => {
  const [visible, setVisible] = useState(false);
  const isAr = lang === 'ar';

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 360);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) {
    return null;
  }

  const label = isAr ? 'العودة إلى الأعلى' : 'Back to top';

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={label}
      title={label}
      data-testid="scroll-to-top-button"
      className="fixed bottom-5 left-5 sm:bottom-6 sm:left-6 z-50 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-[#14241A] text-[#0B5D27] dark:text-[#7AD959] border border-[#DCE6DE] dark:border-[#243D2D] shadow-[0_8px_24px_rgba(16,33,22,0.16)] hover:bg-[#F1F6F2] dark:hover:bg-[#1C3224] active:scale-[0.97] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5D27]"
    >
      <ArrowUp className="w-5 h-5" aria-hidden="true" />
    </button>
  );
};
