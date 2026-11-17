import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
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
  DiscountCode,
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
const utf8Encoder = new TextEncoder();

function utf8ByteLength(str: string): number {
  return utf8Encoder.encode(str).length;
}

function truncateToUtf8Bytes(str: string, maxBytes: number): string {
  if (maxBytes <= 0) return '';
  if (utf8ByteLength(str) <= maxBytes) return str;
  let out = '';
  let bytes = 0;
  for (const ch of str) {
    const chBytes = utf8ByteLength(ch);
    if (bytes + chBytes > maxBytes) break;
    out += ch;
    bytes += chBytes;
  }
  return out;
}

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

function pickAllowedKeys(
  obj: Record<string, unknown>,
  allowedKeys: readonly string[]
): Record<string, unknown> {
  const allowed = new Set(allowedKeys);
  const picked: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (allowed.has(k) && v !== undefined) {
      picked[k] = v;
    }
  }
  return picked;
}

function clamp(val: string | undefined, maxBytes: number, fallback = ''): string {
  const raw = (val ?? '').toString().trim();
  const str = raw || fallback;
  return truncateToUtf8Bytes(str, maxBytes);
}

function safeImageUrl(
  url: string | undefined,
  fallback = '/assets/aistudio/03_rcg_facility_hero_crop_20984afa.jpg'
): string {
  const clean = (url ?? '').toString().trim() || fallback;
  if (utf8ByteLength(clean) > MAX_STR_IMAGE) {
    return fallback;
  }
  return clean;
}

function sanitizeId(id: string): string {
  const cleaned = (id || '').replace(/[^a-zA-Z0-9_-]/g, '-');
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
    originalPrice: order.originalPrice ? clamp(order.originalPrice, 160) : undefined,
    discountCode: order.discountCode ? clamp(order.discountCode, 64) : undefined,
    discountAmount: order.discountAmount ? clamp(order.discountAmount, 160) : undefined,
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
          originalPrice: raw.originalPrice,
          discountCode: raw.discountCode,
          discountAmount: raw.discountAmount,
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

function normalizeComparableValue(val: unknown): unknown {
  if (Array.isArray(val)) {
    return val.map(normalizeComparableValue);
  }
  if (val && typeof val === 'object') {
    const entries = Object.entries(val as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));
    const sorted: Record<string, unknown> = {};
    for (const [k, v] of entries) {
      sorted[k] = normalizeComparableValue(v);
    }
    return sorted;
  }
  return val;
}

function isDocUnchanged(
  existingData: Record<string, unknown>,
  targetWithoutTimestamp: Record<string, unknown>
): boolean {
  const existingWithoutTimestamp = { ...existingData };
  delete existingWithoutTimestamp.updatedAt;
  const existingKeys = Object.keys(existingWithoutTimestamp).sort();
  const targetKeys = Object.keys(targetWithoutTimestamp).sort();
  if (existingKeys.length !== targetKeys.length) return false;
  for (let i = 0; i < existingKeys.length; i++) {
    if (existingKeys[i] !== targetKeys[i]) return false;
  }
  return (
    JSON.stringify(normalizeComparableValue(existingWithoutTimestamp)) ===
    JSON.stringify(normalizeComparableValue(targetWithoutTimestamp))
  );
}

function hasDisallowedLegacyKeys(
  existingData: Record<string, unknown>,
  targetWithoutTimestamp: Record<string, unknown>
): boolean {
  const allowedKeys = new Set([...Object.keys(targetWithoutTimestamp), 'updatedAt']);
  return Object.keys(existingData).some((key) => !allowedKeys.has(key));
}

export async function syncCollectionToFirestore<T extends { id: string }>(
  collectionName: 'hero_slides' | 'departments' | 'products' | 'media_items' | 'campaigns' | 'brand_assets',
  items: T[],
  mapItem: (item: T, index: number) => Record<string, unknown>
): Promise<void> {
  const colRef = collection(db, collectionName);
  try {
    const existingSnap = await getDocs(colRef);
    const existingMap = new Map(existingSnap.docs.map((d) => [d.id, d]));

    // Deduplicate items by sanitized document ID while preserving order
    const dedupedItems = new Map<string, { item: T; index: number }>();
    items.forEach((item, index) => {
      const safeId = sanitizeId(item.id);
      if (!dedupedItems.has(safeId)) {
        dedupedItems.set(safeId, { item, index });
      }
    });

    const keepIds = new Set(dedupedItems.keys());
    const legacyCleanupIds: string[] = [];

    type BatchOp =
      | { kind: 'delete'; ref: ReturnType<typeof doc>; approxBytes: number }
      | {
          kind: 'set';
          ref: ReturnType<typeof doc>;
          payload: Record<string, unknown>;
          approxBytes: number;
        };

    const ops: BatchOp[] = [];

    existingSnap.docs.forEach((docSnap) => {
      if (!keepIds.has(docSnap.id)) {
        ops.push({ kind: 'delete', ref: docSnap.ref, approxBytes: 128 });
      }
    });

    for (const [safeId, { item, index }] of dedupedItems.entries()) {
      const basePayload = stripUndefined({
        ...mapItem(item, index),
        id: safeId,
      });

      const existingDoc = existingMap.get(safeId);
      if (existingDoc) {
        const existingData = existingDoc.data() as Record<string, unknown>;
        if (isDocUnchanged(existingData, basePayload)) {
          continue;
        }
        // If legacy document contains unrecognized fields, delete first so allow update affectedKeys() never rejects
        if (hasDisallowedLegacyKeys(existingData, basePayload)) {
          legacyCleanupIds.push(safeId);
        }
      }

      const fullPayload = {
        ...basePayload,
        updatedAt: serverTimestamp(),
      };
      const approxBytes = utf8ByteLength(JSON.stringify(basePayload)) + 64;
      ops.push({
        kind: 'set',
        ref: doc(db, collectionName, safeId),
        payload: fullPayload,
        approxBytes,
      });
    }

    // Delete any legacy docs that contain extraneous fields before rewriting clean payloads
    for (const legacyId of legacyCleanupIds) {
      await deleteDoc(doc(db, collectionName, legacyId));
    }

    if (ops.length === 0) return;

    // Commit in safe chunks to stay well below Firestore 10 MiB / 500-op batch limits
    const MAX_OPS_PER_BATCH = 20;
    const MAX_BYTES_PER_BATCH = 3_000_000;
    let currentBatch = writeBatch(db);
    let currentOps = 0;
    let currentBytes = 0;

    for (const op of ops) {
      if (
        currentOps > 0 &&
        (currentOps >= MAX_OPS_PER_BATCH || currentBytes + op.approxBytes > MAX_BYTES_PER_BATCH)
      ) {
        await currentBatch.commit();
        currentBatch = writeBatch(db);
        currentOps = 0;
        currentBytes = 0;
      }

      if (op.kind === 'delete') {
        currentBatch.delete(op.ref);
      } else {
        currentBatch.set(op.ref, op.payload);
      }
      currentOps += 1;
      currentBytes += op.approxBytes;
    }

    if (currentOps > 0) {
      await currentBatch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
  }
}

export async function upsertBrandAssetInFirestore(asset: BrandAsset): Promise<void> {
  const safeId = sanitizeId(asset.id);
  const path = `brand_assets/${safeId}`;
  const docRef = doc(db, 'brand_assets', safeId);
  const basePayload = stripUndefined(serializeBrandAssetForFirestore({ ...asset, id: safeId }));

  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as Record<string, unknown>;
      if (isDocUnchanged(existingData, basePayload)) {
        return;
      }
      if (hasDisallowedLegacyKeys(existingData, basePayload)) {
        await deleteDoc(docRef);
      }
    }
    await setDoc(docRef, {
      ...basePayload,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBrandAssetFromFirestore(assetId: string): Promise<void> {
  const safeId = sanitizeId(assetId);
  const path = `brand_assets/${safeId}`;
  try {
    await deleteDoc(doc(db, 'brand_assets', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function serializeSlideForFirestore(slide: HeroSlide, order: number): Record<string, unknown> {
  return {
    id: sanitizeId(slide.id),
    order: Number(order) || 0,
    titleFa: clamp(slide.titleFa, 280, 'اسلاید'),
    titleEn: clamp(slide.titleEn, 280, 'Slide'),
    highlightFa: clamp(slide.highlightFa, 190),
    highlightEn: clamp(slide.highlightEn, 190),
    subtitleFa: clamp(slide.subtitleFa, 760),
    subtitleEn: clamp(slide.subtitleEn, 760),
    image: safeImageUrl(slide.image),
    primaryCtaFa: clamp(slide.primaryCtaFa, 115),
    primaryCtaEn: clamp(slide.primaryCtaEn, 115),
    primaryCtaLink: slide.primaryCtaLink ? clamp(slide.primaryCtaLink, 280) : undefined,
    secondaryCtaFa: clamp(slide.secondaryCtaFa, 115),
    secondaryCtaEn: clamp(slide.secondaryCtaEn, 115),
    secondaryCtaLink: slide.secondaryCtaLink ? clamp(slide.secondaryCtaLink, 280) : undefined,
  };
}

const DEPARTMENT_ALLOWED_KEYS = [
  'id', 'key', 'order', 'titleFa', 'titleEn', 'taglineFa', 'taglineEn',
  'shortDescFa', 'shortDescEn', 'fullDescFa', 'fullDescEn', 'iconName',
  'image', 'subSectionTitleFa', 'subSectionTitleEn', 'bottomBannerFa',
  'bottomBannerEn', 'bottomBannerLink', 'subCards', 'servicesFa', 'servicesEn',
  'statsFa', 'statsEn',
] as const;

const VALID_DEPARTMENT_KEYS = new Set<string>(['sales', 'service', 'sharpening', 'overhaul']);

export function serializeDepartmentForFirestore(dept: Department, order: number): Record<string, unknown> {
  const safeKey = VALID_DEPARTMENT_KEYS.has(dept.key) ? dept.key : 'sales';
  return pickAllowedKeys(
    {
      ...dept,
      id: sanitizeId(dept.id),
      key: safeKey,
      order: Number(order) || 0,
      titleFa: clamp(dept.titleFa, 240, 'دپارتمان'),
      titleEn: clamp(dept.titleEn, 240, 'Department'),
      image: safeImageUrl(dept.image),
      subCards: (dept.subCards || []).slice(0, 12).map((sc) => ({
        ...sc,
        image: safeImageUrl(sc.image, dept.image),
      })),
      servicesFa: (dept.servicesFa || []).slice(0, 20),
      servicesEn: (dept.servicesEn || []).slice(0, 20),
      statsFa: (dept.statsFa || []).slice(0, 10),
      statsEn: (dept.statsEn || []).slice(0, 10),
    },
    DEPARTMENT_ALLOWED_KEYS
  );
}

const PRODUCT_ALLOWED_KEYS = [
  'id', 'order', 'titleFa', 'titleEn', 'category', 'categoryFa', 'categoryEn',
  'brand', 'model', 'year', 'condition', 'conditionFa', 'conditionEn',
  'power', 'tableSize', 'feedSpeed', 'priceFa', 'priceEn',
  'downPaymentFa', 'downPaymentEn', 'installmentChecksFa', 'installmentChecksEn',
  'installmentAvailable', 'specsFa', 'specsEn', 'image', 'badgeFa', 'badgeEn',
  'featuredPoster', 'isActive', 'precisionRating', 'durabilityRating',
  'efficiencyRating', 'qualityBadgeFa', 'qualityBadgeEn', 'tags', 'stations',
] as const;

const VALID_PRODUCT_CATEGORIES = new Set<string>(['saws', 'edgebanders', 'cnc', 'blades', 'refurbished']);

export function serializeProductForFirestore(product: Product, order: number): Record<string, unknown> {
  const safeCategory = VALID_PRODUCT_CATEGORIES.has(product.category) ? product.category : 'saws';
  const safeCondition = product.condition === 'used' ? 'used' : 'new';
  return pickAllowedKeys(
    {
      ...product,
      id: sanitizeId(product.id),
      order: Number(order) || 0,
      titleFa: clamp(product.titleFa, 240, 'محصول'),
      titleEn: clamp(product.titleEn, 240, 'Product'),
      category: safeCategory,
      brand: clamp(product.brand, 115, 'RCG'),
      model: clamp(product.model, 115, 'Standard'),
      condition: safeCondition,
      image: safeImageUrl(product.image),
      isActive: product.isActive !== undefined ? Boolean(product.isActive) : undefined,
      specsFa: (product.specsFa || []).slice(0, 30),
      specsEn: (product.specsEn || []).slice(0, 30),
      tags: product.tags
        ? product.tags
            .map((t) => clamp(t, 55))
            .filter(Boolean)
            .slice(0, 12)
        : undefined,
      stations: product.stations
        ? product.stations.slice(0, 10).map((st) => ({
            ...st,
            img: safeImageUrl(st.img, product.image),
          }))
        : undefined,
    },
    PRODUCT_ALLOWED_KEYS
  );
}

const MEDIA_ALLOWED_KEYS = [
  'id', 'order', 'type', 'typeFa', 'typeEn', 'titleFa', 'titleEn',
  'dateFa', 'dateEn', 'readTimeFa', 'readTimeEn', 'summaryFa', 'summaryEn',
  'contentFa', 'contentEn', 'image', 'videoUrl', 'authorFa', 'authorEn',
  'isActive', 'tags',
] as const;

const VALID_MEDIA_TYPES = new Set<string>(['news', 'article', 'video', 'project']);

export function serializeMediaForFirestore(item: MediaItem, order: number): Record<string, unknown> {
  const safeType = VALID_MEDIA_TYPES.has(item.type) ? item.type : 'article';
  return pickAllowedKeys(
    {
      ...item,
      id: sanitizeId(item.id),
      order: Number(order) || 0,
      type: safeType,
      titleFa: clamp(item.titleFa, 280, 'مطلب'),
      titleEn: clamp(item.titleEn, 280, 'Article'),
      image: safeImageUrl(item.image),
      contentFa: clamp(item.contentFa, 19000),
      contentEn: clamp(item.contentEn, 19000),
      isActive: item.isActive !== undefined ? Boolean(item.isActive) : undefined,
      tags: item.tags
        ? item.tags
            .map((t) => clamp(t, 55))
            .filter(Boolean)
            .slice(0, 12)
        : undefined,
    },
    MEDIA_ALLOWED_KEYS
  );
}

const CAMPAIGN_ALLOWED_KEYS = [
  'id', 'order', 'slug', 'titleFa', 'titleEn', 'badgeFa', 'badgeEn',
  'headlineFa', 'headlineEn', 'subheadlineFa', 'subheadlineEn', 'heroImage',
  'ctaTextFa', 'ctaTextEn', 'secondaryCtaFa', 'secondaryCtaEn', 'featuredMachineId',
  'specialOfferFa', 'specialOfferEn', 'discountPercentage', 'downPaymentFa',
  'downPaymentEn', 'installmentsCountFa', 'installmentsCountEn', 'deliveryTermsFa',
  'deliveryTermsEn', 'warrantyFa', 'warrantyEn', 'highlightsFa', 'highlightsEn',
  'registrationTitleFa', 'registrationTitleEn', 'registrationSubtitleFa',
  'registrationSubtitleEn', 'isActive', 'viewsCount', 'conversionsCount',
] as const;

export function serializeCampaignForFirestore(camp: CampaignLanding, order: number): Record<string, unknown> {
  return pickAllowedKeys(
    {
      ...camp,
      id: sanitizeId(camp.id),
      order: Number(order) || 0,
      slug: clamp(camp.slug, 145, sanitizeId(camp.id)),
      titleFa: clamp(camp.titleFa, 240, 'کمپین'),
      titleEn: clamp(camp.titleEn, 240, 'Campaign'),
      heroImage: safeImageUrl(camp.heroImage),
      isActive: Boolean(camp.isActive),
      highlightsFa: (camp.highlightsFa || []).slice(0, 20),
      highlightsEn: (camp.highlightsEn || []).slice(0, 20),
    },
    CAMPAIGN_ALLOWED_KEYS
  );
}

const VALID_BRAND_ASSET_CATEGORIES = new Set<string>([
  'logo',
  'hero',
  'departments',
  'catalog',
  'campaigns',
  'media',
  'photo',
  'brandbook',
  'certificate',
]);

export function serializeBrandAssetForFirestore(asset: BrandAsset): Record<string, unknown> {
  const safeCategory = VALID_BRAND_ASSET_CATEGORIES.has(asset.category)
    ? asset.category
    : 'photo';
  return {
    id: sanitizeId(asset.id),
    titleFa: clamp(asset.titleFa, 280, 'Asset'),
    titleEn: clamp(asset.titleEn, 280, 'Asset'),
    category: safeCategory,
    url: safeImageUrl(asset.url),
    fileSize: clamp(asset.fileSize, 55, '0 KB'),
    fileType: clamp(asset.fileType, 95, 'IMAGE'),
    uploadedAt: clamp(asset.uploadedAt, 115, new Date().toISOString().slice(0, 10)),
  };
}

// -----------------------------------------------------------------------------
// Single-Use Discount Codes (Admin Managed, Point-Get Verified, Batch/Atomic Redeem)
// -----------------------------------------------------------------------------

export function normalizeDiscountCodeKey(rawCode: string): string {
  return rawCode
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 64);
}

function mapDocToDiscountCode(id: string, raw: Record<string, unknown>): DiscountCode {
  return {
    id: (raw.id as string) || id,
    code: (raw.code as string) || id,
    discountType: raw.discountType === 'fixed' ? 'fixed' : 'percent',
    discountValue: Number(raw.discountValue) || 0,
    note: typeof raw.note === 'string' ? raw.note : undefined,
    isUsed: Boolean(raw.isUsed),
    createdAt: typeof raw.createdAtLabel === 'string' ? raw.createdAtLabel : '',
    usedByUid: typeof raw.usedByUid === 'string' ? raw.usedByUid : undefined,
    usedByName: typeof raw.usedByName === 'string' ? raw.usedByName : undefined,
    usedByOrderId: typeof raw.usedByOrderId === 'string' ? raw.usedByOrderId : undefined,
    usedAt: typeof raw.usedAtLabel === 'string' ? raw.usedAtLabel : undefined,
  };
}

export function subscribeAdminDiscountCodes(
  onCodes: (codes: DiscountCode[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'discount_codes'),
    (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map((d) =>
          mapDocToDiscountCode(d.id, d.data() as Record<string, unknown>)
        );
        onCodes(list);
      } else {
        onCodes([]);
      }
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'discount_codes')
  );
}

export async function verifyDiscountCodeInFirestore(
  rawCode: string
): Promise<{ found: boolean; code?: DiscountCode; error?: boolean }> {
  const codeId = normalizeDiscountCodeKey(rawCode);
  if (codeId.length < 2) {
    return { found: false };
  }
  try {
    const snap = await getDoc(doc(db, 'discount_codes', codeId));
    if (!snap.exists()) {
      return { found: false };
    }
    return {
      found: true,
      code: mapDocToDiscountCode(snap.id, snap.data() as Record<string, unknown>),
    };
  } catch {
    return { found: false, error: true };
  }
}

export async function upsertDiscountCodeInFirestore(dc: DiscountCode): Promise<void> {
  const codeId = normalizeDiscountCodeKey(dc.code || dc.id);
  if (codeId.length < 2) return;
  const docRef = doc(db, 'discount_codes', codeId);
  const path = `discount_codes/${codeId}`;
  const cleanValue =
    dc.discountType === 'percent'
      ? Math.min(100, Math.max(1, Math.round(Number(dc.discountValue) || 0)))
      : Math.min(1000000000, Math.max(1, Math.round(Number(dc.discountValue) || 0)));

  try {
    const existingSnap = await getDoc(docRef);
    if (!existingSnap.exists()) {
      const payload = stripUndefined({
        id: codeId,
        code: codeId,
        discountType: dc.discountType,
        discountValue: cleanValue,
        note: dc.note ? clamp(dc.note, 300) : undefined,
        isUsed: Boolean(dc.isUsed),
        createdAtLabel: clamp(dc.createdAt, 80),
        usedByUid: dc.usedByUid ? sanitizeId(dc.usedByUid) : undefined,
        usedByName: dc.usedByName ? clamp(dc.usedByName, 120) : undefined,
        usedByOrderId: dc.usedByOrderId ? sanitizeId(dc.usedByOrderId) : undefined,
        usedAtLabel: dc.usedAt ? clamp(dc.usedAt, 80) : undefined,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await setDoc(docRef, payload);
    } else {
      const updatePayload: Record<string, unknown> = {
        discountType: dc.discountType,
        discountValue: cleanValue,
        note: dc.note ? clamp(dc.note, 300) : deleteField(),
        isUsed: Boolean(dc.isUsed),
        usedByUid: dc.isUsed && dc.usedByUid ? sanitizeId(dc.usedByUid) : deleteField(),
        usedByName: dc.isUsed && dc.usedByName ? clamp(dc.usedByName, 120) : deleteField(),
        usedByOrderId: dc.isUsed && dc.usedByOrderId ? sanitizeId(dc.usedByOrderId) : deleteField(),
        usedAtLabel: dc.isUsed && dc.usedAt ? clamp(dc.usedAt, 80) : deleteField(),
        updatedAt: serverTimestamp(),
      };
      if (!dc.isUsed) {
        updatePayload.usedAt = deleteField();
      }
      await updateDoc(docRef, updatePayload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteDiscountCodeFromFirestore(rawCodeId: string): Promise<void> {
  const codeId = normalizeDiscountCodeKey(rawCodeId);
  if (!codeId) return;
  const path = `discount_codes/${codeId}`;
  try {
    await deleteDoc(doc(db, 'discount_codes', codeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function redeemDiscountCodeInFirestore(
  rawCodeId: string,
  params: {
    userId: string;
    customerName: string;
    orderId: string;
    usedAtLabel: string;
  }
): Promise<void> {
  const codeId = normalizeDiscountCodeKey(rawCodeId);
  if (!codeId) return;
  const path = `discount_codes/${codeId}`;
  const docRef = doc(db, 'discount_codes', codeId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return;
    }
    await updateDoc(docRef, {
      isUsed: true,
      usedByUid: sanitizeId(params.userId),
      usedByName: clamp(params.customerName, 120, 'Customer'),
      usedByOrderId: sanitizeId(params.orderId),
      usedAtLabel: clamp(params.usedAtLabel, 80),
      usedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function syncDiscountCodesToFirestore(codes: DiscountCode[]): Promise<void> {
  const colRef = collection(db, 'discount_codes');
  try {
    const existingSnap = await getDocs(colRef);
    const existingMap = new Map(existingSnap.docs.map((d) => [d.id, d]));
    const keepIds = new Set(
      codes.map((c) => normalizeDiscountCodeKey(c.code || c.id)).filter((id) => id.length >= 2)
    );
    const batch = writeBatch(db);

    existingSnap.docs.forEach((docSnap) => {
      if (!keepIds.has(docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });

    codes.forEach((dc) => {
      const codeId = normalizeDiscountCodeKey(dc.code || dc.id);
      if (codeId.length < 2) return;
      const docRef = doc(db, 'discount_codes', codeId);
      const cleanValue =
        dc.discountType === 'percent'
          ? Math.min(100, Math.max(1, Math.round(Number(dc.discountValue) || 0)))
          : Math.min(1000000000, Math.max(1, Math.round(Number(dc.discountValue) || 0)));

      if (!existingMap.has(codeId)) {
        batch.set(
          docRef,
          stripUndefined({
            id: codeId,
            code: codeId,
            discountType: dc.discountType,
            discountValue: cleanValue,
            note: dc.note ? clamp(dc.note, 300) : undefined,
            isUsed: Boolean(dc.isUsed),
            createdAtLabel: clamp(dc.createdAt, 80),
            usedByUid: dc.usedByUid ? sanitizeId(dc.usedByUid) : undefined,
            usedByName: dc.usedByName ? clamp(dc.usedByName, 120) : undefined,
            usedByOrderId: dc.usedByOrderId ? sanitizeId(dc.usedByOrderId) : undefined,
            usedAtLabel: dc.usedAt ? clamp(dc.usedAt, 80) : undefined,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        );
      } else {
        const updatePayload: Record<string, unknown> = {
          discountType: dc.discountType,
          discountValue: cleanValue,
          note: dc.note ? clamp(dc.note, 300) : deleteField(),
          isUsed: Boolean(dc.isUsed),
          usedByUid: dc.isUsed && dc.usedByUid ? sanitizeId(dc.usedByUid) : deleteField(),
          usedByName: dc.isUsed && dc.usedByName ? clamp(dc.usedByName, 120) : deleteField(),
          usedByOrderId: dc.isUsed && dc.usedByOrderId ? sanitizeId(dc.usedByOrderId) : deleteField(),
          usedAtLabel: dc.isUsed && dc.usedAt ? clamp(dc.usedAt, 80) : deleteField(),
          updatedAt: serverTimestamp(),
        };
        if (!dc.isUsed) {
          updatePayload.usedAt = deleteField();
        }
        batch.update(docRef, updatePayload);
      }
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'discount_codes');
  }
}

