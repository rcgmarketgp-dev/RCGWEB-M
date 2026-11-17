import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  BrandAsset,
  CampaignInquiry,
  CampaignLanding,
  Department,
  HeroSlide,
  Inquiry,
  MediaItem,
  NavLinkItem,
  Product,
  SharpeningOrder,
  SiteSectionsConfig,
  SiteSettings,
} from '../types';

const MAX_STR_IMAGE = 695000;

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      if (Array.isArray(v)) {
        result[k] = v.map((item) =>
          item && typeof item === 'object' && !Array.isArray(item)
            ? stripUndefined(item as Record<string, unknown>)
            : item
        );
      } else if (v !== null && typeof v === 'object') {
        result[k] = stripUndefined(v as Record<string, unknown>);
      } else {
        result[k] = v;
      }
    }
  }
  return result;
}

function clamp(val: string | undefined, max: number, fallback = ''): string {
  const str = (val ?? fallback).toString().trim();
  return str.length > max ? str.slice(0, max) : str;
}

function safeImageUrl(url: string | undefined, fallback = '/assets/aistudio/03_rcg_facility_hero_crop_20984afa.jpg'): string {
  const clean = (url ?? fallback).trim() || fallback;
  if (clean.length > MAX_STR_IMAGE) {
    return fallback;
  }
  return clean;
}

function sanitizeId(id: string): string {
  const cleaned = id.replace(/[^a-zA-Z0-9_-]/g, '-');
  return cleaned.slice(0, 128) || `id-${Date.now()}`;
}

function sortByOrder<T extends { order?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
}

// -----------------------------------------------------------------------------
// Customer Operations (Auth-Bound via userId)
// -----------------------------------------------------------------------------

export async function createSharpeningOrderInFirestore(
  userId: string,
  order: SharpeningOrder
): Promise<void> {
  const orderId = sanitizeId(order.id);
  const path = `sharpening_orders/${orderId}`;
  const payload = stripUndefined({
    id: orderId,
    userId: sanitizeId(userId),
    customerName: clamp(order.customerName, 120, 'Customer'),
    phone: clamp(order.phone, 40, '00000'),
    city: clamp(order.city, 120, ''),
    bladeType: clamp(order.bladeType, 120, 'MDF'),
    diameter: clamp(order.diameter, 60, '300 mm'),
    teethCount: clamp(order.teethCount, 40, '96T'),
    serviceType: clamp(order.serviceType, 160, 'Standard'),
    quantity: Math.min(500, Math.max(1, Number(order.quantity) || 1)),
    estimatedPrice: clamp(order.estimatedPrice, 160, '0'),
    status: 'new',
    createdAtLabel: clamp(order.createdAt, 80),
    notes: order.notes ? clamp(order.notes, 1000) : undefined,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await setDoc(doc(db, 'sharpening_orders', orderId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateSharpeningOrderInFirestore(
  orderId: string,
  updates: { status?: SharpeningOrder['status']; notes?: string }
): Promise<void> {
  const safeId = sanitizeId(orderId);
  const path = `sharpening_orders/${safeId}`;
  const payload = stripUndefined({
    status: updates.status,
    notes: updates.notes !== undefined ? clamp(updates.notes, 1000) : undefined,
    updatedAt: serverTimestamp(),
  });

  try {
    await updateDoc(doc(db, 'sharpening_orders', safeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createInquiryInFirestore(
  userId: string,
  inquiry: Inquiry
): Promise<void> {
  const inquiryId = sanitizeId(inquiry.id);
  const path = `inquiries/${inquiryId}`;
  const payload = stripUndefined({
    id: inquiryId,
    userId: sanitizeId(userId),
    name: clamp(inquiry.name, 120, 'Customer'),
    phone: clamp(inquiry.phone, 40, '00000'),
    email: inquiry.email ? clamp(inquiry.email, 200) : undefined,
    department: clamp(inquiry.department, 160, 'Sales'),
    subject: clamp(inquiry.subject, 250, 'Inquiry'),
    message: clamp(inquiry.message, 2000, '-'),
    status: 'new',
    createdAtLabel: clamp(inquiry.createdAt, 80),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await setDoc(doc(db, 'inquiries', inquiryId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateInquiryStatusInFirestore(
  inquiryId: string,
  status: Inquiry['status']
): Promise<void> {
  const safeId = sanitizeId(inquiryId);
  const path = `inquiries/${safeId}`;
  try {
    await updateDoc(doc(db, 'inquiries', safeId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createCampaignInquiryInFirestore(
  userId: string,
  inq: CampaignInquiry
): Promise<void> {
  const inqId = sanitizeId(inq.id);
  const path = `campaign_inquiries/${inqId}`;
  const payload = stripUndefined({
    id: inqId,
    userId: sanitizeId(userId),
    campaignId: sanitizeId(inq.campaignId),
    campaignTitle: clamp(inq.campaignTitle, 250, 'Campaign'),
    fullName: clamp(inq.fullName, 120, 'Customer'),
    phone: clamp(inq.phone, 40, '00000'),
    city: clamp(inq.city, 120, ''),
    workshopType: clamp(inq.workshopType, 160, ''),
    interestedMachine: clamp(inq.interestedMachine, 250, ''),
    paymentPreference: inq.paymentPreference,
    status: 'new',
    createdAtLabel: clamp(inq.createdAt, 80),
    notes: inq.notes ? clamp(inq.notes, 1000) : undefined,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await setDoc(doc(db, 'campaign_inquiries', inqId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCampaignInquiryInFirestore(
  inqId: string,
  updates: { status?: CampaignInquiry['status']; notes?: string }
): Promise<void> {
  const safeId = sanitizeId(inqId);
  const path = `campaign_inquiries/${safeId}`;
  const payload = stripUndefined({
    status: updates.status,
    notes: updates.notes !== undefined ? clamp(updates.notes, 1000) : undefined,
    updatedAt: serverTimestamp(),
  });

  try {
    await updateDoc(doc(db, 'campaign_inquiries', safeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Real-time listeners for user-specific OR admin customer records
export function subscribeCustomerRecords(
  userId: string,
  isAdmin: boolean,
  callbacks: {
    onOrders: (orders: SharpeningOrder[]) => void;
    onInquiries: (inquiries: Inquiry[]) => void;
    onCampaignInquiries: (inqs: CampaignInquiry[]) => void;
  }
): Unsubscribe {
  const ordersRef = collection(db, 'sharpening_orders');
  const inquiriesRef = collection(db, 'inquiries');
  const campRef = collection(db, 'campaign_inquiries');

  const ordersQ = isAdmin ? ordersRef : query(ordersRef, where('userId', '==', userId));
  const inquiriesQ = isAdmin ? inquiriesRef : query(inquiriesRef, where('userId', '==', userId));
  const campQ = isAdmin ? campRef : query(campRef, where('userId', '==', userId));

  const unsub1 = onSnapshot(
    ordersQ,
    (snap) => {
      const rows = snap.docs.map((d) => {
        const raw = d.data();
        return {
          id: raw.id || d.id,
          customerName: raw.customerName || '',
          phone: raw.phone || '',
          city: raw.city || '',
          bladeType: raw.bladeType || '',
          diameter: raw.diameter || '',
          teethCount: raw.teethCount || '',
          serviceType: raw.serviceType || '',
          quantity: Number(raw.quantity) || 1,
          estimatedPrice: raw.estimatedPrice || '',
          status: raw.status || 'new',
          createdAt: raw.createdAtLabel || '',
          notes: raw.notes,
        } as SharpeningOrder;
      });
      callbacks.onOrders(rows);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'sharpening_orders')
  );

  const unsub2 = onSnapshot(
    inquiriesQ,
    (snap) => {
      const rows = snap.docs.map((d) => {
        const raw = d.data();
        return {
          id: raw.id || d.id,
          name: raw.name || '',
          phone: raw.phone || '',
          email: raw.email,
          department: raw.department || '',
          subject: raw.subject || '',
          message: raw.message || '',
          status: raw.status || 'new',
          createdAt: raw.createdAtLabel || '',
        } as Inquiry;
      });
      callbacks.onInquiries(rows);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'inquiries')
  );

  const unsub3 = onSnapshot(
    campQ,
    (snap) => {
      const rows = snap.docs.map((d) => {
        const raw = d.data();
        return {
          id: raw.id || d.id,
          campaignId: raw.campaignId || '',
          campaignTitle: raw.campaignTitle || '',
          fullName: raw.fullName || '',
          phone: raw.phone || '',
          city: raw.city || '',
          workshopType: raw.workshopType || '',
          interestedMachine: raw.interestedMachine || '',
          paymentPreference: raw.paymentPreference || 'installment',
          status: raw.status || 'new',
          createdAt: raw.createdAtLabel || '',
          notes: raw.notes,
        } as CampaignInquiry;
      });
      callbacks.onCampaignInquiries(rows);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'campaign_inquiries')
  );

  return () => {
    unsub1();
    unsub2();
    unsub3();
  };
}

// -----------------------------------------------------------------------------
// Public CMS Storefront Sync (Read Public, Write Admin)
// -----------------------------------------------------------------------------

export function subscribePublicCmsStorefront(callbacks: {
  onSettings: (settings: SiteSettings) => void;
  onSections: (sections: SiteSectionsConfig) => void;
  onNavLinks: (links: NavLinkItem[]) => void;
  onSlides: (slides: HeroSlide[]) => void;
  onDepartments: (depts: Department[]) => void;
  onProducts: (products: Product[]) => void;
  onMedia: (items: MediaItem[]) => void;
  onCampaigns: (campaigns: CampaignLanding[]) => void;
  onBrandAssets: (assets: BrandAsset[]) => void;
}): Unsubscribe {
  const u1 = onSnapshot(
    collection(db, 'site_configs'),
    (snap) => {
      snap.docs.forEach((d) => {
        const raw = d.data();
        if (d.id === 'settings' && raw.data) {
          callbacks.onSettings(raw.data as SiteSettings);
        } else if (d.id === 'sections' && raw.data) {
          callbacks.onSections(raw.data as SiteSectionsConfig);
        } else if (d.id === 'navigation' && raw.data && Array.isArray(raw.data.links)) {
          callbacks.onNavLinks(raw.data.links as NavLinkItem[]);
        }
      });
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'site_configs')
  );

  const u2 = onSnapshot(
    collection(db, 'hero_slides'),
    (snap) => {
      if (!snap.empty) {
        const list = sortByOrder(snap.docs.map((d) => d.data() as HeroSlide & { order?: number }));
        callbacks.onSlides(list);
      }
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'hero_slides')
  );

  const u3 = onSnapshot(
    collection(db, 'departments'),
    (snap) => {
      if (!snap.empty) {
        const list = sortByOrder(snap.docs.map((d) => d.data() as Department & { order?: number }));
        callbacks.onDepartments(list);
      }
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'departments')
  );

  const u4 = onSnapshot(
    collection(db, 'products'),
    (snap) => {
      if (!snap.empty) {
        const list = sortByOrder(snap.docs.map((d) => d.data() as Product & { order?: number }));
        callbacks.onProducts(list);
      }
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'products')
  );

  const u5 = onSnapshot(
    collection(db, 'media_items'),
    (snap) => {
      if (!snap.empty) {
        const list = sortByOrder(snap.docs.map((d) => d.data() as MediaItem & { order?: number }));
        callbacks.onMedia(list);
      }
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'media_items')
  );

  const u6 = onSnapshot(
    collection(db, 'campaigns'),
    (snap) => {
      if (!snap.empty) {
        const list = sortByOrder(
          snap.docs.map((d) => d.data() as CampaignLanding & { order?: number })
        );
        callbacks.onCampaigns(list);
      }
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'campaigns')
  );

  const u7 = onSnapshot(
    collection(db, 'brand_assets'),
    (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map((d) => d.data() as BrandAsset);
        callbacks.onBrandAssets(list);
      }
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'brand_assets')
  );

  return () => {
    u1();
    u2();
    u3();
    u4();
    u5();
    u6();
    u7();
  };
}

export async function syncSiteConfigToFirestore(
  configKey: 'settings' | 'sections' | 'navigation',
  data: Record<string, unknown>,
  updatedByUid: string
): Promise<void> {
  const path = `site_configs/${configKey}`;
  try {
    await setDoc(doc(db, 'site_configs', configKey), {
      configKey,
      data: stripUndefined(data),
      updatedBy: sanitizeId(updatedByUid),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncCollectionToFirestore<T extends { id: string }>(
  collectionName: 'hero_slides' | 'departments' | 'products' | 'media_items' | 'campaigns' | 'brand_assets',
  items: T[],
  mapItem: (item: T, index: number) => Record<string, unknown>
): Promise<void> {
  const colRef = collection(db, collectionName);
  try {
    const existingSnap = await getDocs(colRef);
    const keepIds = new Set(items.map((item) => sanitizeId(item.id)));
    const batch = writeBatch(db);

    existingSnap.docs.forEach((docSnap) => {
      if (!keepIds.has(docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });

    items.forEach((item, index) => {
      const safeId = sanitizeId(item.id);
      const docRef = doc(db, collectionName, safeId);
      const cleanPayload = stripUndefined({
        ...mapItem(item, index),
        id: safeId,
        updatedAt: serverTimestamp(),
      });
      batch.set(docRef, cleanPayload);
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
  }
}

export function serializeSlideForFirestore(slide: HeroSlide, order: number): Record<string, unknown> {
  return {
    id: sanitizeId(slide.id),
    order,
    titleFa: clamp(slide.titleFa, 300),
    titleEn: clamp(slide.titleEn, 300),
    highlightFa: clamp(slide.highlightFa, 200),
    highlightEn: clamp(slide.highlightEn, 200),
    subtitleFa: clamp(slide.subtitleFa, 800),
    subtitleEn: clamp(slide.subtitleEn, 800),
    image: safeImageUrl(slide.image),
    primaryCtaFa: clamp(slide.primaryCtaFa, 120),
    primaryCtaEn: clamp(slide.primaryCtaEn, 120),
    primaryCtaLink: slide.primaryCtaLink ? clamp(slide.primaryCtaLink, 300) : undefined,
    secondaryCtaFa: clamp(slide.secondaryCtaFa, 120),
    secondaryCtaEn: clamp(slide.secondaryCtaEn, 120),
    secondaryCtaLink: slide.secondaryCtaLink ? clamp(slide.secondaryCtaLink, 300) : undefined,
  };
}

export function serializeDepartmentForFirestore(dept: Department, order: number): Record<string, unknown> {
  return {
    ...dept,
    id: sanitizeId(dept.id),
    order,
    titleFa: clamp(dept.titleFa, 250),
    titleEn: clamp(dept.titleEn, 250),
    image: safeImageUrl(dept.image),
    subCards: (dept.subCards || []).slice(0, 12).map((sc) => ({
      ...sc,
      image: safeImageUrl(sc.image, dept.image),
    })),
    servicesFa: (dept.servicesFa || []).slice(0, 20),
    servicesEn: (dept.servicesEn || []).slice(0, 20),
    statsFa: (dept.statsFa || []).slice(0, 10),
    statsEn: (dept.statsEn || []).slice(0, 10),
  };
}

export function serializeProductForFirestore(product: Product, order: number): Record<string, unknown> {
  return {
    ...product,
    id: sanitizeId(product.id),
    order,
    titleFa: clamp(product.titleFa, 250),
    titleEn: clamp(product.titleEn, 250),
    brand: clamp(product.brand, 120),
    model: clamp(product.model, 120),
    image: safeImageUrl(product.image),
    specsFa: (product.specsFa || []).slice(0, 30),
    specsEn: (product.specsEn || []).slice(0, 30),
    tags: product.tags
      ? product.tags
          .map((t) => clamp(t, 60))
          .filter(Boolean)
          .slice(0, 12)
      : undefined,
    stations: product.stations
      ? product.stations.slice(0, 10).map((st) => ({
          ...st,
          img: safeImageUrl(st.img, product.image),
        }))
      : undefined,
  };
}

export function serializeMediaForFirestore(item: MediaItem, order: number): Record<string, unknown> {
  return {
    ...item,
    id: sanitizeId(item.id),
    order,
    titleFa: clamp(item.titleFa, 300),
    titleEn: clamp(item.titleEn, 300),
    image: safeImageUrl(item.image),
    contentFa: clamp(item.contentFa, 20000),
    contentEn: clamp(item.contentEn, 20000),
    isActive: item.isActive !== undefined ? Boolean(item.isActive) : undefined,
    tags: item.tags
      ? item.tags
          .map((t) => clamp(t, 60))
          .filter(Boolean)
          .slice(0, 12)
      : undefined,
  };
}

export function serializeCampaignForFirestore(camp: CampaignLanding, order: number): Record<string, unknown> {
  return {
    ...camp,
    id: sanitizeId(camp.id),
    order,
    slug: clamp(camp.slug, 150),
    titleFa: clamp(camp.titleFa, 250),
    titleEn: clamp(camp.titleEn, 250),
    heroImage: safeImageUrl(camp.heroImage),
    highlightsFa: (camp.highlightsFa || []).slice(0, 20),
    highlightsEn: (camp.highlightsEn || []).slice(0, 20),
  };
}

export function serializeBrandAssetForFirestore(asset: BrandAsset): Record<string, unknown> {
  return {
    id: sanitizeId(asset.id),
    titleFa: clamp(asset.titleFa, 200, 'Asset'),
    titleEn: clamp(asset.titleEn, 200, 'Asset'),
    category: asset.category,
    url: safeImageUrl(asset.url),
    fileSize: clamp(asset.fileSize, 40, '0 KB'),
    fileType: clamp(asset.fileType, 60, 'IMAGE'),
    uploadedAt: clamp(asset.uploadedAt, 80),
  };
}
