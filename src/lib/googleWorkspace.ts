import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { QuoteRequest, TestimonialItem } from '../types';
import {
  buildQuoteSheetValues,
  buildReviewSheetValues,
  formatA1SheetRange,
  PRIMARY_WORKSPACE_EMAIL,
} from '../utils/googleWorkspaceFormat';
import { auth } from './firebase';

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
] as const;

const workspaceProvider = new GoogleAuthProvider();
for (const scope of SCOPES) {
  workspaceProvider.addScope(scope);
}
workspaceProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: PRIMARY_WORKSPACE_EMAIL,
});

// Strict in-memory token caching (never written to localStorage/sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedConnectedEmail: string | null = null;

export interface WorkspaceAuthState {
  connected: boolean;
  email: string | null;
}

export interface SpreadsheetMetadata {
  spreadsheetId: string;
  title: string;
  spreadsheetUrl: string;
  sheetTitles: string[];
}

export interface WorkspaceDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface SheetSyncResult {
  spreadsheetId: string;
  title: string;
  spreadsheetUrl: string;
  sheetTitles: string[];
  quotesWritten: number;
  reviewsWritten: number;
}

export function clearWorkspaceAccessToken(): void {
  cachedAccessToken = null;
  cachedConnectedEmail = null;
}

export function getWorkspaceAuthState(): WorkspaceAuthState {
  return {
    connected: Boolean(cachedAccessToken),
    email: cachedConnectedEmail || auth.currentUser?.email || null,
  };
}

export function initWorkspaceAuth(
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
): () => void {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        cachedConnectedEmail = user.email || cachedConnectedEmail;
        onAuthSuccess?.(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        onAuthFailure?.();
      }
    } else {
      clearWorkspaceAccessToken();
      onAuthFailure?.();
    }
  });
}

export async function connectGoogleWorkspace(): Promise<{
  user: User;
  accessToken: string;
  email: string | null;
}> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, workspaceProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Workspace access token.');
    }
    cachedAccessToken = credential.accessToken;
    cachedConnectedEmail = result.user.email || null;
    return {
      user: result.user,
      accessToken: cachedAccessToken,
      email: cachedConnectedEmail,
    };
  } finally {
    isSigningIn = false;
  }
}

export async function getWorkspaceAccessToken(): Promise<string | null> {
  return cachedAccessToken;
}

async function workspaceFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = cachedAccessToken;
  if (!token) {
    throw new Error('WORKSPACE_AUTH_REQUIRED');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearWorkspaceAccessToken();
    throw new Error('WORKSPACE_AUTH_REQUIRED');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let parsed: unknown = {};
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }
  }

  if (!response.ok) {
    const errMessage =
      (parsed as { error?: { message?: string } })?.error?.message ||
      `Google Workspace request failed (${response.status})`;
    throw new Error(errMessage);
  }

  return parsed as T;
}

export async function fetchSpreadsheetMeta(spreadsheetId: string): Promise<SpreadsheetMetadata> {
  const data = await workspaceFetch<{
    spreadsheetId?: string;
    spreadsheetUrl?: string;
    properties?: { title?: string };
    sheets?: { properties?: { sheetId?: number; title?: string } }[];
  }>(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}?fields=spreadsheetId,spreadsheetUrl,properties.title,sheets(properties(sheetId,title))`
  );

  const sheetTitles = (data.sheets || [])
    .map((s) => s.properties?.title || '')
    .filter(Boolean);

  return {
    spreadsheetId: data.spreadsheetId || spreadsheetId,
    title: data.properties?.title || 'Protec Spreadsheet',
    spreadsheetUrl:
      data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    sheetTitles,
  };
}

async function ensureSheetTabsExist(
  spreadsheetId: string,
  requiredTitles: string[]
): Promise<SpreadsheetMetadata> {
  let meta = await fetchSpreadsheetMeta(spreadsheetId);
  const missing = requiredTitles.filter((title) => !meta.sheetTitles.includes(title));

  if (missing.length > 0) {
    await workspaceFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: missing.map((title) => ({
            addSheet: {
              properties: { title },
            },
          })),
        }),
      }
    );
    meta = await fetchSpreadsheetMeta(spreadsheetId);
  }

  return meta;
}

async function clearAndWriteSheetValues(
  spreadsheetId: string,
  sheetTitle: string,
  values: string[][]
): Promise<void> {
  const safeSheetRange = `'${sheetTitle.replace(/'/g, "''")}'`;
  await workspaceFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(safeSheetRange)}:clear`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }
  );

  const rowCount = Math.max(1, values.length);
  const colCount = Math.max(1, values[0]?.length || 1);
  const targetRange = formatA1SheetRange(sheetTitle, rowCount, colCount);

  await workspaceFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(targetRange)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        range: targetRange,
        majorDimension: 'ROWS',
        values,
      }),
    }
  );
}

export async function createProtecMasterSpreadsheet(
  quotes: QuoteRequest[],
  reviews: TestimonialItem[],
  folderId?: string
): Promise<SheetSyncResult> {
  const created = await workspaceFetch<{
    spreadsheetId: string;
    spreadsheetUrl: string;
    properties?: { title?: string };
    sheets?: { properties?: { title?: string } }[];
  }>('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      properties: {
        title: 'Protec — Quotes & Reviews (بروتيك)',
        locale: 'en_US',
      },
      sheets: [
        { properties: { title: 'Quote Requests' } },
        { properties: { title: 'Client Reviews' } },
      ],
    }),
  });

  if (folderId) {
    await workspaceFetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        created.spreadsheetId
      )}?addParents=${encodeURIComponent(folderId)}&fields=id`,
      { method: 'PATCH' }
    ).catch(() => undefined);
  }

  return syncDataToSpreadsheet(created.spreadsheetId, quotes, reviews);
}

export async function syncDataToSpreadsheet(
  spreadsheetId: string,
  quotes: QuoteRequest[],
  reviews: TestimonialItem[]
): Promise<SheetSyncResult> {
  const quotesTab = 'Quote Requests';
  const reviewsTab = 'Client Reviews';

  const meta = await ensureSheetTabsExist(spreadsheetId, [quotesTab, reviewsTab]);
  const quoteValues = buildQuoteSheetValues(quotes);
  const reviewValues = buildReviewSheetValues(reviews);

  await clearAndWriteSheetValues(spreadsheetId, quotesTab, quoteValues);
  await clearAndWriteSheetValues(spreadsheetId, reviewsTab, reviewValues);

  return {
    spreadsheetId: meta.spreadsheetId,
    title: meta.title,
    spreadsheetUrl: meta.spreadsheetUrl,
    sheetTitles: meta.sheetTitles,
    quotesWritten: quotes.length,
    reviewsWritten: reviews.length,
  };
}

export async function createOrFindDriveFolder(folderName: string): Promise<WorkspaceDriveFile> {
  const escaped = folderName.replace(/'/g, "\\'");
  const q = `name='${escaped}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const existing = await workspaceFetch<{ files?: WorkspaceDriveFile[] }>(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&fields=files(id,name,mimeType,modifiedTime,webViewLink)&pageSize=5`
  );

  if (existing.files && existing.files.length > 0) {
    return existing.files[0];
  }

  return workspaceFetch<WorkspaceDriveFile>(
    'https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    }
  );
}

export async function listWorkspaceDriveFiles(): Promise<WorkspaceDriveFile[]> {
  const res = await workspaceFetch<{ files?: WorkspaceDriveFile[] }>(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      'trashed=false'
    )}&fields=${encodeURIComponent(
      'files(id,name,mimeType,modifiedTime,webViewLink)'
    )}&orderBy=${encodeURIComponent('modifiedTime desc')}&pageSize=25`
  );
  return Array.isArray(res.files) ? res.files : [];
}

export async function uploadJsonBackupToDrive(
  folderId: string | undefined,
  fileName: string,
  payload: unknown
): Promise<WorkspaceDriveFile> {
  const metadata: Record<string, unknown> = {
    name: fileName,
    mimeType: 'application/json',
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = `protec_boundary_${Date.now()}`;
  const jsonContent = JSON.stringify(payload, null, 2);
  const body =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    'Content-Type: application/json\r\n\r\n' +
    `${jsonContent}\r\n` +
    `--${boundary}--`;

  return workspaceFetch<WorkspaceDriveFile>(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  await workspaceFetch<void>(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
    {
      method: 'DELETE',
    }
  );
}
