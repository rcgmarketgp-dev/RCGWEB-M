/**
 * Adversarial Security Rules Verification Matrix ("Dirty Dozen" Payloads)
 * Intended for validation against Firebase Rules Emulator (`@firebase/rules-unit-testing`)
 * ensuring all unauthorized mutations and reads yield PERMISSION_DENIED.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: {
    uid?: string;
    email?: string;
    email_verified?: boolean;
  } | null;
  payload?: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Identity spoofing on sharpening order creation',
    collectionPath: 'sharpening_orders/order-spoof-1',
    operation: 'create',
    auth: { uid: 'attacker-uid', email: 'attacker@example.com', email_verified: true },
    payload: {
      id: 'order-spoof-1',
      userId: 'victim-uid',
      customerName: 'Attacker',
      phone: '09120000000',
      city: 'Tehran',
      bladeType: 'MDF',
      diameter: '300 mm',
      teethCount: '96T',
      serviceType: 'Standard',
      quantity: 1,
      estimatedPrice: '376,000',
      status: 'new',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Shadow ghost field injection on inquiry creation',
    collectionPath: 'inquiries/inq-ghost-1',
    operation: 'create',
    auth: { uid: 'user-1', email: 'user@example.com', email_verified: true },
    payload: {
      id: 'inq-ghost-1',
      userId: 'user-1',
      name: 'User',
      phone: '09121112233',
      department: 'Sales',
      subject: 'Quote',
      message: 'Need pricing',
      status: 'new',
      isAdmin: true,
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified admin email spoofing attempt on products',
    collectionPath: 'products/prod-spoof',
    operation: 'create',
    auth: { uid: 'spoof-uid', email: 'rcgroup.mdp@gmail.com', email_verified: false },
    payload: {
      id: 'prod-spoof',
      titleFa: 'Hacked',
      titleEn: 'Hacked',
      category: 'saws',
      brand: 'RCG',
      model: 'X',
      condition: 'new',
      image: '/assets/x.jpg',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Privilege escalation field on user profile update',
    collectionPath: 'user_profiles/user-1',
    operation: 'update',
    auth: { uid: 'user-1', email: 'user@example.com', email_verified: true },
    payload: {
      role: 'super_admin',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Cross-user PII read on isolated private subcollection',
    collectionPath: 'user_profiles/victim-uid/private/pii',
    operation: 'get',
    auth: { uid: 'attacker-uid', email: 'attacker@example.com', email_verified: true },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Status shortcutting to completed on initial order create',
    collectionPath: 'sharpening_orders/order-skip-1',
    operation: 'create',
    auth: { uid: 'user-1', email: 'user@example.com', email_verified: true },
    payload: {
      id: 'order-skip-1',
      userId: 'user-1',
      customerName: 'User',
      phone: '09121112233',
      city: 'Rasht',
      bladeType: 'MDF',
      diameter: '300 mm',
      teethCount: '96T',
      serviceType: 'Standard',
      quantity: 1,
      estimatedPrice: '0',
      status: 'completed',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Terminal state tamper after order completion',
    collectionPath: 'sharpening_orders/order-done-1',
    operation: 'update',
    auth: { uid: 'user-1', email: 'user@example.com', email_verified: true },
    payload: {
      notes: 'Changed after finish',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Forged client timestamp injection on inquiry',
    collectionPath: 'inquiries/inq-time-1',
    operation: 'create',
    auth: { uid: 'user-1', email: 'user@example.com', email_verified: true },
    payload: {
      id: 'inq-time-1',
      userId: 'user-1',
      name: 'User',
      phone: '09121112233',
      department: 'Sales',
      subject: 'Test',
      message: 'Test body',
      status: 'new',
      createdAt: '2020-01-01T00:00:00Z',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Immortal owner tampering on update',
    collectionPath: 'inquiries/inq-own-1',
    operation: 'update',
    auth: { uid: 'user-1', email: 'user@example.com', email_verified: true },
    payload: {
      userId: 'other-user',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Invalid document ID path poisoning',
    collectionPath: 'inquiries/bad id$with spaces!',
    operation: 'create',
    auth: { uid: 'user-1', email: 'user@example.com', email_verified: true },
    payload: {
      id: 'bad id',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Oversized message Denial-of-Wallet payload',
    collectionPath: 'inquiries/inq-big-1',
    operation: 'create',
    auth: { uid: 'user-1', email: 'user@example.com', email_verified: true },
    payload: {
      id: 'inq-big-1',
      userId: 'user-1',
      name: 'User',
      phone: '09121112233',
      department: 'Sales',
      subject: 'Oversize',
      message: 'A'.repeat(3000),
      status: 'new',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unscoped list query scraping all customer inquiries or discount codes',
    collectionPath: 'discount_codes',
    operation: 'list',
    auth: { uid: 'attacker-uid', email: 'attacker@example.com', email_verified: true },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 13,
    name: 'Discount code value tampering during customer redemption',
    collectionPath: 'discount_codes/RCG-OFF20',
    operation: 'update',
    auth: { uid: 'user-1', email: 'user@example.com', email_verified: true },
    payload: {
      isUsed: true,
      discountValue: 100,
      usedByUid: 'user-1',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
];

