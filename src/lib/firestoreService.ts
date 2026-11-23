import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  DEFAULT_OFFERS,
  DEFAULT_PROJECTS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_CONTENT,
} from '../data/protecDefaults';
import {
  OfferItem,
  ProjectItem,
  QuoteAttachment,
  QuoteRequest,
  QuoteStatus,
  ServiceItem,
  SiteContent,
  TestimonialItem,
} from '../types';
import { AdminPasswordVerifier, PBKDF2_ALGORITHM } from '../utils/passwordCrypto';
import { generateReferenceCode } from '../utils/validation';
import { db, handleFirestoreError, OperationType } from './firebase';

export interface AdminCredentialRecord {
  email: string;
  passwordHash: string;
  salt: string;
  iterations: number;
  algorithm: typeof PBKDF2_ALGORITHM;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export async function fetchAdminCredentialRecord(): Promise<AdminCredentialRecord | null> {
  const path = 'adminCredentials/primary';
  try {
    const snap = await getDoc(doc(db, 'adminCredentials', 'primary'));
    if (!snap.exists()) {
      return null;
    }
    return snap.data() as AdminCredentialRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createAdminCredentialRecord(
  email: string,
  verifier: AdminPasswordVerifier
): Promise<void> {
  const path = 'adminCredentials/primary';
  try {
    await setDoc(doc(db, 'adminCredentials', 'primary'), {
      email: email.trim().toLowerCase(),
      passwordHash: verifier.passwordHash,
      salt: verifier.salt,
      iterations: verifier.iterations,
      algorithm: verifier.algorithm,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateAdminCredentialRecord(
  verifier: AdminPasswordVerifier
): Promise<void> {
  const path = 'adminCredentials/primary';
  try {
    await updateDoc(doc(db, 'adminCredentials', 'primary'), {
      passwordHash: verifier.passwordHash,
      salt: verifier.salt,
      iterations: verifier.iterations,
      algorithm: verifier.algorithm,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function fetchSiteContent(): Promise<SiteContent> {
  const path = 'siteContent/main';
  try {
    const snap = await getDoc(doc(db, 'siteContent', 'main'));
    if (snap.exists()) {
      const data = snap.data() as Partial<SiteContent>;
      return {
        ...DEFAULT_SITE_CONTENT,
        ...data,
        goalsAr: Array.isArray(data.goalsAr) ? data.goalsAr : DEFAULT_SITE_CONTENT.goalsAr,
        goalsEn: Array.isArray(data.goalsEn) ? data.goalsEn : DEFAULT_SITE_CONTENT.goalsEn,
        valuesAr: Array.isArray(data.valuesAr) ? data.valuesAr : DEFAULT_SITE_CONTENT.valuesAr,
        valuesEn: Array.isArray(data.valuesEn) ? data.valuesEn : DEFAULT_SITE_CONTENT.valuesEn,
        differentiatorsAr: Array.isArray(data.differentiatorsAr)
          ? data.differentiatorsAr
          : DEFAULT_SITE_CONTENT.differentiatorsAr,
        differentiatorsEn: Array.isArray(data.differentiatorsEn)
          ? data.differentiatorsEn
          : DEFAULT_SITE_CONTENT.differentiatorsEn,
        phones: Array.isArray(data.phones) ? data.phones : DEFAULT_SITE_CONTENT.phones,
        heroImages:
          Array.isArray(data.heroImages) && data.heroImages.length > 0
            ? data.heroImages.slice(0, 8)
            : data.heroImageUrl
              ? [data.heroImageUrl]
              : DEFAULT_SITE_CONTENT.heroImages,
      };
    }
    return DEFAULT_SITE_CONTENT;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  const path = 'siteContent/main';
  try {
    const heroImagesList =
      Array.isArray(content.heroImages) && content.heroImages.length > 0
        ? content.heroImages.map((u) => u.trim().slice(0, 500)).filter(Boolean).slice(0, 8)
        : content.heroImageUrl.trim()
          ? [content.heroImageUrl.trim().slice(0, 500)]
          : [DEFAULT_SITE_CONTENT.heroImageUrl];

    const payload = {
      heroTitleAr: content.heroTitleAr.trim().slice(0, 180),
      heroTitleEn: content.heroTitleEn.trim().slice(0, 180),
      heroSubtitleAr: content.heroSubtitleAr.trim().slice(0, 500),
      heroSubtitleEn: content.heroSubtitleEn.trim().slice(0, 500),
      heroImageUrl: heroImagesList[0],
      heroImages: heroImagesList,
      aboutSummaryAr: content.aboutSummaryAr.trim().slice(0, 1500),
      aboutSummaryEn: content.aboutSummaryEn.trim().slice(0, 1500),
      visionAr: content.visionAr.trim().slice(0, 600),
      visionEn: content.visionEn.trim().slice(0, 600),
      missionAr: content.missionAr.trim().slice(0, 600),
      missionEn: content.missionEn.trim().slice(0, 600),
      goalsAr: content.goalsAr.slice(0, 8),
      goalsEn: content.goalsEn.slice(0, 8),
      valuesAr: content.valuesAr.slice(0, 8),
      valuesEn: content.valuesEn.slice(0, 8),
      differentiatorsAr: content.differentiatorsAr.slice(0, 8),
      differentiatorsEn: content.differentiatorsEn.slice(0, 8),
      phones: content.phones.slice(0, 5),
      whatsappNumber: content.whatsappNumber.trim().slice(0, 30),
      email: content.email.trim().slice(0, 120),
      addressAr: (content.addressAr || '').trim().slice(0, 250),
      addressEn: (content.addressEn || '').trim().slice(0, 250),
      facebookUrl: (content.facebookUrl || '').trim().slice(0, 300),
      tiktokUrl: (content.tiktokUrl || '').trim().slice(0, 300),
      instagramUrl: (content.instagramUrl || '').trim().slice(0, 300),
      coverageStatementAr: (content.coverageStatementAr || '').trim().slice(0, 300),
      coverageStatementEn: (content.coverageStatementEn || '').trim().slice(0, 300),
      availableAreasAr: (content.availableAreasAr || '').trim().slice(0, 300),
      availableAreasEn: (content.availableAreasEn || '').trim().slice(0, 300),
      googleSheetId: (content.googleSheetId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128),
      googleSheetUrl: (content.googleSheetUrl || '').trim().slice(0, 300),
      googleDriveFolderId: (content.googleDriveFolderId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'siteContent', 'main'), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchServices(): Promise<ServiceItem[]> {
  const path = 'services';
  try {
    const q = query(collection(db, 'services'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      return DEFAULT_SERVICES;
    }
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ServiceItem, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function upsertService(service: ServiceItem, isNew: boolean): Promise<void> {
  const safeId = service.id.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  const path = `services/${safeId}`;
  try {
    if (isNew) {
      await setDoc(doc(db, 'services', safeId), {
        order: Number(service.order) || 1,
        slug: service.slug.trim().toLowerCase().slice(0, 80),
        titleAr: service.titleAr.trim().slice(0, 140),
        titleEn: service.titleEn.trim().slice(0, 140),
        shortDescAr: service.shortDescAr.trim().slice(0, 320),
        shortDescEn: service.shortDescEn.trim().slice(0, 320),
        fullDescAr: service.fullDescAr.trim().slice(0, 2000),
        fullDescEn: service.fullDescEn.trim().slice(0, 2000),
        featuresAr: (service.featuresAr || []).slice(0, 8),
        featuresEn: (service.featuresEn || []).slice(0, 8),
        imageUrl: service.imageUrl.trim().slice(0, 500),
        active: Boolean(service.active),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'services', safeId), {
        order: Number(service.order) || 1,
        slug: service.slug.trim().toLowerCase().slice(0, 80),
        titleAr: service.titleAr.trim().slice(0, 140),
        titleEn: service.titleEn.trim().slice(0, 140),
        shortDescAr: service.shortDescAr.trim().slice(0, 320),
        shortDescEn: service.shortDescEn.trim().slice(0, 320),
        fullDescAr: service.fullDescAr.trim().slice(0, 2000),
        fullDescEn: service.fullDescEn.trim().slice(0, 2000),
        featuresAr: (service.featuresAr || []).slice(0, 8),
        featuresEn: (service.featuresEn || []).slice(0, 8),
        imageUrl: service.imageUrl.trim().slice(0, 500),
        active: Boolean(service.active),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function removeService(id: string): Promise<void> {
  const path = `services/${id}`;
  try {
    await deleteDoc(doc(db, 'services', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchProjects(): Promise<ProjectItem[]> {
  const path = 'projects';
  try {
    const snap = await getDocs(collection(db, 'projects'));
    if (snap.empty) {
      return DEFAULT_PROJECTS;
    }
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectItem, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function upsertProject(project: ProjectItem, isNew: boolean): Promise<void> {
  const safeId = project.id.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  const path = `projects/${safeId}`;
  try {
    const baseData: Record<string, unknown> = {
      titleAr: project.titleAr.trim().slice(0, 160),
      titleEn: project.titleEn.trim().slice(0, 160),
      category: project.category,
      locationAr: project.locationAr.trim().slice(0, 120),
      locationEn: project.locationEn.trim().slice(0, 120),
      summaryAr: project.summaryAr.trim().slice(0, 800),
      summaryEn: project.summaryEn.trim().slice(0, 800),
      beforeImageUrl: project.beforeImageUrl.trim().slice(0, 500),
      afterImageUrl: project.afterImageUrl.trim().slice(0, 500),
      featured: Boolean(project.featured),
      updatedAt: serverTimestamp(),
    };
    if (project.areaSqm !== undefined && Number.isFinite(Number(project.areaSqm))) {
      baseData.areaSqm = Number(project.areaSqm);
    }

    if (isNew) {
      await setDoc(doc(db, 'projects', safeId), {
        ...baseData,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'projects', safeId), baseData);
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function removeProject(id: string): Promise<void> {
  const path = `projects/${id}`;
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchOffers(): Promise<OfferItem[]> {
  const path = 'offers';
  try {
    const snap = await getDocs(collection(db, 'offers'));
    if (snap.empty) {
      return DEFAULT_OFFERS;
    }
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<OfferItem, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function upsertOffer(offer: OfferItem, isNew: boolean): Promise<void> {
  const safeId = offer.id.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  const path = `offers/${safeId}`;
  try {
    const baseData: Record<string, unknown> = {
      titleAr: offer.titleAr.trim().slice(0, 160),
      titleEn: offer.titleEn.trim().slice(0, 160),
      descriptionAr: offer.descriptionAr.trim().slice(0, 1000),
      descriptionEn: offer.descriptionEn.trim().slice(0, 1000),
      discountLabelAr: offer.discountLabelAr.trim().slice(0, 60),
      discountLabelEn: offer.discountLabelEn.trim().slice(0, 60),
      originalPrice: (offer.originalPrice || '').trim().slice(0, 40),
      offerPrice: (offer.offerPrice || '').trim().slice(0, 40),
      expiresAt: offer.expiresAt.trim().slice(0, 30),
      serviceType: offer.serviceType.trim().slice(0, 80),
      imageUrl: offer.imageUrl.trim().slice(0, 500),
      active: Boolean(offer.active),
      updatedAt: serverTimestamp(),
    };
    if (isNew) {
      await setDoc(doc(db, 'offers', safeId), {
        ...baseData,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'offers', safeId), baseData);
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function removeOffer(id: string): Promise<void> {
  const path = `offers/${id}`;
  try {
    await deleteDoc(doc(db, 'offers', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function submitQuoteRequest(input: {
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
}): Promise<{ id: string; referenceCode: string }> {
  const id = input.id || `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const referenceCode = input.referenceCode || generateReferenceCode();
  const path = `quotes/${id}`;

  try {
    const payload: Record<string, unknown> = {
      referenceCode,
      fullName: input.fullName.trim().slice(0, 120),
      phone: input.phone.trim().slice(0, 30),
      governorate: input.governorate.trim().slice(0, 80),
      area: input.area.trim().slice(0, 120),
      address: input.address.trim().slice(0, 240),
      serviceType: input.serviceType.trim().slice(0, 100),
      description: input.description.trim().slice(0, 3000),
      attachments: input.attachments.slice(0, 10),
      status: 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (input.email && input.email.trim().length > 0) {
      payload.email = input.email.trim().slice(0, 150);
    }
    if (input.projectAreaSqm !== undefined && Number.isFinite(input.projectAreaSqm)) {
      payload.projectAreaSqm = Number(input.projectAreaSqm);
    }
    if (input.offerId && input.offerId.trim().length > 0) {
      payload.offerId = input.offerId.trim().slice(0, 128);
    }

    await setDoc(doc(db, 'quotes', id), payload);
    return { id, referenceCode };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchAllQuotes(): Promise<QuoteRequest[]> {
  const path = 'quotes';
  try {
    const q = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<QuoteRequest, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateQuoteAdmin(
  id: string,
  status: QuoteStatus,
  adminNotes: string
): Promise<void> {
  const path = `quotes/${id}`;
  try {
    await updateDoc(doc(db, 'quotes', id), {
      status,
      adminNotes: adminNotes.trim().slice(0, 1500),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function removeQuote(id: string): Promise<void> {
  const path = `quotes/${id}`;
  try {
    await deleteDoc(doc(db, 'quotes', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchReviewsFromFirestore(): Promise<TestimonialItem[]> {
  try {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TestimonialItem, 'id'>) }));
  } catch {
    return [];
  }
}

export async function submitReviewToFirestore(review: TestimonialItem): Promise<void> {
  const safeId = review.id.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  const path = `reviews/${safeId}`;
  try {
    await setDoc(doc(db, 'reviews', safeId), {
      authorNameAr: review.authorNameAr.trim().slice(0, 100),
      authorNameEn: review.authorNameEn.trim().slice(0, 100),
      roleAr: (review.roleAr || '').trim().slice(0, 80),
      roleEn: (review.roleEn || '').trim().slice(0, 80),
      organizationAr: (review.organizationAr || '').trim().slice(0, 120),
      organizationEn: (review.organizationEn || '').trim().slice(0, 120),
      locationAr: (review.locationAr || '').trim().slice(0, 120),
      locationEn: (review.locationEn || '').trim().slice(0, 120),
      serviceCategory: review.serviceCategory,
      serviceLabelAr: review.serviceLabelAr.trim().slice(0, 120),
      serviceLabelEn: review.serviceLabelEn.trim().slice(0, 120),
      rating: Number(review.rating),
      beforeStateAr: (review.beforeStateAr || '').trim().slice(0, 200),
      beforeStateEn: (review.beforeStateEn || '').trim().slice(0, 200),
      outcomeAr: (review.outcomeAr || '').trim().slice(0, 200),
      outcomeEn: (review.outcomeEn || '').trim().slice(0, 200),
      quoteAr: review.quoteAr.trim().slice(0, 1200),
      quoteEn: review.quoteEn.trim().slice(0, 1200),
      dateLabel: review.dateLabel.trim().slice(0, 20),
      source: review.source || 'visitor',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateReviewInFirestore(review: TestimonialItem): Promise<void> {
  const safeId = review.id.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  const path = `reviews/${safeId}`;
  try {
    await updateDoc(doc(db, 'reviews', safeId), {
      authorNameAr: review.authorNameAr.trim().slice(0, 100),
      authorNameEn: review.authorNameEn.trim().slice(0, 100),
      roleAr: (review.roleAr || '').trim().slice(0, 80),
      roleEn: (review.roleEn || '').trim().slice(0, 80),
      organizationAr: (review.organizationAr || '').trim().slice(0, 120),
      organizationEn: (review.organizationEn || '').trim().slice(0, 120),
      locationAr: (review.locationAr || '').trim().slice(0, 120),
      locationEn: (review.locationEn || '').trim().slice(0, 120),
      serviceCategory: review.serviceCategory,
      serviceLabelAr: review.serviceLabelAr.trim().slice(0, 120),
      serviceLabelEn: review.serviceLabelEn.trim().slice(0, 120),
      rating: Number(review.rating),
      beforeStateAr: (review.beforeStateAr || '').trim().slice(0, 200),
      beforeStateEn: (review.beforeStateEn || '').trim().slice(0, 200),
      outcomeAr: (review.outcomeAr || '').trim().slice(0, 200),
      outcomeEn: (review.outcomeEn || '').trim().slice(0, 200),
      quoteAr: review.quoteAr.trim().slice(0, 1200),
      quoteEn: review.quoteEn.trim().slice(0, 1200),
      dateLabel: review.dateLabel.trim().slice(0, 20),
      source: review.source || 'visitor',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function removeReviewFromFirestore(id: string): Promise<void> {
  const path = `reviews/${id}`;
  try {
    await deleteDoc(doc(db, 'reviews', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedInitialDatabaseIfEmpty(): Promise<boolean> {
  try {
    const [siteSnap, servicesSnap, projectsSnap, offersSnap] = await Promise.all([
      getDoc(doc(db, 'siteContent', 'main')),
      getDocs(collection(db, 'services')),
      getDocs(collection(db, 'projects')),
      getDocs(collection(db, 'offers')),
    ]);

    const batch = writeBatch(db);
    let hasWrites = false;

    if (!siteSnap.exists()) {
      batch.set(doc(db, 'siteContent', 'main'), {
        ...DEFAULT_SITE_CONTENT,
        updatedAt: serverTimestamp(),
      });
      hasWrites = true;
    }

    if (servicesSnap.empty) {
      for (const s of DEFAULT_SERVICES) {
        const { id, ...rest } = s;
        batch.set(doc(db, 'services', id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      hasWrites = true;
    }

    if (projectsSnap.empty) {
      for (const p of DEFAULT_PROJECTS) {
        const { id, ...rest } = p;
        batch.set(doc(db, 'projects', id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      hasWrites = true;
    }

    if (offersSnap.empty) {
      for (const o of DEFAULT_OFFERS) {
        const { id, ...rest } = o;
        batch.set(doc(db, 'offers', id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      hasWrites = true;
    }

    if (hasWrites) {
      await batch.commit();
    }
    return hasWrites;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seed');
  }
}
