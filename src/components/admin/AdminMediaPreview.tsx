import React, { useEffect, useState } from 'react';
import { Download, Film, ImageIcon, Loader2 } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { Language, QuoteAttachment } from '../../types';

interface AdminMediaPreviewProps {
  attachment: QuoteAttachment;
  lang: Language;
  getAuthToken?: () => Promise<string | null>;
}

export const AdminMediaPreview: React.FC<AdminMediaPreviewProps> = ({
  attachment,
  lang,
  getAuthToken,
}) => {
  const isAr = lang === 'ar';
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolveToken = async (): Promise<string | null> => {
    if (getAuthToken) {
      const t = await getAuthToken();
      if (t) return t;
    }
    if (auth.currentUser) {
      return auth.currentUser.getIdToken();
    }
    return null;
  };

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    const loadMedia = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await resolveToken();
        if (!token) throw new Error('Authentication required');
        const response = await fetch(attachment.url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const blob = await response.blob();
        createdUrl = URL.createObjectURL(blob);
        if (active) {
          setBlobUrl(createdUrl);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load attachment');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadMedia();

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [attachment.url, getAuthToken]);

  const handleDownload = async () => {
    try {
      const token = await resolveToken();
      if (!token) throw new Error('Authentication required');
      const response = await fetch(`${attachment.url}?download=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = attachment.originalName || attachment.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  return (
    <div className="border border-[#DCE6DE] rounded-xl overflow-hidden bg-white">
      <div className="aspect-video bg-[#F7FAF7] flex items-center justify-center relative">
        {loading && (
          <div className="flex flex-col items-center gap-2 text-xs text-[#4B6152]">
            <Loader2 className="w-5 h-5 animate-spin text-[#0B5D27]" />
            <span>{isAr ? 'جاري تحميل المرفق المحمي...' : 'Loading secured media...'}</span>
          </div>
        )}

        {!loading && error && (
          <div className="p-4 text-center text-xs text-[#B91C1C]">
            {isAr ? `تعذر عرض الملف (${error})` : `Failed to load media (${error})`}
          </div>
        )}

        {!loading && !error && blobUrl && attachment.kind === 'image' && (
          <img
            src={blobUrl}
            alt={attachment.originalName}
            className="w-full h-full object-contain bg-black/5"
          />
        )}

        {!loading && !error && blobUrl && attachment.kind === 'video' && (
          <video
            src={blobUrl}
            controls
            preload="metadata"
            className="w-full h-full object-contain bg-black"
          />
        )}
      </div>

      <div className="px-3.5 py-2.5 border-t border-[#DCE6DE] flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          {attachment.kind === 'video' ? (
            <Film className="w-4 h-4 text-[#0B5D27] shrink-0" aria-hidden="true" />
          ) : (
            <ImageIcon className="w-4 h-4 text-[#0B5D27] shrink-0" aria-hidden="true" />
          )}
          <span className="font-medium text-[#102116] truncate">{attachment.originalName}</span>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 font-semibold text-[#0B5D27] hover:bg-[#F1F6F2] rounded-md shrink-0 whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isAr ? 'تحميل' : 'Download'}</span>
        </button>
      </div>
    </div>
  );
};
