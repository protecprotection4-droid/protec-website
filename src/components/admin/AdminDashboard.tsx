import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Database,
  Download,
  Edit3,
  Eye,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  Globe,
  KeyRound,
  Loader2,
  LogOut,
  PhoneCall,
  Save,
  Sprout,
  Star,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  deleteServerReview,
  fetchServerAdminStats,
  fetchServerQuotes,
  updateServerReview,
} from '../../lib/adminApi';
import {
  fetchAllQuotes,
  seedInitialDatabaseIfEmpty,
} from '../../lib/firestoreService';
import {
  AdminStats,
  Language,
  OfferItem,
  ProjectCategory,
  ProjectItem,
  QuoteRequest,
  ServiceItem,
  SiteContent,
  TestimonialItem,
} from '../../types';
import { buildReviewsCsv, downloadCsvFile } from '../../utils/csvExport';
import { AdminCatalogTab } from './AdminCatalogTab';
import { AdminQuotesTab } from './AdminQuotesTab';
import { AdminSiteSettingsTab } from './AdminSiteSettingsTab';
import { AdminWorkspaceTab } from './AdminWorkspaceTab';

type AdminTab =
  | 'quotes'
  | 'services'
  | 'projects'
  | 'offers'
  | 'reviews'
  | 'homepage'
  | 'company'
  | 'workspace';

interface AdminDashboardProps {
  lang: Language;
  siteContent: SiteContent;
  services: ServiceItem[];
  projects: ProjectItem[];
  offers: OfferItem[];
  testimonials: TestimonialItem[];
  onRefreshPublicData: () => Promise<void>;
  onBackToSite: () => void;
}

function getCreatedTimeMs(createdAt: unknown): number {
  if (typeof createdAt === 'string') {
    const parsed = Date.parse(createdAt);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (createdAt && typeof createdAt === 'object' && 'toMillis' in createdAt) {
    const fn = (createdAt as { toMillis?: () => number }).toMillis;
    if (typeof fn === 'function') return fn.call(createdAt);
  }
  return 0;
}

function mergeQuotes(serverQuotes: QuoteRequest[], firestoreQuotes: QuoteRequest[]): QuoteRequest[] {
  const byId = new Map<string, QuoteRequest>();
  for (const q of firestoreQuotes) {
    byId.set(q.id, q);
  }
  for (const q of serverQuotes) {
    byId.set(q.id, q);
  }
  return Array.from(byId.values()).sort(
    (a, b) => getCreatedTimeMs(b.createdAt) - getCreatedTimeMs(a.createdAt)
  );
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  lang,
  siteContent,
  services,
  projects,
  offers,
  testimonials,
  onRefreshPublicData,
  onBackToSite,
}) => {
  const isAr = lang === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const {
    user,
    isFirebaseAdmin,
    serverAdminEmail,
    serverPasswordConfigured,
    envPasscodeActive,
    isFullyAuthenticatedAdmin,
    signOutAdmin,
    getFirebaseIdToken,
    setupServerPassword,
    changeServerPassword,
  } = useAdminAuth();

  // Dashboard data state
  const [activeTab, setActiveTab] = useState<AdminTab>('quotes');
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [firestoreQuoteIds, setFirestoreQuoteIds] = useState<Set<string>>(new Set());
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<TestimonialItem | null>(null);
  const [savingReview, setSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Admin Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [rotatingPassword, setRotatingPassword] = useState(false);
  const [rotateError, setRotateError] = useState<string | null>(null);
  const [rotateSuccess, setRotateSuccess] = useState<string | null>(null);

  const loadQuotes = useCallback(async () => {
    if (!isFullyAuthenticatedAdmin) return;
    setQuotesLoading(true);
    try {
      const token = await getFirebaseIdToken();
      const [serverList, firestoreList, statsRes] = await Promise.all([
        token ? fetchServerQuotes(token).catch(() => []) : Promise.resolve([]),
        isFirebaseAdmin ? fetchAllQuotes().catch(() => []) : Promise.resolve([]),
        token ? fetchServerAdminStats(token).catch(() => null) : Promise.resolve(null),
      ]);
      setFirestoreQuoteIds(new Set(firestoreList.map((q) => q.id)));
      setQuotes(mergeQuotes(serverList, firestoreList));
      if (statsRes) {
        setAdminStats(statsRes);
      }
    } finally {
      setQuotesLoading(false);
    }
  }, [getFirebaseIdToken, isFirebaseAdmin, isFullyAuthenticatedAdmin]);

  useEffect(() => {
    if (isFullyAuthenticatedAdmin) {
      void loadQuotes();
    }
  }, [isFullyAuthenticatedAdmin, loadQuotes]);

  if (!isFullyAuthenticatedAdmin) {
    return null;
  }

  const signedInLabel = user?.email || serverAdminEmail || 'protecprotection4@gmail.com';

  const handleSeedDatabase = async () => {
    setSeedMessage(null);
    if (!isFirebaseAdmin) {
      await onRefreshPublicData();
      setSeedMessage(
        isAr
          ? 'تم تحديث ومزامنة البيانات من الخادم بنجاح.'
          : 'Public catalog synced and refreshed from server.'
      );
      return;
    }
    const seeded = await seedInitialDatabaseIfEmpty();
    await onRefreshPublicData();
    setSeedMessage(
      seeded
        ? isAr
          ? 'تم حفظ البيانات الافتراضية في Firestore بنجاح.'
          : 'Default Protec data synced to Firestore.'
        : isAr
          ? 'قاعدة البيانات مهيأة بالفعل وتم تحديث البيانات.'
          : 'Database already populated and refreshed.'
    );
  };

  const handleSaveReviewEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    setReviewError(null);
    setSavingReview(true);
    try {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Authentication required');
      await updateServerReview(token, editingReview.id, {
        authorNameAr: editingReview.authorNameAr,
        authorNameEn: editingReview.authorNameEn,
        roleAr: editingReview.roleAr,
        roleEn: editingReview.roleEn,
        organizationAr: editingReview.organizationAr,
        organizationEn: editingReview.organizationEn,
        locationAr: editingReview.locationAr,
        locationEn: editingReview.locationEn,
        serviceCategory: editingReview.serviceCategory,
        rating: Number(editingReview.rating),
        beforeStateAr: editingReview.beforeStateAr,
        beforeStateEn: editingReview.beforeStateEn,
        outcomeAr: editingReview.outcomeAr,
        outcomeEn: editingReview.outcomeEn,
        quoteAr: editingReview.quoteAr,
        quoteEn: editingReview.quoteEn,
        dateLabel: editingReview.dateLabel,
      });
      setEditingReview(null);
      await onRefreshPublicData();
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Unable to save review changes.');
    } finally {
      setSavingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    setReviewError(null);
    setDeletingReviewId(reviewId);
    try {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Authentication required');
      await deleteServerReview(token, reviewId);
      if (editingReview?.id === reviewId) {
        setEditingReview(null);
      }
      await onRefreshPublicData();
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Unable to remove review.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleRotatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRotateError(null);
    setRotateSuccess(null);

    if (newPassword.length < 8) {
      setRotateError(
        isAr
          ? 'يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل.'
          : 'New password must be at least 8 characters.'
      );
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setRotateError(isAr ? 'كلمتا المرور غير متطابقتين.' : 'New passwords do not match.');
      return;
    }

    setRotatingPassword(true);
    try {
      if (!serverPasswordConfigured) {
        await setupServerPassword(signedInLabel, newPassword);
      } else {
        await changeServerPassword(currentPassword, newPassword);
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setRotateSuccess(
        isAr ? 'تم تحديث كلمة مرور الإدارة بنجاح.' : 'Admin password updated successfully.'
      );
    } catch (err) {
      setRotateError(
        err instanceof Error
          ? err.message
          : isAr
            ? 'تعذر تحديث كلمة المرور.'
            : 'Unable to update admin password.'
      );
    } finally {
      setRotatingPassword(false);
    }
  };

  const tabs: { id: AdminTab; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    {
      id: 'quotes',
      labelAr: 'طلبات العملاء وعروض الأسعار',
      labelEn: 'Quote Requests',
      icon: <FileText className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'services',
      labelAr: 'إدارة الخدمات',
      labelEn: 'Services',
      icon: <Sprout className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'projects',
      labelAr: 'المشروعات (قبل وبعد)',
      labelEn: 'Projects',
      icon: <FolderKanban className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'offers',
      labelAr: 'العروض والباقات',
      labelEn: 'Offers',
      icon: <Tag className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'reviews',
      labelAr: `تقييمات العملاء (${testimonials.length})`,
      labelEn: `Client Reviews (${testimonials.length})`,
      icon: <Star className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'homepage',
      labelAr: 'الصفحة الرئيسية ومن نحن',
      labelEn: 'Homepage & About',
      icon: <Globe className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'company',
      labelAr: 'بيانات الشركة والتواصل',
      labelEn: 'Company Info',
      icon: <PhoneCall className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'workspace',
      labelAr: 'Google Sheets و Drive',
      labelEn: 'Google Sheets & Drive',
      icon: <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />,
    },
  ];

  const inputCls =
    'w-full px-3 py-2 bg-white dark:bg-[#0B150E] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg text-xs sm:text-sm text-[#102116] dark:text-[#ECF4EE] focus:outline-none focus:border-[#0B5D27] dark:focus:border-[#65B32E]';

  return (
    <div className="min-h-[85vh] bg-[#F7FAF7] dark:bg-[#09110C] py-8 transition-colors">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Workspace Header */}
        <div className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl px-6 py-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-[#4B6152] dark:text-[#A3B9AA]" dir="ltr">
              {isAr
                ? `Protec / لوحة تحكم الإدارة · ${signedInLabel}`
                : `Protec / Admin Dashboard · ${signedInLabel}`}
            </span>
            <h1 className="text-lg font-extrabold text-[#102116] dark:text-[#ECF4EE]">
              {isAr ? 'مركز إدارة المحتوى وطلبات العملاء' : 'Content & Lead Management Console'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => void handleSeedDatabase()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#F1F6F2] dark:bg-[#17281D] hover:bg-[#E2EDE5] dark:hover:bg-[#1F3527] text-[#0B5D27] dark:text-[#7AD959] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg min-h-[40px] whitespace-nowrap"
            >
              <Database className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isAr ? 'مزامنة البيانات' : 'Sync Data'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRotateError(null);
                setRotateSuccess(null);
                setShowPasswordModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#F7FAF7] dark:bg-[#14241A] hover:bg-[#EDF5EF] dark:hover:bg-[#1C3224] text-[#102116] dark:text-[#ECF4EE] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg min-h-[40px] whitespace-nowrap"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#0B5D27] dark:text-[#7AD959]" aria-hidden="true" />
              <span>{isAr ? 'كلمة مرور الإدارة' : 'Admin Password'}</span>
            </button>

            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#102116] dark:text-[#ECF4EE] hover:bg-[#F7FAF7] dark:hover:bg-[#14241A] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg min-h-[40px] whitespace-nowrap"
            >
              <BackArrow className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isAr ? 'عرض الموقع' : 'View Site'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setQuotes([]);
                void signOutAdmin();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#B91C1C] dark:text-[#FCA5A5] hover:bg-[#FEF2F2] dark:hover:bg-[#2A1215] border border-[#FECACA] dark:border-[#5C2026] rounded-lg min-h-[40px] whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isAr ? 'خروج' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {seedMessage && (
          <div className="mb-4 p-3 bg-white dark:bg-[#111E16] border border-[#0B5D27]/30 dark:border-[#7AD959]/30 text-xs font-semibold text-[#0B5D27] dark:text-[#7AD959] rounded-lg">
            {seedMessage}
          </div>
        )}

        {/* Overview KPI Strip including Visitor Count */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-[#4B6152] dark:text-[#A3B9AA] block">
                {isAr ? 'عدد زوار الموقع' : 'Total Website Visitors'}
              </span>
              <span
                data-testid="admin-visitor-count"
                className="font-mono-num text-2xl font-extrabold text-[#0B5D27] dark:text-[#7AD959] tabular-nums"
              >
                {adminStats ? adminStats.totalVisits : '—'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#F1F6F2] dark:bg-[#17281D] text-[#0B5D27] dark:text-[#7AD959] inline-flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-[#4B6152] dark:text-[#A3B9AA] block">
                {isAr ? 'إجمالي طلبات العملاء' : 'Quote Requests'}
              </span>
              <span
                data-testid="admin-quotes-count"
                className="font-mono-num text-2xl font-extrabold text-[#102116] dark:text-[#ECF4EE] tabular-nums"
              >
                {quotes.length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#F1F6F2] dark:bg-[#17281D] text-[#0B5D27] dark:text-[#7AD959] inline-flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-[#4B6152] dark:text-[#A3B9AA] block">
                {isAr ? 'تقييمات العملاء المنشورة' : 'Published Reviews'}
              </span>
              <span
                data-testid="admin-reviews-count"
                className="font-mono-num text-2xl font-extrabold text-[#102116] dark:text-[#ECF4EE] tabular-nums"
              >
                {testimonials.length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#F1F6F2] dark:bg-[#17281D] text-[#0B5D27] dark:text-[#7AD959] inline-flex items-center justify-center shrink-0">
              <Star className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-3 space-y-1">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors text-start min-h-[44px] ${
                    active
                      ? 'bg-[#0B5D27] text-white'
                      : 'text-[#2E4235] dark:text-[#C4D8CA] hover:bg-[#F7FAF7] dark:hover:bg-[#17281D]'
                  }`}
                >
                  {tab.icon}
                  <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                </button>
              );
            })}
          </aside>

          {/* Main Admin Viewport */}
          <main className="lg:col-span-9">
            {activeTab === 'quotes' && (
              <AdminQuotesTab
                lang={lang}
                quotes={quotes}
                loading={quotesLoading}
                onRefresh={loadQuotes}
                getAuthToken={getFirebaseIdToken}
                isFirebaseAdmin={isFirebaseAdmin}
                firestoreQuoteIds={firestoreQuoteIds}
              />
            )}

            {(activeTab === 'services' || activeTab === 'projects' || activeTab === 'offers') && (
              <AdminCatalogTab
                lang={lang}
                mode={activeTab}
                services={services}
                projects={projects}
                offers={offers}
                onRefresh={onRefreshPublicData}
                getAuthToken={getFirebaseIdToken}
                isFirebaseAdmin={isFirebaseAdmin}
              />
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DCE6DE] dark:border-[#213629]">
                  <div>
                    <h2 className="text-lg font-bold text-[#102116] dark:text-[#ECF4EE]">
                      {isAr ? 'إدارة جميع تقييمات وآراء العملاء' : 'Client Reviews & Testimonials Manager'}
                    </h2>
                    <p className="text-xs text-[#4B6152] dark:text-[#A3B9AA] mt-0.5">
                      {isAr
                        ? 'عرض وتعديل وحذف جميع التقييمات المنشورة على الموقع (الأساسية وتقييمات الزوار).'
                        : 'Edit or remove any published review on the website, including seeded testimonials and visitor ratings.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-num text-xs font-bold px-3 py-1.5 rounded-lg bg-[#F1F6F2] dark:bg-[#17281D] text-[#0B5D27] dark:text-[#7AD959]">
                      {isAr ? `${testimonials.length} تقييمات` : `${testimonials.length} reviews`}
                    </span>
                    <button
                      type="button"
                      data-testid="export-reviews-csv"
                      disabled={testimonials.length === 0}
                      onClick={() => {
                        const dateStamp = new Date().toISOString().slice(0, 10);
                        downloadCsvFile(
                          `protec-reviews-${dateStamp}.csv`,
                          buildReviewsCsv(testimonials)
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] disabled:opacity-50 rounded-lg whitespace-nowrap transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
                    </button>
                  </div>
                </div>

                {reviewError && (
                  <p className="p-3 bg-[#FEF2F2] dark:bg-[#2A1215] border border-[#FECACA] dark:border-[#5C2026] text-xs text-[#B91C1C] dark:text-[#FCA5A5] rounded-lg">
                    {reviewError}
                  </p>
                )}

                {testimonials.length === 0 ? (
                  <div className="py-10 text-center text-sm text-[#4B6152] dark:text-[#A3B9AA]">
                    {isAr
                      ? 'لا توجد تقييمات مسجلة حالياً.'
                      : 'No client reviews found.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testimonials.map((review) => {
                      const isEditingThis = editingReview?.id === review.id;
                      const isVisitor = review.source === 'visitor';
                      return (
                        <div
                          key={review.id}
                          data-testid={`admin-review-${review.id}`}
                          className="p-4 rounded-xl bg-[#F7FAF7] dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-bold text-[#102116] dark:text-[#ECF4EE]">
                                  {isAr ? review.authorNameAr : review.authorNameEn}
                                </span>
                                <span
                                  className={`px-2 py-0.5 text-[11px] font-bold rounded border ${
                                    isVisitor
                                      ? 'bg-[#E8F5EB] dark:bg-[#17281D] border-[#0B5D27]/30 text-[#0B5D27] dark:text-[#7AD959]'
                                      : 'bg-white dark:bg-[#14241A] border-[#DCE6DE] dark:border-[#243D2D] text-[#4B6152] dark:text-[#A3B9AA]'
                                  }`}
                                >
                                  {isVisitor
                                    ? isAr
                                      ? 'تقييم زائر'
                                      : 'Visitor'
                                    : isAr
                                      ? 'تقييم مُعد مسبقاً'
                                      : 'Featured'}
                                </span>
                                <span className="font-mono-num text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] inline-flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 fill-[#65B32E] text-[#65B32E]" aria-hidden="true" />
                                  {review.rating}/5
                                </span>
                                <span className="text-xs text-[#4B6152] dark:text-[#A3B9AA]">
                                  · {isAr ? review.serviceLabelAr : review.serviceLabelEn}
                                </span>
                                <span className="text-xs text-[#4B6152] dark:text-[#A3B9AA]">
                                  · {isAr ? review.locationAr : review.locationEn}
                                </span>
                                <span className="font-mono-num text-xs text-[#4B6152] dark:text-[#A3B9AA]">
                                  ({review.dateLabel})
                                </span>
                              </div>
                              <p className="text-sm text-[#102116] dark:text-[#ECF4EE] leading-relaxed">
                                “{isAr ? review.quoteAr : review.quoteEn}”
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-start">
                              <button
                                type="button"
                                onClick={() => {
                                  setReviewError(null);
                                  setEditingReview(isEditingThis ? null : { ...review });
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0B5D27] dark:text-[#7AD959] bg-white dark:bg-[#14241A] hover:bg-[#EDF5EF] dark:hover:bg-[#1C3224] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg"
                              >
                                <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>{isEditingThis ? (isAr ? 'إلغاء' : 'Cancel') : isAr ? 'تعديل' : 'Edit'}</span>
                              </button>

                              <button
                                type="button"
                                disabled={deletingReviewId === review.id}
                                onClick={() => void handleDeleteReview(review.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#B91C1C] dark:text-[#FCA5A5] hover:bg-[#FEF2F2] dark:hover:bg-[#2A1215] border border-[#FECACA] dark:border-[#5C2026] rounded-lg"
                              >
                                {deletingReviewId === review.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                )}
                                <span>{isAr ? 'حذف' : 'Delete'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Inline Review Editor */}
                          {isEditingThis && editingReview && (
                            <form
                              onSubmit={handleSaveReviewEdit}
                              className="pt-4 border-t border-[#DCE6DE] dark:border-[#213629] space-y-4"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-[#102116] dark:text-[#ECF4EE] mb-1">
                                    {isAr ? 'اسم العميل (عربي) *' : 'Author Name (AR) *'}
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={editingReview.authorNameAr}
                                    onChange={(e) =>
                                      setEditingReview({ ...editingReview, authorNameAr: e.target.value })
                                    }
                                    className={inputCls}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-[#102116] dark:text-[#ECF4EE] mb-1">
                                    {isAr ? 'اسم العميل (إنجليزي) *' : 'Author Name (EN) *'}
                                  </label>
                                  <input
                                    type="text"
                                    dir="ltr"
                                    required
                                    value={editingReview.authorNameEn}
                                    onChange={(e) =>
                                      setEditingReview({ ...editingReview, authorNameEn: e.target.value })
                                    }
                                    className={inputCls}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-[#102116] dark:text-[#ECF4EE] mb-1">
                                    {isAr ? 'الخدمة' : 'Service Category'}
                                  </label>
                                  <select
                                    value={editingReview.serviceCategory}
                                    onChange={(e) =>
                                      setEditingReview({
                                        ...editingReview,
                                        serviceCategory: e.target.value as ProjectCategory,
                                      })
                                    }
                                    className={inputCls}
                                  >
                                    <option value="plant-protection">
                                      {isAr ? 'وقاية النبات ومكافحة الآفات' : 'Plant Protection & IPM'}
                                    </option>
                                    <option value="landscaping">
                                      {isAr ? 'تصميم وتنفيذ اللاندسكيب' : 'Landscaping'}
                                    </option>
                                    <option value="irrigation">
                                      {isAr ? 'شبكات الري' : 'Irrigation'}
                                    </option>
                                    <option value="maintenance">
                                      {isAr ? 'الصيانة الدورية' : 'Maintenance'}
                                    </option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-[#102116] dark:text-[#ECF4EE] mb-1">
                                    {isAr ? 'التقييم (1 إلى 5)' : 'Rating (1 to 5)'}
                                  </label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={5}
                                    step={0.1}
                                    dir="ltr"
                                    required
                                    value={editingReview.rating}
                                    onChange={(e) =>
                                      setEditingReview({
                                        ...editingReview,
                                        rating: Number(e.target.value),
                                      })
                                    }
                                    className={`${inputCls} font-mono-num`}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-[#102116] dark:text-[#ECF4EE] mb-1">
                                    {isAr ? 'الموقع / المدينة (عربي)' : 'Location (AR)'}
                                  </label>
                                  <input
                                    type="text"
                                    value={editingReview.locationAr}
                                    onChange={(e) =>
                                      setEditingReview({ ...editingReview, locationAr: e.target.value })
                                    }
                                    className={inputCls}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-[#102116] dark:text-[#ECF4EE] mb-1">
                                    {isAr ? 'الموقع / المدينة (إنجليزي)' : 'Location (EN)'}
                                  </label>
                                  <input
                                    type="text"
                                    dir="ltr"
                                    value={editingReview.locationEn}
                                    onChange={(e) =>
                                      setEditingReview({ ...editingReview, locationEn: e.target.value })
                                    }
                                    className={inputCls}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-[#102116] dark:text-[#ECF4EE] mb-1">
                                    {isAr ? 'الصفة / الدور (عربي)' : 'Role (AR)'}
                                  </label>
                                  <input
                                    type="text"
                                    value={editingReview.roleAr}
                                    onChange={(e) =>
                                      setEditingReview({ ...editingReview, roleAr: e.target.value })
                                    }
                                    className={inputCls}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-[#102116] dark:text-[#ECF4EE] mb-1">
                                    {isAr ? 'الجهة / المشروع (عربي)' : 'Organization (AR)'}
                                  </label>
                                  <input
                                    type="text"
                                    value={editingReview.organizationAr}
                                    onChange={(e) =>
                                      setEditingReview({
                                        ...editingReview,
                                        organizationAr: e.target.value,
                                      })
                                    }
                                    className={inputCls}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-[#102116] dark:text-[#ECF4EE] mb-1">
                                    {isAr ? 'نص التقييم (عربي) *' : 'Review Text (AR) *'}
                                  </label>
                                  <textarea
                                    rows={3}
                                    required
                                    minLength={8}
                                    value={editingReview.quoteAr}
                                    onChange={(e) =>
                                      setEditingReview({ ...editingReview, quoteAr: e.target.value })
                                    }
                                    className={inputCls}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-[#102116] dark:text-[#ECF4EE] mb-1">
                                    {isAr ? 'نص التقييم (إنجليزي) *' : 'Review Text (EN) *'}
                                  </label>
                                  <textarea
                                    rows={3}
                                    dir="ltr"
                                    required
                                    minLength={8}
                                    value={editingReview.quoteEn}
                                    onChange={(e) =>
                                      setEditingReview({ ...editingReview, quoteEn: e.target.value })
                                    }
                                    className={inputCls}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-[#102116] dark:text-[#ECF4EE] mb-1">
                                    {isAr ? 'الحالة قبل التدخل (اختياري)' : 'Before State (AR)'}
                                  </label>
                                  <input
                                    type="text"
                                    value={editingReview.beforeStateAr}
                                    onChange={(e) =>
                                      setEditingReview({
                                        ...editingReview,
                                        beforeStateAr: e.target.value,
                                      })
                                    }
                                    className={inputCls}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-[#102116] dark:text-[#ECF4EE] mb-1">
                                    {isAr ? 'النتيجة المحققة (اختياري)' : 'Outcome (AR)'}
                                  </label>
                                  <input
                                    type="text"
                                    value={editingReview.outcomeAr}
                                    onChange={(e) =>
                                      setEditingReview({ ...editingReview, outcomeAr: e.target.value })
                                    }
                                    className={inputCls}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingReview(null)}
                                  className="px-3.5 py-2 text-xs font-semibold text-[#4B6152] dark:text-[#A3B9AA]"
                                >
                                  {isAr ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                  type="submit"
                                  disabled={savingReview}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] rounded-lg disabled:opacity-60"
                                >
                                  {savingReview ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Save className="w-3.5 h-3.5" aria-hidden="true" />
                                  )}
                                  <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {(activeTab === 'homepage' || activeTab === 'company') && (
              <AdminSiteSettingsTab
                lang={lang}
                mode={activeTab}
                content={siteContent}
                onRefresh={onRefreshPublicData}
                getAuthToken={getFirebaseIdToken}
                isFirebaseAdmin={isFirebaseAdmin}
              />
            )}

            {activeTab === 'workspace' && (
              <AdminWorkspaceTab
                lang={lang}
                siteContent={siteContent}
                services={services}
                projects={projects}
                offers={offers}
                quotes={quotes}
                testimonials={testimonials}
                onRefreshPublicData={onRefreshPublicData}
                getAuthToken={getFirebaseIdToken}
                isFirebaseAdmin={isFirebaseAdmin}
              />
            )}
          </main>
        </div>
      </div>

      {/* Password Management Modal */}
      {showPasswordModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rotate-password-title"
          className="fixed inset-0 z-50 bg-[#102116]/60 dark:bg-black/75 flex items-center justify-center p-4"
        >
          <div className="max-w-md w-full bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="rotate-password-title" className="text-base font-extrabold text-[#102116] dark:text-[#ECF4EE]">
                {!serverPasswordConfigured
                  ? isAr
                    ? 'تعيين كلمة مرور الدخول بالبريد'
                    : 'Create Admin Email/Password Login'
                  : isAr
                    ? 'تحديث كلمة مرور الإدارة'
                    : 'Update Admin Password'}
              </h2>
              <button
                type="button"
                aria-label={isAr ? 'إغلاق' : 'Close'}
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 text-[#4B6152] dark:text-[#A3B9AA] hover:text-[#102116] dark:hover:text-[#ECF4EE] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {envPasscodeActive ? (
              <p className="p-3 bg-[#F1F6F2] dark:bg-[#17281D] border border-[#DCE6DE] dark:border-[#243D2D] text-xs text-[#2E4235] dark:text-[#C4D8CA] rounded-lg leading-relaxed">
                {isAr
                  ? 'كلمة مرور الإدارة مُدارة حالياً عبر متغير البيئة ADMIN_PASSCODE على الخادم ولا يمكن تغييرها من الواجهة.'
                  : 'Admin password is currently managed via the ADMIN_PASSCODE environment variable on the server and cannot be changed from the UI.'}
              </p>
            ) : (
              <>
                {rotateError && (
                  <p className="p-2.5 bg-[#FEF2F2] dark:bg-[#2A1215] border border-[#FECACA] dark:border-[#5C2026] text-xs text-[#B91C1C] dark:text-[#FCA5A5] rounded-lg">
                    {rotateError}
                  </p>
                )}
                {rotateSuccess && (
                  <p className="p-2.5 bg-[#F1F6F2] dark:bg-[#17281D] border border-[#0B5D27]/30 dark:border-[#7AD959]/30 text-xs font-semibold text-[#0B5D27] dark:text-[#7AD959] rounded-lg">
                    {rotateSuccess}
                  </p>
                )}

                <form onSubmit={handleRotatePassword} className="space-y-3.5">
                  {serverPasswordConfigured && (
                    <div>
                      <label className="block text-xs font-bold text-[#102116] dark:text-[#ECF4EE] mb-1">
                        {isAr ? 'كلمة المرور الحالية' : 'Current Password'}
                      </label>
                      <input
                        type="password"
                        dir="ltr"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F7FAF7] dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-[#102116] dark:text-[#ECF4EE] mb-1">
                      {isAr ? 'كلمة المرور الجديدة (8+ أحرف)' : 'New Password (8+ characters)'}
                    </label>
                    <input
                      type="password"
                      dir="ltr"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7FAF7] dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#102116] dark:text-[#ECF4EE] mb-1">
                      {isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                    </label>
                    <input
                      type="password"
                      dir="ltr"
                      required
                      minLength={8}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7FAF7] dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-[#4B6152] dark:text-[#A3B9AA]"
                    >
                      {isAr ? 'إغلاق' : 'Close'}
                    </button>
                    <button
                      type="submit"
                      disabled={rotatingPassword}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] rounded-lg disabled:opacity-60"
                    >
                      {rotatingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{isAr ? 'حفظ التحديث' : 'Save Password'}</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
