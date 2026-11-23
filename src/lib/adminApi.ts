import {
  AdminStats,
  OfferItem,
  ProjectCategory,
  ProjectItem,
  QuoteAttachment,
  QuoteRequest,
  QuoteStatus,
  ServiceItem,
  SiteContent,
  TestimonialItem,
} from '../types';

export interface PublicCatalogResponse {
  siteContent?: SiteContent;
  services?: ServiceItem[];
  projects?: ProjectItem[];
  offers?: OfferItem[];
  reviews?: TestimonialItem[];
  reviewsInitialized?: boolean;
}

export interface ServerAuthStatus {
  configured: boolean;
  envPasscodeActive: boolean;
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Unexpected server response (HTTP ${res.status})`);
    }
  }
  if (!res.ok) {
    const errObj = data as { error?: string };
    throw new Error(errObj.error || `Request failed (HTTP ${res.status})`);
  }
  return data as T;
}

export async function fetchServerPublicCatalog(): Promise<PublicCatalogResponse> {
  const res = await fetch('/api/public-data', { cache: 'no-store' });
  return parseJsonResponse<PublicCatalogResponse>(res);
}

export async function recordSiteVisit(): Promise<AdminStats | null> {
  try {
    const res = await fetch('/api/visits', { method: 'POST' });
    if (!res.ok) return null;
    return (await res.json()) as AdminStats;
  } catch {
    return null;
  }
}

export async function fetchServerAdminStats(token: string): Promise<AdminStats> {
  const res = await fetch('/api/admin/stats', {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonResponse<AdminStats>(res);
}

export async function submitQuoteToServer(input: {
  id?: string;
  referenceCode?: string;
  fullName: string;
  phone: string;
  email?: string;
  governorate: string;
  area: string;
  address: string;
  serviceType: string;
  projectAreaSqm?: number;
  description: string;
  offerId?: string;
  attachments: QuoteAttachment[];
}): Promise<QuoteRequest> {
  const res = await fetch('/api/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await parseJsonResponse<{ quote: QuoteRequest }>(res);
  return data.quote;
}

export async function fetchServerQuotes(token: string): Promise<QuoteRequest[]> {
  const res = await fetch('/api/admin/quotes', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await parseJsonResponse<{ quotes: QuoteRequest[] }>(res);
  return data.quotes;
}

export async function updateServerQuote(
  token: string,
  id: string,
  status: QuoteStatus,
  adminNotes: string
): Promise<QuoteRequest> {
  const res = await fetch(`/api/admin/quotes/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, adminNotes }),
  });
  const data = await parseJsonResponse<{ quote: QuoteRequest }>(res);
  return data.quote;
}

export async function deleteServerQuote(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/quotes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await parseJsonResponse<{ ok: boolean }>(res);
}

export async function uploadAdminImageWithToken(
  token: string,
  file: File
): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/uploads/admin', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const data = await parseJsonResponse<{ url: string }>(res);
  if (!data.url) throw new Error('Image upload failed');
  return data.url;
}

export async function saveServerSiteContent(
  token: string,
  content: SiteContent
): Promise<SiteContent> {
  const res = await fetch('/api/admin/site-content', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(content),
  });
  const data = await parseJsonResponse<{ siteContent: SiteContent }>(res);
  return data.siteContent;
}

export async function upsertServerService(
  token: string,
  service: ServiceItem,
  isNew: boolean
): Promise<ServiceItem> {
  const url = isNew
    ? '/api/admin/services'
    : `/api/admin/services/${encodeURIComponent(service.id)}`;
  const res = await fetch(url, {
    method: isNew ? 'POST' : 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(service),
  });
  const data = await parseJsonResponse<{ service: ServiceItem }>(res);
  return data.service;
}

export async function deleteServerService(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/services/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await parseJsonResponse<{ ok: boolean }>(res);
}

export async function upsertServerProject(
  token: string,
  project: ProjectItem,
  isNew: boolean
): Promise<ProjectItem> {
  const url = isNew
    ? '/api/admin/projects'
    : `/api/admin/projects/${encodeURIComponent(project.id)}`;
  const res = await fetch(url, {
    method: isNew ? 'POST' : 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(project),
  });
  const data = await parseJsonResponse<{ project: ProjectItem }>(res);
  return data.project;
}

export async function deleteServerProject(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/projects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await parseJsonResponse<{ ok: boolean }>(res);
}

export async function upsertServerOffer(
  token: string,
  offer: OfferItem,
  isNew: boolean
): Promise<OfferItem> {
  const url = isNew
    ? '/api/admin/offers'
    : `/api/admin/offers/${encodeURIComponent(offer.id)}`;
  const res = await fetch(url, {
    method: isNew ? 'POST' : 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(offer),
  });
  const data = await parseJsonResponse<{ offer: OfferItem }>(res);
  return data.offer;
}

export async function deleteServerOffer(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/offers/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await parseJsonResponse<{ ok: boolean }>(res);
}

export async function fetchServerAuthStatus(): Promise<ServerAuthStatus> {
  const res = await fetch('/api/admin/auth/status');
  return parseJsonResponse<ServerAuthStatus>(res);
}

export async function setupServerAdminPassword(
  email: string,
  password: string
): Promise<{ token: string; email: string }> {
  const res = await fetch('/api/admin/auth/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseJsonResponse<{ token: string; email: string }>(res);
}

export async function loginServerAdmin(
  email: string,
  password: string
): Promise<{ token: string; email: string }> {
  const res = await fetch('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseJsonResponse<{ token: string; email: string }>(res);
}

export async function changeServerAdminPassword(
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const res = await fetch('/api/admin/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  await parseJsonResponse<{ ok: boolean }>(res);
}

export async function logoutServerAdmin(token: string): Promise<void> {
  await fetch('/api/admin/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => undefined);
}

export async function submitReviewToServer(input: {
  authorName: string;
  location?: string;
  serviceCategory: ProjectCategory;
  rating: number;
  comment: string;
}): Promise<TestimonialItem> {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await parseJsonResponse<{ review: TestimonialItem }>(res);
  return data.review;
}

export async function updateServerReview(
  token: string,
  id: string,
  patch: Partial<TestimonialItem>
): Promise<TestimonialItem> {
  const res = await fetch(`/api/admin/reviews/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(patch),
  });
  const data = await parseJsonResponse<{ review: TestimonialItem }>(res);
  return data.review;
}

export async function deleteServerReview(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/reviews/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await parseJsonResponse<{ ok: boolean }>(res);
}
