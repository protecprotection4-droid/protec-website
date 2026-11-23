import React, { useEffect, useRef, useState } from 'react';
import { getScrollRevealClasses, SCROLL_REVEAL_THRESHOLD } from '../utils/motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    return typeof IntersectionObserver === 'undefined';
  });

  useEffect(() => {
    if (isVisible) {
      return;
    }
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            setIsVisible(true);
            observer.unobserve(entry.target);
            break;
          }
        }
      },
      {
        threshold: SCROLL_REVEAL_THRESHOLD,
        rootMargin: '0px',
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isVisible]);

  const revealClasses = getScrollRevealClasses(isVisible);

  return (
    <div
      ref={ref}
      data-scroll-reveal="true"
      data-reveal-visible={isVisible ? 'true' : 'false'}
      className={`${revealClasses} ${className}`.trim()}
    >
      {children}
    </div>
  );
};
