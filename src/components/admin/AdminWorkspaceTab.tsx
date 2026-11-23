import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  FolderOpen,
  HardDrive,
  Link2,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { saveServerSiteContent } from '../../lib/adminApi';
import { saveSiteContent } from '../../lib/firestoreService';
import {
  clearWorkspaceAccessToken,
  connectGoogleWorkspace,
  createOrFindDriveFolder,
  createProtecMasterSpreadsheet,
  deleteDriveFile,
  fetchSpreadsheetMeta,
  getWorkspaceAccessToken,
  getWorkspaceAuthState,
  initWorkspaceAuth,
  listWorkspaceDriveFiles,
  SpreadsheetMetadata,
  syncDataToSpreadsheet,
  uploadJsonBackupToDrive,
  WorkspaceDriveFile,
} from '../../lib/googleWorkspace';
import {
  Language,
  OfferItem,
  ProjectItem,
  QuoteRequest,
  ServiceItem,
  SiteContent,
  TestimonialItem,
} from '../../types';
import {
  extractSpreadsheetIdFromInput,
  isExpectedWorkspaceAccount,
  PRIMARY_WORKSPACE_EMAIL,
} from '../../utils/googleWorkspaceFormat';

interface AdminWorkspaceTabProps {
  lang: Language;
  siteContent: SiteContent;
  services: ServiceItem[];
  projects: ProjectItem[];
  offers: OfferItem[];
  quotes: QuoteRequest[];
  testimonials: TestimonialItem[];
  onRefreshPublicData: () => Promise<void>;
  getAuthToken: () => Promise<string | null>;
  isFirebaseAdmin: boolean;
}

type PendingWorkspaceAction =
  | { type: 'sync-sheet'; spreadsheetId: string; sheetTitle: string }
  | { type: 'upload-backup'; folderName: string }
  | { type: 'delete-file'; file: WorkspaceDriveFile }
  | null;

const DRIVE_BACKUP_FOLDER_NAME = 'Protec — Backups (بروتيك)';

export const AdminWorkspaceTab: React.FC<AdminWorkspaceTabProps> = ({
  lang,
  siteContent,
  services,
  projects,
  offers,
  quotes,
  testimonials,
  onRefreshPublicData,
  getAuthToken,
  isFirebaseAdmin,
}) => {
  const isAr = lang === 'ar';

  const [needsAuth, setNeedsAuth] = useState<boolean>(() => !getWorkspaceAuthState().connected);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(
    () => getWorkspaceAuthState().email
  );
  const [connecting, setConnecting] = useState(false);

  const [sheetInput, setSheetInput] = useState<string>(
    () => siteContent.googleSheetUrl || siteContent.googleSheetId || ''
  );
  const [sheetMeta, setSheetMeta] = useState<SpreadsheetMetadata | null>(null);
  const [driveFiles, setDriveFiles] = useState<WorkspaceDriveFile[]>([]);
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [busyAction, setBusyAction] = useState(false);

  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingWorkspaceAction>(null);

  useEffect(() => {
    setSheetInput(siteContent.googleSheetUrl || siteContent.googleSheetId || '');
  }, [siteContent.googleSheetId, siteContent.googleSheetUrl]);

  const persistWorkspaceTargets = useCallback(
    async (patch: Partial<Pick<SiteContent, 'googleSheetId' | 'googleSheetUrl' | 'googleDriveFolderId'>>) => {
      const token = await getAuthToken();
      if (!token) return;
      const nextContent: SiteContent = {
        ...siteContent,
        ...patch,
      };
      const saved = await saveServerSiteContent(token, nextContent);
      if (isFirebaseAdmin) {
        await saveSiteContent(saved).catch(() => undefined);
      }
      await onRefreshPublicData();
    },
    [getAuthToken, isFirebaseAdmin, onRefreshPublicData, siteContent]
  );

  const loadWorkspaceAssets = useCallback(
    async (explicitSheetId?: string) => {
      const token = await getWorkspaceAccessToken();
      if (!token) {
        setNeedsAuth(true);
        return;
      }
      setLoadingWorkspace(true);
      setErrorMsg(null);
      try {
        const files = await listWorkspaceDriveFiles();
        setDriveFiles(files);

        const targetId = explicitSheetId || siteContent.googleSheetId;
        if (targetId) {
          const meta = await fetchSpreadsheetMeta(targetId).catch(() => null);
          setSheetMeta(meta);
        }
      } catch (err) {
        if (err instanceof Error && err.message === 'WORKSPACE_AUTH_REQUIRED') {
          setNeedsAuth(true);
        } else {
          setErrorMsg(err instanceof Error ? err.message : 'Unable to load Google Workspace files.');
        }
      } finally {
        setLoadingWorkspace(false);
      }
    },
    [siteContent.googleSheetId]
  );

  useEffect(() => {
    const unsubscribe = initWorkspaceAuth(
      (user) => {
        setNeedsAuth(false);
        setConnectedEmail(user.email || null);
        void loadWorkspaceAssets();
      },
      () => {
        setNeedsAuth(true);
        setConnectedEmail(null);
      }
    );
    return () => unsubscribe();
  }, [loadWorkspaceAssets]);

  const handleConnectGoogle = async () => {
    setConnecting(true);
    setErrorMsg(null);
    setStatusNotice(null);
    try {
      const result = await connectGoogleWorkspace();
      setConnectedEmail(result.email);
      setNeedsAuth(false);
      await loadWorkspaceAssets();
      setStatusNotice(
        isAr
          ? `تم الربط بحساب Google (${result.email || PRIMARY_WORKSPACE_EMAIL}) بنجاح.`
          : `Connected Google Workspace as ${result.email || PRIMARY_WORKSPACE_EMAIL}.`
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : isAr
            ? 'تعذر إتمام الربط مع Google.'
            : 'Unable to authorize Google Workspace access.'
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectWorkspace = () => {
    clearWorkspaceAccessToken();
    setNeedsAuth(true);
    setDriveFiles([]);
    setSheetMeta(null);
    setStatusNotice(
      isAr ? 'تم إنهاء جلسة Google Sheets و Drive مؤقتاً.' : 'Workspace authorization cleared.'
    );
  };

  const handleCreateMasterSpreadsheet = async () => {
    setBusyAction(true);
    setErrorMsg(null);
    setStatusNotice(null);
    try {
      let folderId = siteContent.googleDriveFolderId;
      if (!folderId) {
        const folder = await createOrFindDriveFolder(DRIVE_BACKUP_FOLDER_NAME);
        folderId = folder.id;
      }

      const result = await createProtecMasterSpreadsheet(quotes, testimonials, folderId);
      setSheetMeta({
        spreadsheetId: result.spreadsheetId,
        title: result.title,
        spreadsheetUrl: result.spreadsheetUrl,
        sheetTitles: result.sheetTitles,
      });
      setSheetInput(result.spreadsheetUrl);

      await persistWorkspaceTargets({
        googleSheetId: result.spreadsheetId,
        googleSheetUrl: result.spreadsheetUrl,
        googleDriveFolderId: folderId,
      });
      await loadWorkspaceAssets(result.spreadsheetId);

      setStatusNotice(
        isAr
          ? `تم إنشاء شيت بروتيك ومزامنة ${result.quotesWritten} طلبات و ${result.reviewsWritten} تقييمات.`
          : `Created "${result.title}" and synced ${result.quotesWritten} quotes & ${result.reviewsWritten} reviews.`
      );
    } catch (err) {
      if (err instanceof Error && err.message === 'WORKSPACE_AUTH_REQUIRED') {
        setNeedsAuth(true);
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'Unable to create Google Sheet.');
      }
    } finally {
      setBusyAction(false);
    }
  };

  const handleLinkExistingSpreadsheet = async (e: React.FormEvent) => {
    e.preventDefault();
    const extracted = extractSpreadsheetIdFromInput(sheetInput);
    if (!extracted) {
      setErrorMsg(
        isAr
          ? 'يرجى إدخال رابط Google Sheets صحيح أو معرف الشيت (Spreadsheet ID).'
          : 'Please enter a valid Google Sheets URL or Spreadsheet ID.'
      );
      return;
    }

    setBusyAction(true);
    setErrorMsg(null);
    setStatusNotice(null);
    try {
      const meta = await fetchSpreadsheetMeta(extracted);
      setSheetMeta(meta);
      setSheetInput(meta.spreadsheetUrl);
      await persistWorkspaceTargets({
        googleSheetId: meta.spreadsheetId,
        googleSheetUrl: meta.spreadsheetUrl,
      });
      setStatusNotice(
        isAr
          ? `تم ربط الشيت "${meta.title}" بنجاح (${meta.sheetTitles.join('، ')}).`
          : `Linked spreadsheet "${meta.title}" (${meta.sheetTitles.join(', ')}).`
      );
    } catch (err) {
      if (err instanceof Error && err.message === 'WORKSPACE_AUTH_REQUIRED') {
        setNeedsAuth(true);
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'Unable to read spreadsheet metadata.');
      }
    } finally {
      setBusyAction(false);
    }
  };

  const executeConfirmedAction = async () => {
    if (!pendingAction) return;
    const action = pendingAction;
    setPendingAction(null);
    setBusyAction(true);
    setErrorMsg(null);
    setStatusNotice(null);

    try {
      if (action.type === 'sync-sheet') {
        const result = await syncDataToSpreadsheet(action.spreadsheetId, quotes, testimonials);
        setSheetMeta({
          spreadsheetId: result.spreadsheetId,
          title: result.title,
          spreadsheetUrl: result.spreadsheetUrl,
          sheetTitles: result.sheetTitles,
        });
        setStatusNotice(
          isAr
            ? `تم تحديث Google Sheets بنجاح (${result.quotesWritten} طلبات + ${result.reviewsWritten} تقييمات).`
            : `Synced ${result.quotesWritten} quotes and ${result.reviewsWritten} reviews to "${result.title}".`
        );
      } else if (action.type === 'upload-backup') {
        const folder = await createOrFindDriveFolder(DRIVE_BACKUP_FOLDER_NAME);
        const dateStamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const fileName = `protec-backup-${dateStamp}.json`;
        await uploadJsonBackupToDrive(folder.id, fileName, {
          exportedAt: new Date().toISOString(),
          account: connectedEmail || PRIMARY_WORKSPACE_EMAIL,
          siteContent,
          services,
          projects,
          offers,
          quotes,
          testimonials,
        });
        await persistWorkspaceTargets({ googleDriveFolderId: folder.id });
        await loadWorkspaceAssets();
        setStatusNotice(
          isAr
            ? `تم حفظ النسخة الاحتياطية (${fileName}) في مجلد Google Drive بنجاح.`
            : `Saved full backup "${fileName}" to Google Drive.`
        );
      } else if (action.type === 'delete-file') {
        await deleteDriveFile(action.file.id);
        await loadWorkspaceAssets();
        setStatusNotice(
          isAr
            ? `تم حذف الملف "${action.file.name}" من Google Drive.`
            : `Deleted "${action.file.name}" from Google Drive.`
        );
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'WORKSPACE_AUTH_REQUIRED') {
        setNeedsAuth(true);
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'Google Workspace operation failed.');
      }
    } finally {
      setBusyAction(false);
    }
  };

  const activeSpreadsheetId = sheetMeta?.spreadsheetId || siteContent.googleSheetId || '';
  const activeSpreadsheetUrl =
    sheetMeta?.spreadsheetUrl ||
    siteContent.googleSheetUrl ||
    (activeSpreadsheetId ? `https://docs.google.com/spreadsheets/d/${activeSpreadsheetId}/edit` : '');
  const accountMatchesPrimary = isExpectedWorkspaceAccount(connectedEmail);

  return (
    <div className="space-y-6" data-testid="admin-workspace-tab">
      {/* Header & Account Connection Status */}
      <div className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#DCE6DE] dark:border-[#213629]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0B5D27] dark:text-[#7AD959]">
              <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
              <span>{isAr ? 'تكامل Google Workspace' : 'Google Workspace Integration'}</span>
            </div>
            <h2 className="text-lg font-extrabold text-[#102116] dark:text-[#ECF4EE]">
              {isAr
                ? 'ربط الموقع مع Google Sheets و Google Drive'
                : 'Connect Protec to Google Sheets & Google Drive'}
            </h2>
            <p className="text-xs text-[#4B6152] dark:text-[#A3B9AA] leading-relaxed">
              {isAr
                ? 'مزامنة طلبات عرض السعر وتقييمات العملاء مباشرة مع جدول Google Sheets، وحفظ نسخ احتياطية كاملة على Google Drive باستخدام حساب الإدارة الرئيسي:'
                : 'Sync quote requests and customer reviews directly to Google Sheets and store backups in Google Drive using the primary account:'}
            </p>
            <div className="pt-0.5">
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F1F6F2] dark:bg-[#17281D] border border-[#DCE6DE] dark:border-[#243D2D] font-mono-num text-xs font-bold text-[#0B5D27] dark:text-[#7AD959]"
                dir="ltr"
              >
                {PRIMARY_WORKSPACE_EMAIL}
              </span>
            </div>
          </div>

          {!needsAuth && connectedEmail && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void loadWorkspaceAssets()}
                disabled={loadingWorkspace}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0B5D27] dark:text-[#7AD959] bg-[#F1F6F2] dark:bg-[#17281D] hover:bg-[#E2EDE5] dark:hover:bg-[#1F3527] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingWorkspace ? 'animate-spin' : ''}`} />
                <span>{isAr ? 'تحديث الملفات' : 'Refresh'}</span>
              </button>
              <button
                type="button"
                onClick={() => void handleConnectGoogle()}
                disabled={connecting}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#102116] dark:text-[#ECF4EE] bg-white dark:bg-[#14241A] hover:bg-[#F7FAF7] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg"
              >
                <span>{isAr ? 'تبديل الحساب' : 'Switch Account'}</span>
              </button>
              <button
                type="button"
                onClick={handleDisconnectWorkspace}
                className="px-3 py-2 text-xs font-semibold text-[#B91C1C] dark:text-[#FCA5A5] hover:bg-[#FEF2F2] dark:hover:bg-[#2A1215] border border-[#FECACA] dark:border-[#5C2026] rounded-lg"
              >
                {isAr ? 'فصل الجلسة' : 'Disconnect'}
              </button>
            </div>
          )}
        </div>

        {/* Auth Gate or Connected Account Badge */}
        {needsAuth ? (
          <div className="p-5 rounded-xl bg-[#F7FAF7] dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#102116] dark:text-[#ECF4EE]">
                {isAr
                  ? 'تفويض الوصول إلى Google Sheets و Google Drive'
                  : 'Authorize Google Sheets & Drive Access'}
              </h3>
              <p className="text-xs text-[#4B6152] dark:text-[#A3B9AA]">
                {isAr
                  ? `اضغط على الزر للموافقة بحساب ${PRIMARY_WORKSPACE_EMAIL} وتمكين المزامنة.`
                  : `Sign in with ${PRIMARY_WORKSPACE_EMAIL} to create spreadsheets and save Drive backups.`}
              </p>
            </div>

            <button
              type="button"
              data-testid="workspace-google-signin"
              disabled={connecting}
              onClick={() => void handleConnectGoogle()}
              className="gsi-material-button shrink-0"
            >
              <div className="gsi-material-button-state" />
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{ display: 'block' }}
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  {connecting ? 'Connecting...' : 'Sign in with Google'}
                </span>
              </div>
            </button>
          </div>
        ) : (
          <div
            className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
              accountMatchesPrimary
                ? 'bg-[#F1F6F2] dark:bg-[#17281D] border-[#0B5D27]/30 dark:border-[#7AD959]/30'
                : 'bg-[#FFFBEB] dark:bg-[#2A220E] border-[#FCD34D] dark:border-[#92400E]'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              {accountMatchesPrimary ? (
                <CheckCircle2 className="w-4 h-4 text-[#0B5D27] dark:text-[#7AD959] shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24] shrink-0" />
              )}
              <div>
                <span className="text-[#102116] dark:text-[#ECF4EE]">
                  {isAr ? 'متصل الآن بحساب: ' : 'Connected Google Account: '}
                </span>
                <span className="font-mono-num font-bold" dir="ltr">
                  {connectedEmail}
                </span>
                {!accountMatchesPrimary && (
                  <p className="text-[11px] text-[#92400E] dark:text-[#FCD34D] mt-0.5">
                    {isAr
                      ? `ملاحظة: الحساب الرئيسي المطلوب هو ${PRIMARY_WORKSPACE_EMAIL}. يمكنك تبديل الحساب أعلاه.`
                      : `Note: Expected primary account is ${PRIMARY_WORKSPACE_EMAIL}. Use Switch Account above if needed.`}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {statusNotice && (
          <p className="p-3 bg-[#F1F6F2] dark:bg-[#17281D] border border-[#0B5D27]/30 dark:border-[#7AD959]/30 text-xs font-semibold text-[#0B5D27] dark:text-[#7AD959] rounded-lg">
            {statusNotice}
          </p>
        )}
        {errorMsg && (
          <p className="p-3 bg-[#FEF2F2] dark:bg-[#2A1215] border border-[#FECACA] dark:border-[#5C2026] text-xs font-semibold text-[#B91C1C] dark:text-[#FCA5A5] rounded-lg">
            {errorMsg}
          </p>
        )}
      </div>

      {/* Google Sheets Sync Panel */}
      <div className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#DCE6DE] dark:border-[#213629]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#F1F6F2] dark:bg-[#17281D] text-[#0B5D27] dark:text-[#7AD959] inline-flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#102116] dark:text-[#ECF4EE]">
                {isAr ? 'مزامنة Google Sheets' : 'Google Sheets Synchronization'}
              </h3>
              <p className="text-xs text-[#4B6152] dark:text-[#A3B9AA]">
                {isAr
                  ? `البيانات الجاهزة للمزامنة: ${quotes.length} طلب عرض سعر · ${testimonials.length} تقييم عميل`
                  : `Ready to sync: ${quotes.length} quote requests · ${testimonials.length} reviews`}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={needsAuth || busyAction}
            onClick={() => void handleCreateMasterSpreadsheet()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] disabled:opacity-50 rounded-lg transition-colors"
          >
            {busyAction ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>
              {isAr ? 'إنشاء شيت Google جديد لبروتيك' : 'Create New Protec Google Sheet'}
            </span>
          </button>
        </div>

        {/* Link existing spreadsheet URL or ID */}
        <form onSubmit={handleLinkExistingSpreadsheet} className="space-y-2">
          <label
            htmlFor="google-sheet-url-input"
            className="block text-xs font-bold text-[#102116] dark:text-[#ECF4EE]"
          >
            {isAr
              ? 'رابط جدول Google Sheets أو معرف الشيت (Spreadsheet URL / ID)'
              : 'Google Sheets URL or Spreadsheet ID'}
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              id="google-sheet-url-input"
              type="text"
              dir="ltr"
              value={sheetInput}
              onChange={(e) => setSheetInput(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="flex-1 px-3 py-2.5 bg-[#F7FAF7] dark:bg-[#0B150E] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg text-xs text-[#102116] dark:text-[#ECF4EE] font-mono-num"
            />
            <button
              type="submit"
              disabled={needsAuth || busyAction || !sheetInput.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F1F6F2] dark:bg-[#17281D] hover:bg-[#E2EDE5] dark:hover:bg-[#1F3527] text-[#0B5D27] dark:text-[#7AD959] border border-[#DCE6DE] dark:border-[#243D2D] disabled:opacity-50 rounded-lg whitespace-nowrap"
            >
              <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isAr ? 'ربط الشيت' : 'Link Sheet'}</span>
            </button>
          </div>
        </form>

        {/* Active Sheet Info + Explicit Confirmation Sync Button */}
        {activeSpreadsheetId && (
          <div className="p-4 rounded-xl bg-[#F7FAF7] dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#102116] dark:text-[#ECF4EE]">
                  {sheetMeta?.title || 'Protec — Quotes & Reviews (بروتيك)'}
                </p>
                <p className="font-mono-num text-[11px] text-[#4B6152] dark:text-[#A3B9AA]" dir="ltr">
                  ID: {activeSpreadsheetId}
                </p>
                {sheetMeta?.sheetTitles && sheetMeta.sheetTitles.length > 0 && (
                  <p className="text-[11px] text-[#4B6152] dark:text-[#A3B9AA]">
                    {isAr ? 'التبويبات المكتشفة: ' : 'Detected tabs: '}
                    <span className="font-mono-num" dir="ltr">
                      {sheetMeta.sheetTitles.join(' · ')}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeSpreadsheetUrl && (
                  <a
                    href={activeSpreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B5D27] dark:text-[#7AD959] bg-white dark:bg-[#14241A] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg hover:bg-[#EDF5EF]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isAr ? 'فتح في Google Sheets' : 'Open Sheet'}</span>
                  </a>
                )}

                <button
                  type="button"
                  data-testid="sync-google-sheet-btn"
                  disabled={needsAuth || busyAction}
                  onClick={() =>
                    setPendingAction({
                      type: 'sync-sheet',
                      spreadsheetId: activeSpreadsheetId,
                      sheetTitle: sheetMeta?.title || activeSpreadsheetId,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] disabled:opacity-50 rounded-lg"
                >
                  <UploadCloud className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>
                    {isAr
                      ? 'مزامنة الطلبات والتقييمات إلى الشيت'
                      : 'Sync Quotes & Reviews to Sheet'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Google Drive Backup Panel */}
      <div className="bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#DCE6DE] dark:border-[#213629]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#F1F6F2] dark:bg-[#17281D] text-[#0B5D27] dark:text-[#7AD959] inline-flex items-center justify-center">
              <HardDrive className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#102116] dark:text-[#ECF4EE]">
                {isAr ? 'النسخ الاحتياطي عبر Google Drive' : 'Google Drive Backups & Files'}
              </h3>
              <p className="text-xs text-[#4B6152] dark:text-[#A3B9AA]">
                {isAr
                  ? `المجلد المخصص: ${DRIVE_BACKUP_FOLDER_NAME}`
                  : `Target folder: ${DRIVE_BACKUP_FOLDER_NAME}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="backup-google-drive-btn"
            disabled={needsAuth || busyAction}
            onClick={() =>
              setPendingAction({
                type: 'upload-backup',
                folderName: DRIVE_BACKUP_FOLDER_NAME,
              })
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B5D27] hover:bg-[#08431C] disabled:opacity-50 rounded-lg"
          >
            <UploadCloud className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isAr ? 'رفع نسخة احتياطية الآن إلى Drive' : 'Save Backup to Google Drive'}</span>
          </button>
        </div>

        {driveFiles.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#4B6152] dark:text-[#A3B9AA]">
            {needsAuth
              ? isAr
                ? 'قم بالربط بحساب Google أعلاه لعرض ملفات Google Drive الخاصة بالتطبيق.'
                : 'Sign in with Google above to view app-managed Google Drive files.'
              : isAr
                ? 'لا توجد ملفات أو نسخ احتياطية مرفوعة على Google Drive حتى الآن.'
                : 'No Google Drive backups or spreadsheets created yet.'}
          </div>
        ) : (
          <div className="space-y-2.5">
            {driveFiles.map((file) => (
              <div
                key={file.id}
                className="p-3.5 rounded-xl bg-[#F7FAF7] dark:bg-[#0D1711] border border-[#DCE6DE] dark:border-[#213629] flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#14241A] border border-[#DCE6DE] dark:border-[#243D2D] text-[#0B5D27] dark:text-[#7AD959] inline-flex items-center justify-center shrink-0">
                    {file.mimeType.includes('folder') ? (
                      <FolderOpen className="w-4 h-4" aria-hidden="true" />
                    ) : file.mimeType.includes('spreadsheet') ? (
                      <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <HardDrive className="w-4 h-4" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#102116] dark:text-[#ECF4EE] truncate">
                      {file.name}
                    </p>
                    {file.modifiedTime && (
                      <p className="font-mono-num text-[11px] text-[#4B6152] dark:text-[#A3B9AA]">
                        {file.modifiedTime.slice(0, 19).replace('T', ' ')} UTC
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {file.webViewLink && (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0B5D27] dark:text-[#7AD959] bg-white dark:bg-[#14241A] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg hover:bg-[#EDF5EF]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{isAr ? 'فتح' : 'Open'}</span>
                    </a>
                  )}
                  <button
                    type="button"
                    aria-label={isAr ? `حذف ${file.name}` : `Delete ${file.name}`}
                    onClick={() => setPendingAction({ type: 'delete-file', file })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#B91C1C] dark:text-[#FCA5A5] hover:bg-[#FEF2F2] dark:hover:bg-[#2A1215] border border-[#FECACA] dark:border-[#5C2026] rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isAr ? 'حذف' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Explicit Confirmation Modal Before Any Mutating or Destructive Workspace API Call */}
      {pendingAction && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="workspace-confirm-title"
          className="fixed inset-0 z-50 bg-[#102116]/60 dark:bg-black/75 flex items-center justify-center p-4"
        >
          <div className="max-w-md w-full bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3
                id="workspace-confirm-title"
                className="text-base font-extrabold text-[#102116] dark:text-[#ECF4EE]"
              >
                {pendingAction.type === 'delete-file'
                  ? isAr
                    ? 'تأكيد حذف الملف من Google Drive'
                    : 'Confirm Google Drive File Deletion'
                  : pendingAction.type === 'sync-sheet'
                    ? isAr
                      ? 'تأكيد تحديث جدول Google Sheets'
                      : 'Confirm Google Sheets Update'
                    : isAr
                      ? 'تأكيد حفظ نسخة احتياطية في Google Drive'
                      : 'Confirm Google Drive Backup Upload'}
              </h3>
              <button
                type="button"
                aria-label={isAr ? 'إغلاق' : 'Close'}
                onClick={() => setPendingAction(null)}
                className="p-1.5 text-[#4B6152] dark:text-[#A3B9AA] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#2E4235] dark:text-[#C4D8CA] leading-relaxed">
              {pendingAction.type === 'sync-sheet' &&
                (isAr
                  ? `سيتم مسح وتحديث تبويبي (Quote Requests و Client Reviews) في جدول "${pendingAction.sheetTitle}" ليشمل ${quotes.length} طلب عرض سعر و ${testimonials.length} تقييمات عملاء.`
                  : `This will replace and update the "Quote Requests" (${quotes.length} rows) and "Client Reviews" (${testimonials.length} rows) tabs in "${pendingAction.sheetTitle}".`)}
              {pendingAction.type === 'upload-backup' &&
                (isAr
                  ? `سيتم إنشاء ملف نسخة احتياطية JSON جديد داخل مجلد "${pendingAction.folderName}" يحتوي على إعدادات الموقع والخدمات (${services.length}) والمشروعات (${projects.length}) والعروض (${offers.length}) والطلبات (${quotes.length}) والتقييمات (${testimonials.length}).`
                  : `This will upload a full JSON backup to "${pendingAction.folderName}" containing site settings, ${services.length} services, ${projects.length} projects, ${offers.length} offers, ${quotes.length} quotes, and ${testimonials.length} reviews.`)}
              {pendingAction.type === 'delete-file' &&
                (isAr
                  ? `هل أنت متأكد من حذف "${pendingAction.file.name}" نهائياً من Google Drive؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to permanently delete "${pendingAction.file.name}" from Google Drive? This action cannot be undone.`)}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="px-4 py-2 text-xs font-semibold text-[#4B6152] dark:text-[#A3B9AA] hover:text-[#102116] dark:hover:text-[#ECF4EE]"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                data-testid="workspace-confirm-execute"
                onClick={() => void executeConfirmedAction()}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg ${
                  pendingAction.type === 'delete-file'
                    ? 'bg-[#B91C1C] hover:bg-[#991B1B]'
                    : 'bg-[#0B5D27] hover:bg-[#08431C]'
                }`}
              >
                {pendingAction.type === 'delete-file'
                  ? isAr
                    ? 'تأكيد الحذف'
                    : 'Confirm Delete'
                  : isAr
                    ? 'تأكيد وتنفيذ'
                    : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
