import React, { useEffect, useRef, useState } from 'react';
import { Sprout } from 'lucide-react';

interface SafeImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  eager?: boolean;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallbackSrc,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle,
  eager = false,
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setLoaded(false);
      return;
    }
    setFailed(true);
    setLoaded(true);
  };

  if (failed || !currentSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EDF5EF] to-[#DCE9DF] dark:from-[#122118] dark:to-[#0C1710] text-[#0B5D27] dark:text-[#7AD959] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Sprout className="w-8 h-8 mb-2 opacity-75" aria-hidden="true" />
        <span className="text-xs font-semibold text-[#102116]/75 dark:text-[#ECF4EE]/75 max-w-[18rem]">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  const revealCls = loaded
    ? 'opacity-100 blur-0 scale-100'
    : 'opacity-0 blur-[6px] scale-[1.02]';

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={handleError}
      data-loaded={loaded ? 'true' : 'false'}
      className={`${className} transition-[opacity,filter,transform] duration-500 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:blur-0 motion-reduce:scale-100 ${revealCls}`}
    />
  );
};
