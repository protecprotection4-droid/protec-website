import React, { useEffect, useState } from 'react';
import { Download, Loader2, RefreshCw, Search, Trash2 } from 'lucide-react';
import { deleteServerQuote, updateServerQuote } from '../../lib/adminApi';
import { removeQuote, updateQuoteAdmin } from '../../lib/firestoreService';
import { Language, QuoteRequest, QuoteStatus } from '../../types';
import { buildQuotesCsv, downloadCsvFile } from '../../utils/csvExport';
import { AdminMediaPreview } from './AdminMediaPreview';

interface AdminQuotesTabProps {
  lang: Language;
  quotes: QuoteRequest[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  getAuthToken: () => Promise<string | null>;
  isFirebaseAdmin: boolean;
  firestoreQuoteIds?: Set<string>;
}

const STATUS_OPTIONS: { value: QuoteStatus; labelAr: string; labelEn: string }[] = [
  { value: 'new', labelAr: 'جديد', labelEn: 'New' },
  { value: 'reviewing', labelAr: 'قيد المراجعة', labelEn: 'Reviewing' },
  { value: 'scheduled', labelAr: 'تم تحديد معاينة', labelEn: 'Scheduled' },
  { value: 'quoted', labelAr: 'تم إرسال العرض', labelEn: 'Quoted' },
  { value: 'completed', labelAr: 'مكتمل', labelEn: 'Completed' },
];

export const AdminQuotesTab: React.FC<AdminQuotesTabProps> = ({
  lang,
  quotes,
  loading,
  onRefresh,
  getAuthToken,
  isFirebaseAdmin,
  firestoreQuoteIds,
}) => {
  const isAr = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | QuoteStatus>('all');
  const [selectedId, setSelectedId] = useState<string | null>(quotes[0]?.id || null);
  const [notesDraft, setNotesDraft] = useState(quotes[0]?.adminNotes || '');
  const [statusDraft, setStatusDraft] = useState<QuoteStatus>(quotes[0]?.status || 'new');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredQuotes = quotes.filter((q) => {
    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    const term = searchQuery.trim().toLowerCase();
    if (!term) return true;
    return (
      q.fullName.toLowerCase().includes(term) ||
      q.phone.toLowerCase().includes(term) ||
      q.referenceCode.toLowerCase().includes(term) ||
      q.governorate.toLowerCase().includes(term)
    );
  });

  const activeQuote =
    filteredQuotes.find((q) => q.id === selectedId) || filteredQuotes[0] || null;

  useEffect(() => {
    if (activeQuote) {
      setStatusDraft(activeQuote.status);
      setNotesDraft(activeQuote.adminNotes || '');
    }
  }, [activeQuote?.id]);

  const handleSelectQuote = (quote: QuoteRequest) => {
    setSelectedId(quote.id);
    setStatusDraft(quote.status);
    setNotesDraft(quote.adminNotes || '');
    setActionError(null);
    setActionSuccess(null);
  };

  const handleSaveUpdate = async () => {
    if (!activeQuote) return;
    setSaving(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Authentication required');
      await updateServerQuote(token, activeQuote.id, statusDraft, notesDraft).catch(
        (err) => {
          if (!isFirebaseAdmin || !firestoreQuoteIds?.has(activeQuote.id)) {
            throw err;
          }
        }
      );
      if (isFirebaseAdmin && firestoreQuoteIds?.has(activeQuote.id)) {
        await updateQuoteAdmin(activeQuote.id, statusDraft, notesDraft);
      }
      await onRefresh();
      setActionSuccess(isAr ? 'تم حفظ حالة الطلب والملاحظات.' : 'Quote status and notes saved.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to save update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Authentication required');
      await deleteServerQuote(token, id).catch(() => undefined);
      if (isFirebaseAdmin && firestoreQuoteIds?.has(id)) {
        await removeQuote(id);
      }
      setSelectedId(null);
      await onRefresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to delete quote');
    } finally {
      setSaving(false);
    }
  };

  const statusLabel = (s: QuoteStatus) => {
    const found = STATUS_OPTIONS.find((opt) => opt.value === s);
    return found ? (isAr ? found.labelAr : found.labelEn) : s;
  };

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="w-4 h-4 text-[#4B6152] dark:text-[#A3B9AA] absolute top-1/2 -translate-y-1/2 start-3"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isAr ? 'بحث بالاسم، الهاتف، أو الرقم المرجعي...' : 'Search by name, phone, or code...'
            }
            className="w-full ps-9 pe-4 py-2 bg-[#F7FAF7] dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm focus:outline-none focus:border-[#0B5D27] dark:focus:border-[#7AD959]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-[#0B5D27] text-white'
                : 'bg-[#F7FAF7] dark:bg-[#14241A] text-[#2E4235] dark:text-[#C4D8CA] hover:bg-[#EDF5EF] dark:hover:bg-[#1C3224]'
            }`}
          >
            {isAr ? 'الكل' : 'All'} ({quotes.length})
          </button>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
                statusFilter === opt.value
                  ? 'bg-[#0B5D27] text-white'
                  : 'bg-[#F7FAF7] dark:bg-[#14241A] text-[#2E4235] dark:text-[#C4D8CA] hover:bg-[#EDF5EF] dark:hover:bg-[#1C3224]'
              }`}
            >
              {isAr ? opt.labelAr : opt.labelEn}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={loading}
            aria-label={isAr ? 'تحديث الطلبات' : 'Refresh quotes'}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#0B5D27] dark:text-[#7AD959] bg-[#F1F6F2] dark:bg-[#17281D] hover:bg-[#E2EDE5] dark:hover:bg-[#1F3527] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isAr ? 'تحديث' : 'Refresh'}</span>
          </button>
          <button
            type="button"
            data-testid="export-quotes-csv"
            disabled={filteredQuotes.length === 0}
            onClick={() => {
              const dateStamp = new Date().toISOString().slice(0, 10);
              downloadCsvFile(`protec-quotes-${dateStamp}.csv`, buildQuotesCsv(filteredQuotes));
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] disabled:opacity-50 rounded-lg whitespace-nowrap transition-colors"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-12 flex items-center justify-center gap-2 text-sm text-[#4B6152] dark:text-[#A3B9AA]">
          <Loader2 className="w-5 h-5 animate-spin text-[#0B5D27] dark:text-[#7AD959]" />
          <span>{isAr ? 'جاري تحميل طلبات عروض الأسعار...' : 'Loading quote requests...'}</span>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-12 text-center text-sm text-[#4B6152] dark:text-[#A3B9AA]">
          {isAr
            ? 'لا توجد طلبات عروض أسعار أو معاينات مطابقة حتى الآن.'
            : 'No quote or site-inspection requests match the current filter.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Quotes List */}
          <div className="lg:col-span-5 bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl overflow-hidden divide-y divide-[#EDF2EE] dark:divide-[#1E3326]">
            {filteredQuotes.map((q) => {
              const selected = activeQuote?.id === q.id;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleSelectQuote(q)}
                  className={`w-full text-start p-4 transition-colors hover:bg-[#F7FAF7] dark:hover:bg-[#14241A] ${
                    selected ? 'bg-[#F1F6F2] dark:bg-[#17281D]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs mb-1">
                    <span className="font-mono-num font-bold text-[#0B5D27] dark:text-[#7AD959] tabular-nums">
                      {q.referenceCode}
                    </span>
                    <span className="font-semibold text-[#2E4235] dark:text-[#C4D8CA]">
                      {statusLabel(q.status)}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[#102116] dark:text-[#ECF4EE] truncate">{q.fullName}</div>
                  <div className="text-xs text-[#4B6152] dark:text-[#A3B9AA] mt-1 flex items-center gap-2">
                    <span className="font-mono-num" dir="ltr">
                      {q.phone}
                    </span>
                    <span>·</span>
                    <span className="truncate">
                      {q.governorate} - {q.area}
                    </span>
                  </div>
                  {q.attachments?.length > 0 && (
                    <div className="text-xs text-[#0B5D27] dark:text-[#7AD959] mt-1 font-medium">
                      {isAr
                        ? `${q.attachments.length} مرفقات (صور/فيديو)`
                        : `${q.attachments.length} attachment(s)`}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quote Details & Protected Attachments */}
          {activeQuote && (
            <div className="lg:col-span-7 bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#DCE6DE] dark:border-[#213629]">
                <div>
                  <span className="font-mono-num text-xs font-bold text-[#0B5D27] dark:text-[#7AD959]">
                    {activeQuote.referenceCode}
                  </span>
                  <h3 className="text-xl font-extrabold text-[#102116] dark:text-[#ECF4EE] mt-0.5">
                    {activeQuote.fullName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#4B6152] dark:text-[#A3B9AA] mt-1">
                    <a
                      href={`tel:${activeQuote.phone}`}
                      dir="ltr"
                      className="font-mono-num font-bold text-[#102116] dark:text-[#ECF4EE] hover:text-[#0B5D27] dark:hover:text-[#7AD959]"
                    >
                      {activeQuote.phone}
                    </a>
                    {activeQuote.email && (
                      <>
                        <span>·</span>
                        <span dir="ltr">{activeQuote.email}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDelete(activeQuote.id)}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#B91C1C] dark:text-[#FCA5A5] hover:bg-[#FEF2F2] dark:hover:bg-[#2A1215] rounded-lg border border-[#FECACA] dark:border-[#5C2026] whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{isAr ? 'حذف الطلب' : 'Delete'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-[#F7FAF7] dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] rounded-lg p-3.5">
                  <span className="text-xs text-[#4B6152] dark:text-[#A3B9AA] block mb-1">
                    {isAr ? 'العنوان والموقع' : 'Location & Address'}
                  </span>
                  <span className="font-semibold text-[#102116] dark:text-[#ECF4EE]">
                    {activeQuote.governorate} · {activeQuote.area}
                  </span>
                  <p className="text-xs text-[#4B6152] dark:text-[#A3B9AA] mt-1">{activeQuote.address}</p>
                </div>

                <div className="bg-[#F7FAF7] dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] rounded-lg p-3.5">
                  <span className="text-xs text-[#4B6152] dark:text-[#A3B9AA] block mb-1">
                    {isAr ? 'الخدمة والمساحة' : 'Service & Area'}
                  </span>
                  <span className="font-semibold text-[#102116] dark:text-[#ECF4EE] block">
                    {activeQuote.serviceType}
                  </span>
                  <span className="text-xs font-mono-num text-[#4B6152] dark:text-[#A3B9AA] tabular-nums">
                    {activeQuote.projectAreaSqm
                      ? `${activeQuote.projectAreaSqm} m²`
                      : isAr
                        ? 'المساحة غير محددة'
                        : 'Area not specified'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] mb-2">
                  {isAr ? 'تفاصيل المشروع' : 'Project Description'}
                </h4>
                <p className="text-sm text-[#102116] dark:text-[#ECF4EE] bg-[#F7FAF7] dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] rounded-lg p-4 leading-relaxed whitespace-pre-wrap">
                  {activeQuote.description}
                </p>
              </div>

              {/* Protected Photos & Videos */}
              <div>
                <h4 className="text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] mb-2.5">
                  {isAr
                    ? `الصور والفيديوهات المرفقة (${activeQuote.attachments?.length || 0})`
                    : `Attached Photos & Videos (${activeQuote.attachments?.length || 0})`}
                </h4>
                {!activeQuote.attachments || activeQuote.attachments.length === 0 ? (
                  <p className="text-xs text-[#4B6152] dark:text-[#A3B9AA]">
                    {isAr ? 'لم يرفق العميل صوراً أو فيديوهات.' : 'No media attachments provided.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeQuote.attachments.map((att) => (
                      <AdminMediaPreview
                        key={att.id}
                        attachment={att}
                        lang={lang}
                        getAuthToken={getAuthToken}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Status & Internal Notes */}
              <div className="pt-4 border-t border-[#DCE6DE] dark:border-[#213629] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="admin-quote-status"
                      className="block text-xs font-bold text-[#102116] dark:text-[#ECF4EE] mb-1.5"
                    >
                      {isAr ? 'حالة الطلب' : 'Request Status'}
                    </label>
                    <select
                      id="admin-quote-status"
                      value={statusDraft}
                      onChange={(e) => setStatusDraft(e.target.value as QuoteStatus)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {isAr ? opt.labelAr : opt.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-quote-notes"
                    className="block text-xs font-bold text-[#102116] dark:text-[#ECF4EE] mb-1.5"
                  >
                    {isAr ? 'ملاحظات الإدارة الهندسية' : 'Engineering Notes'}
                  </label>
                  <textarea
                    id="admin-quote-notes"
                    rows={3}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    placeholder={
                      isAr ? 'أضف ملاحظات المتابعة أو موعد المعاينة...' : 'Add internal notes...'
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] text-[#102116] dark:text-[#ECF4EE] rounded-lg text-sm"
                  />
                </div>

                {actionError && <p className="text-xs text-[#B91C1C] dark:text-[#FCA5A5]">{actionError}</p>}
                {actionSuccess && <p className="text-xs font-semibold text-[#0B5D27] dark:text-[#7AD959]">{actionSuccess}</p>}

                <button
                  type="button"
                  onClick={() => void handleSaveUpdate()}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] rounded-lg min-h-[42px]"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isAr ? 'حفظ التحديث' : 'Save Update'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
