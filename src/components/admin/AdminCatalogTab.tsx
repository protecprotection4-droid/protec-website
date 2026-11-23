import React, { useState } from 'react';
import { ImagePlus, Loader2, Plus, RotateCcw, Trash2, Upload } from 'lucide-react';
import {
  deleteServerOffer,
  deleteServerProject,
  deleteServerService,
  uploadAdminImageWithToken,
  upsertServerOffer,
  upsertServerProject,
  upsertServerService,
} from '../../lib/adminApi';
import {
  removeOffer,
  removeProject,
  removeService,
  upsertOffer,
  upsertProject,
  upsertService,
} from '../../lib/firestoreService';
import { Language, OfferItem, ProjectCategory, ProjectItem, ServiceItem } from '../../types';
import {
  validateOfferInput,
  validateProjectInput,
  validateServiceInput,
} from '../../utils/validation';
import { SafeImage } from '../SafeImage';

const DEFAULT_OFFER_IMAGE = '/src/assets/images/service_plant_protection_1795348345527.jpg';

interface AdminCatalogTabProps {
  lang: Language;
  mode: 'services' | 'projects' | 'offers';
  services: ServiceItem[];
  projects: ProjectItem[];
  offers: OfferItem[];
  onRefresh: () => Promise<void>;
  getAuthToken: () => Promise<string | null>;
  isFirebaseAdmin: boolean;
}

export const AdminCatalogTab: React.FC<AdminCatalogTabProps> = ({
  lang,
  mode,
  services,
  projects,
  offers,
  onRefresh,
  getAuthToken,
  isFirebaseAdmin,
}) => {
  const isAr = lang === 'ar';
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Service Form State
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isNewService, setIsNewService] = useState(false);

  // Project Form State
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);

  // Offer Form State
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [isNewOffer, setIsNewOffer] = useState(false);

  const handleImageFileChange = async (
    uploadKey: string,
    file: File | undefined,
    onUrl: (url: string) => void
  ) => {
    if (!file) return;
    setUploadingKey(uploadKey);
    setUploadNotice(null);
    setErrorMsg(null);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Authentication required');
      const url = await uploadAdminImageWithToken(token, file);
      onUrl(url);
      setUploadNotice(
        isAr ? `تم رفع الصورة (${file.name}) بنجاح.` : `Uploaded photo (${file.name}).`
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingKey(null);
    }
  };

  if (mode === 'services') {
    return (
      <div className="space-y-6 text-[#102116] dark:text-[#ECF4EE]">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-[#102116] dark:text-[#ECF4EE]">
            {isAr ? 'إدارة الخدمات' : 'Manage Services'} ({services.length})
          </h3>
          <button
            type="button"
            onClick={() => {
              setIsNewService(true);
              setErrorMsg(null);
              setSuccessMsg(null);
              setUploadNotice(null);
              setEditingService({
                id: `srv-${Date.now()}`,
                order: services.length + 1,
                slug: `service-${services.length + 1}`,
                titleAr: '',
                titleEn: '',
                shortDescAr: '',
                shortDescEn: '',
                fullDescAr: '',
                fullDescEn: '',
                featuresAr: [],
                featuresEn: [],
                imageUrl: '/src/assets/images/hero_protec_landscape_1795348344206.jpg',
                active: true,
              });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] rounded-lg whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة خدمة جديدة' : 'Add Service'}</span>
          </button>
        </div>

        {editingService && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setErrorMsg(null);
              const val = validateServiceInput(editingService);
              if (!val.valid) {
                setErrorMsg(
                  isAr
                    ? 'يرجى استكمال جميع الحقول المطلوبة بصيغة صحيحة (Slug بالإنجليزية الصغيرة والأرقام).'
                    : 'Please complete all required fields with a valid lowercase slug.'
                );
                return;
              }
              setSaving(true);
              try {
                const token = await getAuthToken();
                if (!token) throw new Error('Authentication required');
                await upsertServerService(token, editingService, isNewService);
                if (isFirebaseAdmin) {
                  await upsertService(editingService, isNewService).catch(() => undefined);
                }
                setEditingService(null);
                setSuccessMsg(isAr ? 'تم حفظ الخدمة بنجاح.' : 'Service saved.');
                await onRefresh();
              } catch (err) {
                setErrorMsg(err instanceof Error ? err.message : 'Save failed');
              } finally {
                setSaving(false);
              }
            }}
            className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-6 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">Slug (a-z, 0-9, -)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editingService.slug}
                  onChange={(e) =>
                    setEditingService({ ...editingService, slug: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">
                  {isAr ? 'الترتيب' : 'Display Order'}
                </label>
                <input
                  type="number"
                  value={editingService.order}
                  onChange={(e) =>
                    setEditingService({ ...editingService, order: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm font-mono-num"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={editingService.active}
                    onChange={(e) =>
                      setEditingService({ ...editingService, active: e.target.checked })
                    }
                  />
                  <span>{isAr ? 'نشطة بالموقع' : 'Active'}</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">العنوان (عربي)</label>
                <input
                  type="text"
                  value={editingService.titleAr}
                  onChange={(e) =>
                    setEditingService({ ...editingService, titleAr: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Title (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editingService.titleEn}
                  onChange={(e) =>
                    setEditingService({ ...editingService, titleEn: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">وصف مختصر (عربي)</label>
                <textarea
                  rows={2}
                  value={editingService.shortDescAr}
                  onChange={(e) =>
                    setEditingService({ ...editingService, shortDescAr: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Short Description (EN)</label>
                <textarea
                  rows={2}
                  dir="ltr"
                  value={editingService.shortDescEn}
                  onChange={(e) =>
                    setEditingService({ ...editingService, shortDescEn: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">الوصف التفصيلي (عربي)</label>
                <textarea
                  rows={3}
                  value={editingService.fullDescAr}
                  onChange={(e) =>
                    setEditingService({ ...editingService, fullDescAr: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Full Description (EN)</label>
                <textarea
                  rows={3}
                  dir="ltr"
                  value={editingService.fullDescEn}
                  onChange={(e) =>
                    setEditingService({ ...editingService, fullDescEn: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-bold mb-1">
                  {isAr ? 'رابط الصورة أو رفع صورة جديدة' : 'Image URL or Upload'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={editingService.imageUrl}
                  onChange={(e) =>
                    setEditingService({ ...editingService, imageUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                />
              </div>
              <label className="mt-5 inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-[#F1F6F2] dark:bg-[#17281D] text-[#0B5D27] dark:text-[#7AD959] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg cursor-pointer whitespace-nowrap">
                {uploadingKey === 'service' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>{isAr ? 'رفع صورة' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    void handleImageFileChange('service', file, (url) =>
                      setEditingService((prev) => (prev ? { ...prev, imageUrl: url } : prev))
                    );
                  }}
                />
              </label>
            </div>

            {uploadNotice && <p className="text-xs font-semibold text-[#0B5D27]">{uploadNotice}</p>}
            {errorMsg && <p className="text-xs text-[#B91C1C]">{errorMsg}</p>}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || Boolean(uploadingKey)}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#0B5D27] rounded-lg disabled:opacity-60"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isAr ? 'حفظ' : 'Save'}</span>
              </button>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 text-sm text-[#4B6152]"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>
        )}

        {successMsg && <p className="text-xs font-semibold text-[#0B5D27]">{successMsg}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] text-[#102116] dark:text-[#ECF4EE] rounded-xl p-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <span className="text-xs font-mono-num text-[#0B5D27] font-bold">
                  #{srv.order} · {srv.active ? (isAr ? 'نشطة' : 'Active') : isAr ? 'مخفية' : 'Hidden'}
                </span>
                <h4 className="text-sm font-bold text-[#102116] mt-0.5">
                  {isAr ? srv.titleAr : srv.titleEn}
                </h4>
                <p className="text-xs text-[#4B6152] mt-1 line-clamp-2">
                  {isAr ? srv.shortDescAr : srv.shortDescEn}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewService(false);
                    setUploadNotice(null);
                    setErrorMsg(null);
                    setEditingService(srv);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#F1F6F2] text-[#0B5D27] rounded-lg"
                >
                  {isAr ? 'تعديل' : 'Edit'}
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${srv.titleEn}`}
                  onClick={async () => {
                    const token = await getAuthToken();
                    if (!token) return;
                    await deleteServerService(token, srv.id);
                    if (isFirebaseAdmin) {
                      await removeService(srv.id).catch(() => undefined);
                    }
                    await onRefresh();
                  }}
                  className="p-1.5 text-[#B91C1C] hover:bg-[#FEF2F2] rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'projects') {
    return (
      <div className="space-y-6 text-[#102116] dark:text-[#ECF4EE]">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-[#102116] dark:text-[#ECF4EE]">
            {isAr ? 'إدارة المشروعات (قبل وبعد)' : 'Manage Projects (Before & After)'} ({projects.length})
          </h3>
          <button
            type="button"
            onClick={() => {
              setIsNewProject(true);
              setErrorMsg(null);
              setSuccessMsg(null);
              setUploadNotice(null);
              setEditingProject({
                id: `prj-${Date.now()}`,
                titleAr: '',
                titleEn: '',
                category: 'landscaping',
                locationAr: '',
                locationEn: '',
                areaSqm: 300,
                summaryAr: '',
                summaryEn: '',
                beforeImageUrl: '/src/assets/images/project_before_arid_1795348344409.jpg',
                afterImageUrl: '/src/assets/images/project_after_lush_1795348344098.jpg',
                featured: true,
              });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] rounded-lg whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة مشروع جديد' : 'Add Project'}</span>
          </button>
        </div>

        {editingProject && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setErrorMsg(null);
              const val = validateProjectInput(editingProject);
              if (!val.valid) {
                setErrorMsg(
                  isAr ? 'يرجى استكمال كافة بيانات المشروع وصور قبل وبعد.' : 'Complete all project fields.'
                );
                return;
              }
              setSaving(true);
              try {
                const token = await getAuthToken();
                if (!token) throw new Error('Authentication required');
                await upsertServerProject(token, editingProject, isNewProject);
                if (isFirebaseAdmin) {
                  await upsertProject(editingProject, isNewProject).catch(() => undefined);
                }
                setEditingProject(null);
                setSuccessMsg(isAr ? 'تم حفظ المشروع بنجاح.' : 'Project saved.');
                await onRefresh();
              } catch (err) {
                setErrorMsg(err instanceof Error ? err.message : 'Save failed');
              } finally {
                setSaving(false);
              }
            }}
            className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] text-[#102116] dark:text-[#ECF4EE] rounded-xl p-6 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">{isAr ? 'التصنيف' : 'Category'}</label>
                <select
                  value={editingProject.category}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      category: e.target.value as ProjectCategory,
                    })
                  }
                  className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                >
                  <option value="landscaping">{isAr ? 'اللاندسكيب' : 'Landscaping'}</option>
                  <option value="plant-protection">{isAr ? 'وقاية النبات' : 'Plant Protection'}</option>
                  <option value="irrigation">{isAr ? 'شبكات الري' : 'Irrigation'}</option>
                  <option value="maintenance">{isAr ? 'الصيانة الدورية' : 'Maintenance'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">{isAr ? 'المساحة (م²)' : 'Area (m²)'}</label>
                <input
                  type="number"
                  value={editingProject.areaSqm || 0}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, areaSqm: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm font-mono-num"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={editingProject.featured}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, featured: e.target.checked })
                    }
                  />
                  <span>{isAr ? 'مشروع مميز' : 'Featured'}</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">اسم المشروع (عربي)</label>
                <input
                  type="text"
                  value={editingProject.titleAr}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, titleAr: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Project Title (EN)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editingProject.titleEn}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, titleEn: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">الموقع (عربي)</label>
                <input
                  type="text"
                  value={editingProject.locationAr}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, locationAr: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Location (EN)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editingProject.locationEn}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, locationEn: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">ملخص التنفيذ (عربي)</label>
                <textarea
                  rows={3}
                  value={editingProject.summaryAr}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, summaryAr: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Summary (EN)</label>
                <textarea
                  rows={3}
                  dir="ltr"
                  value={editingProject.summaryEn}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, summaryEn: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold mb-1">
                    {isAr ? 'صورة قبل التنفيذ' : 'Before Photo URL'}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingProject.beforeImageUrl}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, beforeImageUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                  />
                </div>
                <label className="px-3 py-2 text-xs font-semibold bg-[#F1F6F2] dark:bg-[#17281D] text-[#0B5D27] dark:text-[#7AD959] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg cursor-pointer shrink-0 whitespace-nowrap inline-flex items-center gap-1">
                  {uploadingKey === 'before' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isAr ? 'رفع' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      void handleImageFileChange('before', file, (url) =>
                        setEditingProject((prev) =>
                          prev ? { ...prev, beforeImageUrl: url } : prev
                        )
                      );
                    }}
                  />
                </label>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold mb-1">
                    {isAr ? 'صورة بعد التنفيذ' : 'After Photo URL'}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editingProject.afterImageUrl}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, afterImageUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                  />
                </div>
                <label className="px-3 py-2 text-xs font-semibold bg-[#F1F6F2] dark:bg-[#17281D] text-[#0B5D27] dark:text-[#7AD959] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg cursor-pointer shrink-0 whitespace-nowrap inline-flex items-center gap-1">
                  {uploadingKey === 'after' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isAr ? 'رفع' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      void handleImageFileChange('after', file, (url) =>
                        setEditingProject((prev) =>
                          prev ? { ...prev, afterImageUrl: url } : prev
                        )
                      );
                    }}
                  />
                </label>
              </div>
            </div>

            {uploadNotice && <p className="text-xs font-semibold text-[#0B5D27]">{uploadNotice}</p>}
            {errorMsg && <p className="text-xs text-[#B91C1C]">{errorMsg}</p>}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || Boolean(uploadingKey)}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#0B5D27] rounded-lg disabled:opacity-60"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isAr ? 'حفظ' : 'Save'}</span>
              </button>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 text-sm text-[#4B6152]"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>
        )}

        {successMsg && <p className="text-xs font-semibold text-[#0B5D27]">{successMsg}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((prj) => (
            <div
              key={prj.id}
              className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] text-[#102116] dark:text-[#ECF4EE] rounded-xl p-4 flex items-start justify-between gap-4"
            >
              <div>
                <span className="text-xs font-semibold text-[#0B5D27]">{prj.category}</span>
                <h4 className="text-sm font-bold text-[#102116] mt-0.5">
                  {isAr ? prj.titleAr : prj.titleEn}
                </h4>
                <p className="text-xs text-[#4B6152] mt-1">
                  {isAr ? prj.locationAr : prj.locationEn}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewProject(false);
                    setUploadNotice(null);
                    setErrorMsg(null);
                    setEditingProject(prj);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#F1F6F2] text-[#0B5D27] rounded-lg"
                >
                  {isAr ? 'تعديل' : 'Edit'}
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${prj.titleEn}`}
                  onClick={async () => {
                    const token = await getAuthToken();
                    if (!token) return;
                    await deleteServerProject(token, prj.id);
                    if (isFirebaseAdmin) {
                      await removeProject(prj.id).catch(() => undefined);
                    }
                    await onRefresh();
                  }}
                  className="p-1.5 text-[#B91C1C] hover:bg-[#FEF2F2] rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Offers Mode
  return (
    <div className="space-y-6 text-[#102116] dark:text-[#ECF4EE]">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-[#102116] dark:text-[#ECF4EE]">
          {isAr ? 'إدارة العروض والخصومات' : 'Manage Offers & Packages'} ({offers.length})
        </h3>
        <button
          type="button"
          onClick={() => {
            setIsNewOffer(true);
            setErrorMsg(null);
            setSuccessMsg(null);
            setUploadNotice(null);
            setEditingOffer({
              id: `off-${Date.now()}`,
              titleAr: '',
              titleEn: '',
              descriptionAr: '',
              descriptionEn: '',
              discountLabelAr: 'خصم 15%',
              discountLabelEn: '15% OFF',
              originalPrice: '',
              offerPrice: '',
              expiresAt: '2026-12-31',
              serviceType: services[0]?.slug || 'landscape-design',
              imageUrl: DEFAULT_OFFER_IMAGE,
              active: true,
            });
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] rounded-lg whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة عرض جديد' : 'Add Offer'}</span>
        </button>
      </div>

      {editingOffer && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setErrorMsg(null);
            const val = validateOfferInput(editingOffer);
            if (!val.valid) {
              setErrorMsg(
                val.errors.imageUrl
                  ? isAr
                    ? 'يرجى رفع صورة صالحة للعرض أو إدخال رابط صورة صحيح.'
                    : 'Please upload a valid offer photo or enter a valid image URL.'
                  : isAr
                    ? 'يرجى استكمال تفاصيل العرض وتاريخ الانتهاء.'
                    : 'Complete all required offer fields.'
              );
              return;
            }
            setSaving(true);
            try {
              const token = await getAuthToken();
              if (!token) throw new Error('Authentication required');
              await upsertServerOffer(token, editingOffer, isNewOffer);
              if (isFirebaseAdmin) {
                await upsertOffer(editingOffer, isNewOffer).catch(() => undefined);
              }
              setEditingOffer(null);
              setSuccessMsg(isAr ? 'تم حفظ العرض بنجاح ونشره بالموقع.' : 'Offer saved and published.');
              await onRefresh();
            } catch (err) {
              setErrorMsg(err instanceof Error ? err.message : 'Save failed');
            } finally {
              setSaving(false);
            }
          }}
          className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] text-[#102116] dark:text-[#ECF4EE] rounded-xl p-6 space-y-5"
        >
          {/* Dedicated Offer Photo Section */}
          <div className="bg-[#F7FAF7] dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] text-[#102116] dark:text-[#ECF4EE] rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-full sm:w-52 shrink-0">
                <div className="aspect-[4/3] bg-[#EDF5EF] dark:bg-[#14241A] border border-[#DCE6DE] dark:border-[#213629] rounded-lg overflow-hidden flex items-center justify-center">
                  {editingOffer.imageUrl.trim() ? (
                    <SafeImage
                      src={editingOffer.imageUrl}
                      alt={editingOffer.titleEn || editingOffer.titleAr || 'Offer photo preview'}
                      fallbackTitle={editingOffer.titleAr || editingOffer.titleEn || 'Protec Offer'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-xs text-[#4B6152] p-3 text-center">
                      <ImagePlus className="w-6 h-6 text-[#0B5D27]" aria-hidden="true" />
                      <span>{isAr ? 'لم يتم اختيار صورة' : 'No photo selected'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 w-full space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-[#102116]">
                    {isAr ? 'صورة العرض الترويجي *' : 'Offer Photo *'}
                  </h4>
                  <p className="text-xs text-[#4B6152] mt-0.5">
                    {isAr
                      ? 'ارفع صورة من جهازك (JPG, PNG, WEBP, GIF — حتى 12 ميجابايت) أو أدخل رابط الصورة مباشرة.'
                      : 'Upload a photo from your device (JPG, PNG, WEBP, GIF — up to 12 MB) or enter an image URL.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-[#0B5D27] hover:bg-[#08431C] text-white rounded-lg cursor-pointer whitespace-nowrap min-h-[40px]">
                    {uploadingKey === 'offer' ? (
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Upload className="w-4 h-4" aria-hidden="true" />
                    )}
                    <span>
                      {uploadingKey === 'offer'
                        ? isAr
                          ? 'جاري رفع الصورة...'
                          : 'Uploading Photo...'
                        : isAr
                          ? 'رفع صورة العرض'
                          : 'Upload Offer Photo'}
                    </span>
                    <input
                      id="offer-photo-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      disabled={uploadingKey === 'offer'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        void handleImageFileChange('offer', file, (url) =>
                          setEditingOffer((prev) => (prev ? { ...prev, imageUrl: url } : prev))
                        );
                      }}
                    />
                  </label>

                  {editingOffer.imageUrl !== DEFAULT_OFFER_IMAGE && (
                    <button
                      type="button"
                      onClick={() => {
                        setUploadNotice(null);
                        setEditingOffer({ ...editingOffer, imageUrl: DEFAULT_OFFER_IMAGE });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#4B6152] dark:text-[#A3B9AA] hover:text-[#102116] dark:hover:text-[#ECF4EE] bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-lg whitespace-nowrap min-h-[40px]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{isAr ? 'الصورة الافتراضية' : 'Use Default'}</span>
                    </button>
                  )}
                </div>

                <div>
                  <label htmlFor="offer-image-url" className="block text-xs font-semibold text-[#4B6152] mb-1">
                    {isAr ? 'أو رابط الصورة' : 'Or Image URL'}
                  </label>
                  <input
                    id="offer-image-url"
                    type="text"
                    dir="ltr"
                    value={editingOffer.imageUrl}
                    onChange={(e) =>
                      setEditingOffer({ ...editingOffer, imageUrl: e.target.value })
                    }
                    placeholder="/uploads/public/... or https://..."
                    className="w-full px-3 py-2 bg-white border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-xs font-mono-num"
                  />
                </div>

                {uploadNotice && (
                  <p className="text-xs font-semibold text-[#0B5D27]">{uploadNotice}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">
                {isAr ? 'تاريخ انتهاء العرض' : 'Expiration Date'}
              </label>
              <input
                type="date"
                dir="ltr"
                value={editingOffer.expiresAt.slice(0, 10)}
                onChange={(e) =>
                  setEditingOffer({ ...editingOffer, expiresAt: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm font-mono-num"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">
                {isAr ? 'الخدمة المرتبطة' : 'Linked Service'}
              </label>
              <select
                value={editingOffer.serviceType}
                onChange={(e) =>
                  setEditingOffer({ ...editingOffer, serviceType: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.slug}>
                    {isAr ? s.titleAr : s.titleEn}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={editingOffer.active}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, active: e.target.checked })
                  }
                />
                <span>{isAr ? 'عرض مفعل' : 'Active'}</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">عنوان العرض (عربي)</label>
              <input
                type="text"
                value={editingOffer.titleAr}
                onChange={(e) =>
                  setEditingOffer({ ...editingOffer, titleAr: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Offer Title (EN)</label>
              <input
                type="text"
                dir="ltr"
                value={editingOffer.titleEn}
                onChange={(e) =>
                  setEditingOffer({ ...editingOffer, titleEn: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">نسبة/عنوان الخصم (عربي)</label>
              <input
                type="text"
                value={editingOffer.discountLabelAr}
                onChange={(e) =>
                  setEditingOffer({ ...editingOffer, discountLabelAr: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Discount Label (EN)</label>
              <input
                type="text"
                dir="ltr"
                value={editingOffer.discountLabelEn}
                onChange={(e) =>
                  setEditingOffer({ ...editingOffer, discountLabelEn: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">السعر قبل العرض (اختياري)</label>
              <input
                type="text"
                value={editingOffer.originalPrice || ''}
                onChange={(e) =>
                  setEditingOffer({ ...editingOffer, originalPrice: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">السعر بعد العرض (اختياري)</label>
              <input
                type="text"
                value={editingOffer.offerPrice || ''}
                onChange={(e) =>
                  setEditingOffer({ ...editingOffer, offerPrice: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">تفاصيل العرض (عربي)</label>
              <textarea
                rows={3}
                value={editingOffer.descriptionAr}
                onChange={(e) =>
                  setEditingOffer({ ...editingOffer, descriptionAr: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Offer Details (EN)</label>
              <textarea
                rows={3}
                dir="ltr"
                value={editingOffer.descriptionEn}
                onChange={(e) =>
                  setEditingOffer({ ...editingOffer, descriptionEn: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#DCE6DE] dark:border-[#213629] bg-white dark:bg-[#0D1711] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
              />
            </div>
          </div>

          {errorMsg && <p className="text-xs text-[#B91C1C]">{errorMsg}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || Boolean(uploadingKey)}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#0B5D27] rounded-lg disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isAr ? 'حفظ العرض' : 'Save Offer'}</span>
            </button>
            <button
              type="button"
              onClick={() => setEditingOffer(null)}
              className="px-4 py-2 text-sm text-[#4B6152]"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </form>
      )}

      {successMsg && <p className="text-xs font-semibold text-[#0B5D27]">{successMsg}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map((off) => {
          const offTitle = isAr ? off.titleAr : off.titleEn;
          return (
            <div
              key={off.id}
              className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-4 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-20 h-16 rounded-lg overflow-hidden bg-[#EDF5EF] dark:bg-[#14241A] border border-[#DCE6DE] dark:border-[#213629] shrink-0">
                  <SafeImage
                    src={off.imageUrl}
                    alt={offTitle}
                    fallbackTitle={offTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-mono-num text-[#0B5D27] dark:text-[#7AD959] font-bold">
                    {isAr ? off.discountLabelAr : off.discountLabelEn} · {off.expiresAt}
                  </span>
                  <h4 className="text-sm font-bold text-[#102116] dark:text-[#ECF4EE] mt-0.5 truncate">{offTitle}</h4>
                  <p className="text-xs text-[#4B6152] dark:text-[#A3B9AA] mt-1 line-clamp-2">
                    {isAr ? off.descriptionAr : off.descriptionEn}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewOffer(false);
                    setUploadNotice(null);
                    setErrorMsg(null);
                    setEditingOffer(off);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#F1F6F2] dark:bg-[#17281D] text-[#0B5D27] dark:text-[#7AD959] rounded-lg"
                >
                  {isAr ? 'تعديل' : 'Edit'}
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${off.titleEn}`}
                  onClick={async () => {
                    const token = await getAuthToken();
                    if (!token) return;
                    await deleteServerOffer(token, off.id);
                    if (isFirebaseAdmin) {
                      await removeOffer(off.id).catch(() => undefined);
                    }
                    await onRefresh();
                  }}
                  className="p-1.5 text-[#B91C1C] dark:text-[#FCA5A5] hover:bg-[#FEF2F2] dark:hover:bg-[#2A1215] rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
