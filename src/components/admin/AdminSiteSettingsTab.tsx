import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { GENERATED_IMAGES } from '../../data/protecDefaults';
import { saveServerSiteContent, uploadAdminImageWithToken } from '../../lib/adminApi';
import { saveSiteContent } from '../../lib/firestoreService';
import { Language, SiteContent } from '../../types';
import { MAX_HERO_SLIDES, reorderHeroImages, resolveHeroImages } from '../../utils/heroSlider';
import { SafeImage } from '../SafeImage';

interface AdminSiteSettingsTabProps {
  lang: Language;
  mode: 'homepage' | 'company';
  content: SiteContent;
  onRefresh: () => Promise<void>;
  getAuthToken: () => Promise<string | null>;
  isFirebaseAdmin: boolean;
}

function withNormalizedHeroSlides(content: SiteContent): SiteContent {
  const slides = resolveHeroImages(
    content.heroImages,
    content.heroImageUrl,
    GENERATED_IMAGES.hero
  );
  return {
    ...content,
    heroImages: slides,
    heroImageUrl: slides[0] || content.heroImageUrl || GENERATED_IMAGES.hero,
  };
}

export const AdminSiteSettingsTab: React.FC<AdminSiteSettingsTabProps> = ({
  lang,
  mode,
  content,
  onRefresh,
  getAuthToken,
  isFirebaseAdmin,
}) => {
  const isAr = lang === 'ar';
  const [draft, setDraft] = useState<SiteContent>(() => withNormalizedHeroSlides(content));
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setDraft(withNormalizedHeroSlides(content));
  }, [content]);

  const heroSlides =
    draft.heroImages && draft.heroImages.length > 0
      ? draft.heroImages
      : [draft.heroImageUrl || GENERATED_IMAGES.hero];

  const persistHeroSlides = async (nextSlides: string[]) => {
    const cleanSlides = nextSlides.map((s) => s.trim()).filter(Boolean);
    const resolvedSlides = cleanSlides.length > 0 ? cleanSlides : [GENERATED_IMAGES.hero];
    const nextDraft: SiteContent = {
      ...draft,
      heroImages: resolvedSlides,
      heroImageUrl: resolvedSlides[0] || draft.heroImageUrl || GENERATED_IMAGES.hero,
    };
    setDraft(nextDraft);
    setSaving(true);
    setSavedNotice(false);
    setErrorMsg(null);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Authentication required');
      const saved = await saveServerSiteContent(token, nextDraft);
      if (isFirebaseAdmin) {
        await saveSiteContent(saved).catch(() => undefined);
      }
      setDraft(withNormalizedHeroSlides(saved));
      await onRefresh();
      setSavedNotice(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save hero images');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadSlideAt = async (index: number, file: File | undefined) => {
    if (!file) return;
    setSaving(true);
    setErrorMsg(null);
    setSavedNotice(false);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Authentication required');
      const url = await uploadAdminImageWithToken(token, file);
      const next = [...heroSlides];
      next[index] = url;
      await persistHeroSlides(next);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
      setSaving(false);
    }
  };

  const handleUploadAndAddSlide = async (file: File | undefined) => {
    if (!file) return;
    if (heroSlides.length >= MAX_HERO_SLIDES) {
      setErrorMsg(
        isAr
          ? `الحد الأقصى لصور الشريط الرئيسي هو ${MAX_HERO_SLIDES} صور.`
          : `Maximum ${MAX_HERO_SLIDES} hero slides allowed.`
      );
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    setSavedNotice(false);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Authentication required');
      const url = await uploadAdminImageWithToken(token, file);
      await persistHeroSlides([...heroSlides, url]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
      setSaving(false);
    }
  };

  const handleAddSlideByUrl = () => {
    const trimmed = newSlideUrl.trim();
    if (!trimmed || heroSlides.length >= MAX_HERO_SLIDES) return;
    setNewSlideUrl('');
    void persistHeroSlides([...heroSlides, trimmed]);
  };

  const handleRemoveSlide = (index: number) => {
    if (heroSlides.length <= 1) return;
    const next = heroSlides.filter((_, idx) => idx !== index);
    void persistHeroSlides(next);
  };

  const handleMoveSlide = (fromIndex: number, toIndex: number) => {
    void persistHeroSlides(reorderHeroImages(heroSlides, fromIndex, toIndex));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);
    setErrorMsg(null);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Authentication required');
      const cleanSlides = heroSlides.map((s) => s.trim()).filter(Boolean);
      const payload: SiteContent = {
        ...draft,
        heroImages: cleanSlides.length > 0 ? cleanSlides : [GENERATED_IMAGES.hero],
        heroImageUrl: cleanSlides[0] || draft.heroImageUrl || GENERATED_IMAGES.hero,
      };
      const saved = await saveServerSiteContent(token, payload);
      if (isFirebaseAdmin) {
        await saveSiteContent(saved).catch(() => undefined);
      }
      setDraft(withNormalizedHeroSlides(saved));
      await onRefresh();
      setSavedNotice(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save site settings');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 bg-white dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm';

  return (
    <form
      onSubmit={handleSave}
      className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-6 space-y-6 text-[#102116] dark:text-[#ECF4EE]"
    >
      {mode === 'homepage' ? (
        <>
          <h3 className="text-lg font-bold text-[#102116] dark:text-[#ECF4EE]">
            {isAr ? 'إدارة محتوى الصفحة الرئيسية ومن نحن' : 'Homepage & About Content'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">عنوان الواجهة الرئيسية (عربي)</label>
              <input
                type="text"
                value={draft.heroTitleAr}
                onChange={(e) => setDraft({ ...draft, heroTitleAr: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Hero Headline (EN)</label>
              <input
                type="text"
                dir="ltr"
                value={draft.heroTitleEn}
                onChange={(e) => setDraft({ ...draft, heroTitleEn: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">الوصف المختصر للواجهة (عربي)</label>
              <textarea
                rows={3}
                value={draft.heroSubtitleAr}
                onChange={(e) => setDraft({ ...draft, heroSubtitleAr: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Hero Subtitle (EN)</label>
              <textarea
                rows={3}
                dir="ltr"
                value={draft.heroSubtitleEn}
                onChange={(e) => setDraft({ ...draft, heroSubtitleEn: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          {/* Multi-Image Hero Slider Management */}
          <div className="pt-4 border-t border-[#DCE6DE] dark:border-[#213629] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-[#102116] dark:text-[#ECF4EE]">
                  {isAr
                    ? `صور شريط الواجهة الرئيسية (${heroSlides.length} / ${MAX_HERO_SLIDES})`
                    : `Hero Slider Photos (${heroSlides.length} / ${MAX_HERO_SLIDES})`}
                </h4>
                <p className="text-xs text-[#4B6152] dark:text-[#A3B9AA] mt-0.5">
                  {isAr
                    ? 'تتبدل الصور تلقائياً في واجهة الموقع. يمكنك التعديل، الرفع، إعادة الترتيب، أو الإضافة حتى 8 صور.'
                    : 'Photos cycle automatically on the homepage. Edit URLs, upload files, reorder, or add up to 8 slides.'}
                </p>
              </div>

              {heroSlides.length < MAX_HERO_SLIDES && (
                <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-[#0B5D27] hover:bg-[#08431C] text-white rounded-lg cursor-pointer whitespace-nowrap transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{isAr ? 'رفع وإضافة صورة جديدة' : 'Upload & Add Slide'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      void handleUploadAndAddSlide(file);
                    }}
                  />
                </label>
              )}
            </div>

            <div className="space-y-3">
              {heroSlides.map((slideUrl, idx) => (
                <div
                  key={`hero-slide-row-${idx}`}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-[#DCE6DE] dark:border-[#213629] bg-[#F7FAF7] dark:bg-[#0D1711]"
                >
                  <div className="w-full sm:w-28 h-20 rounded-lg overflow-hidden border border-[#DCE6DE] dark:border-[#213629] bg-[#E8F1EA] dark:bg-[#14241A] shrink-0">
                    <SafeImage
                      src={slideUrl}
                      fallbackSrc={GENERATED_IMAGES.hero}
                      alt={`Hero slide ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#0B5D27] dark:text-[#7AD959]">
                        {isAr
                          ? idx === 0
                            ? `الصورة #${idx + 1} (الافتتاحية)`
                            : `الصورة #${idx + 1}`
                          : idx === 0
                            ? `Slide #${idx + 1} (Primary)`
                            : `Slide #${idx + 1}`}
                      </span>
                    </div>
                    <input
                      type="text"
                      dir="ltr"
                      aria-label={isAr ? `رابط صورة الواجهة ${idx + 1}` : `Hero slide ${idx + 1} URL`}
                      value={slideUrl}
                      onChange={(e) => {
                        const next = [...heroSlides];
                        next[idx] = e.target.value;
                        setDraft((prev) => ({
                          ...prev,
                          heroImages: next,
                          heroImageUrl: next[0] || prev.heroImageUrl || GENERATED_IMAGES.hero,
                        }));
                      }}
                      className={inputCls}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <label
                      className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold bg-white dark:bg-[#14241A] text-[#0B5D27] dark:text-[#7AD959] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg cursor-pointer hover:bg-[#EAF3EC] dark:hover:bg-[#1C3224]"
                      title={isAr ? 'استبدال الصورة' : 'Replace image'}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">{isAr ? 'تغيير' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          void handleUploadSlideAt(idx, file);
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSlide(idx, idx - 1)}
                      aria-label={isAr ? `تحريك الصورة ${idx + 1} لأعلى` : `Move slide ${idx + 1} up`}
                      className="p-2 rounded-lg border border-[#DCE6DE] dark:border-[#243D2D] bg-white dark:bg-[#14241A] text-[#102116] dark:text-[#ECF4EE] disabled:opacity-40 hover:bg-[#EAF3EC] dark:hover:bg-[#1C3224]"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={idx === heroSlides.length - 1}
                      onClick={() => handleMoveSlide(idx, idx + 1)}
                      aria-label={isAr ? `تحريك الصورة ${idx + 1} لأسفل` : `Move slide ${idx + 1} down`}
                      className="p-2 rounded-lg border border-[#DCE6DE] dark:border-[#243D2D] bg-white dark:bg-[#14241A] text-[#102116] dark:text-[#ECF4EE] disabled:opacity-40 hover:bg-[#EAF3EC] dark:hover:bg-[#1C3224]"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={heroSlides.length <= 1}
                      onClick={() => handleRemoveSlide(idx)}
                      aria-label={isAr ? `حذف الصورة ${idx + 1}` : `Delete slide ${idx + 1}`}
                      className="p-2 rounded-lg border border-[#DCE6DE] dark:border-[#243D2D] bg-white dark:bg-[#14241A] text-[#B91C1C] dark:text-[#FCA5A5] disabled:opacity-40 hover:bg-[#FEF2F2] dark:hover:bg-[#2A1515]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {heroSlides.length < MAX_HERO_SLIDES && (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={newSlideUrl}
                  onChange={(e) => setNewSlideUrl(e.target.value)}
                  placeholder="https://... أو /uploads/public/..."
                  className={`${inputCls} flex-1 min-w-[220px]`}
                />
                <button
                  type="button"
                  onClick={handleAddSlideByUrl}
                  disabled={!newSlideUrl.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] bg-[#F1F6F2] dark:bg-[#17281D] hover:bg-[#E2EDE5] dark:hover:bg-[#1F3526] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'إضافة برابط' : 'Add URL'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#DCE6DE] dark:border-[#213629]">
            <div>
              <label className="block text-xs font-bold mb-1">من هي Protec (عربي)</label>
              <textarea
                rows={4}
                value={draft.aboutSummaryAr}
                onChange={(e) => setDraft({ ...draft, aboutSummaryAr: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Who is Protec (EN)</label>
              <textarea
                rows={4}
                dir="ltr"
                value={draft.aboutSummaryEn}
                onChange={(e) => setDraft({ ...draft, aboutSummaryEn: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">الرؤية (عربي)</label>
              <textarea
                rows={2}
                value={draft.visionAr}
                onChange={(e) => setDraft({ ...draft, visionAr: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Vision (EN)</label>
              <textarea
                rows={2}
                dir="ltr"
                value={draft.visionEn}
                onChange={(e) => setDraft({ ...draft, visionEn: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">الرسالة (عربي)</label>
              <textarea
                rows={2}
                value={draft.missionAr}
                onChange={(e) => setDraft({ ...draft, missionAr: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Mission (EN)</label>
              <textarea
                rows={2}
                dir="ltr"
                value={draft.missionEn}
                onChange={(e) => setDraft({ ...draft, missionEn: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-lg font-bold text-[#102116] dark:text-[#ECF4EE]">
            {isAr ? 'بيانات الشركة ووسائل التواصل' : 'Company Contact & Social Media'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">
                {isAr ? 'أرقام الهاتف (مفصولة بفاصلة)' : 'Phone Numbers (comma-separated)'}
              </label>
              <input
                type="text"
                dir="ltr"
                value={draft.phones.join(', ')}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    phones: e.target.value
                      .split(',')
                      .map((p) => p.trim())
                      .filter(Boolean),
                  })
                }
                className={`${inputCls} font-mono-num`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">
                {isAr ? 'رقم واتساب (مع كود الدولة)' : 'WhatsApp Number (with country code)'}
              </label>
              <input
                type="text"
                dir="ltr"
                value={draft.whatsappNumber}
                onChange={(e) => setDraft({ ...draft, whatsappNumber: e.target.value })}
                className={`${inputCls} font-mono-num`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">
                {isAr ? 'البريد الإلكتروني الرسمي' : 'Official Email'}
              </label>
              <input
                type="email"
                dir="ltr"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Facebook URL</label>
              <input
                type="url"
                dir="ltr"
                value={draft.facebookUrl}
                onChange={(e) => setDraft({ ...draft, facebookUrl: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">TikTok URL</label>
              <input
                type="url"
                dir="ltr"
                value={draft.tiktokUrl}
                onChange={(e) => setDraft({ ...draft, tiktokUrl: e.target.value })}
                placeholder="https://www.tiktok.com/@protec"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Instagram URL</label>
              <input
                type="url"
                dir="ltr"
                value={draft.instagramUrl || ''}
                onChange={(e) => setDraft({ ...draft, instagramUrl: e.target.value })}
                placeholder="https://www.instagram.com/protec"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">العنوان (عربي)</label>
              <input
                type="text"
                value={draft.addressAr}
                onChange={(e) => setDraft({ ...draft, addressAr: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Address (EN)</label>
              <input
                type="text"
                dir="ltr"
                value={draft.addressEn}
                onChange={(e) => setDraft({ ...draft, addressEn: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#DCE6DE] dark:border-[#213629] space-y-4">
            <h4 className="text-sm font-bold text-[#102116] dark:text-[#ECF4EE]">
              {isAr
                ? 'نطاق التغطية والمناطق المتاحة للمعاينة الميدانية'
                : 'Service Coverage & Currently Available Site-Visit Areas'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">
                  {isAr ? 'بيان التغطية على مستوى مصر (عربي)' : 'Egypt Coverage Statement (AR)'}
                </label>
                <input
                  type="text"
                  value={draft.coverageStatementAr || ''}
                  onChange={(e) =>
                    setDraft({ ...draft, coverageStatementAr: e.target.value })
                  }
                  placeholder="تخدم شركة بروتيك جميع محافظات جمهورية مصر العربية"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">
                  {isAr ? 'بيان التغطية على مستوى مصر (إنجليزي)' : 'Egypt Coverage Statement (EN)'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={draft.coverageStatementEn || ''}
                  onChange={(e) =>
                    setDraft({ ...draft, coverageStatementEn: e.target.value })
                  }
                  placeholder="Protec serves all governorates across Egypt"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">
                  {isAr ? 'المناطق المتاحة للمعاينة حالياً (عربي)' : 'Available Site-Visit Areas (AR)'}
                </label>
                <input
                  type="text"
                  value={draft.availableAreasAr || ''}
                  onChange={(e) =>
                    setDraft({ ...draft, availableAreasAr: e.target.value })
                  }
                  placeholder="دمياط والمنصورة"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">
                  {isAr ? 'المناطق المتاحة للمعاينة حالياً (إنجليزي)' : 'Available Site-Visit Areas (EN)'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={draft.availableAreasEn || ''}
                  onChange={(e) =>
                    setDraft({ ...draft, availableAreasEn: e.target.value })
                  }
                  placeholder="Damietta and Mansoura"
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {errorMsg && <p className="text-xs text-[#B91C1C] dark:text-[#FCA5A5]">{errorMsg}</p>}
      {savedNotice && (
        <p className="text-xs font-semibold text-[#0B5D27] dark:text-[#7AD959]">
          {isAr ? 'تم تحديث بيانات الموقع وحفظها فوراً.' : 'Site settings saved and published.'}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] rounded-lg min-h-[44px]"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>{isAr ? 'حفظ ونشر التعديلات' : 'Save & Publish Changes'}</span>
      </button>
    </form>
  );
};
