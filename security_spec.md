# RCG Industrial Portal — Security Specification & Threat Model

## 1. Core Data Invariants
1. **Verified Identity Binding**: Any user-submitted order (`sharpening_orders`), consultation inquiry (`inquiries`), or campaign registration (`campaign_inquiries`) MUST bind `userId == request.auth.uid` from a verified Google session (`request.auth.token.email_verified == true`), cannot impersonate another `userId`, and cannot alter `userId` or `createdAt` after creation.
2. **PII Split Isolation**: User email addresses and phone numbers live strictly in `user_profiles/{userId}/private/{docId}` gated by ownership (`request.auth.uid == userId`) and parent existence (`get(.../user_profiles/$(userId)).data.uid == request.auth.uid`) or verified admin access—never publicly readable.
3. **Server Timestamp Integrity**: All `createdAt` and `updatedAt` fields MUST equal `request.time` at the time of mutation; client-forged dates are rejected.
4. **Terminal State Locking**: Once a `sharpening_orders` document reaches `completed` or `cancelled`, an `inquiries` document reaches `resolved`, or a `campaign_inquiries` document reaches `contracted` or `archived`, non-admin users cannot revert or alter it.
5. **Admin-Only CMS Storefront Control**: Public site visitors may read published CMS collections (`site_configs`, `hero_slides`, `departments`, `products`, `media_items`, `campaigns`, `brand_assets`), while all mutations require verified `isAdmin()` credentials (`rcgroup.mdp@gmail.com` with `email_verified == true` or trusted `/admins/{uid}` entry).
6. **Privilege Escalation Block**: Users creating or updating `user_profiles/{userId}` can never attach RBAC fields (`role`, `isAdmin`, `permissions`).
7. **Strict Schema & Size Bounds**: Every string and path variable obeys `isValidId` (`^[a-zA-Z0-9_-]+$`, max 128 chars) and explicit `.size()` boundaries matching `firebase-blueprint.json` to block ghost fields and 1MB payload DoS attacks.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Identity Spoofing on Order**: Unauthenticated or mismatched `userId` (`userId: "victim-uid"` when logged in as `attacker-uid`) on `sharpening_orders` -> **DENIED**.
2. **Ghost / Shadow Field Injection**: Creating an `inquiries` doc with all valid fields plus `"isAdmin": true` or `"discountOverride": 99` -> **DENIED** by `hasOnly(...)`.
3. **Admin Email Spoofing**: Writing to `products/{id}` with `request.auth.token.email == "rcgroup.mdp@gmail.com"` when `email_verified == false` -> **DENIED**.
4. **Role Self-Escalation on Profile**: Updating `user_profiles/{uid}` with `affectedKeys` including `"role"` -> **DENIED**.
5. **PII Blanket Leak**: Reading `user_profiles/{otherUid}/private/pii` as authenticated non-admin user `attacker-uid` -> **DENIED**.
6. **Direct Status Skip / Admin Override**: User setting `status: "completed"` on initial `sharpening_orders` create -> **DENIED** (`status == 'new'` enforced on create).
7. **Terminal State Mutation**: Non-admin user updating a `sharpening_orders` record whose `existing().status == "completed"` -> **DENIED**.
8. **Forged Timestamp Injection**: Creating an `inquiries` document with `createdAt: Timestamp(2020-01-01)` instead of `request.time` -> **DENIED**.
9. **Immutable Owner Tampering**: Updating `sharpening_orders/{id}` to reassign `userId` -> **DENIED**.
10. **Path ID Poisoning**: Creating `/products/bad%20id$overflow...` (>128 chars or invalid regex) -> **DENIED** by `isValidId()`.
11. **1MB+ Denial of Wallet Payload**: Writing a 900KB `message` into `inquiries` -> **DENIED** (`message.size() <= 2000`).
12. **Unscoped List Scraping**: Attempting `collection(db, 'inquiries')` list query without matching `userId == request.auth.uid` as non-admin -> **DENIED** (`allow list` enforces `resource.data.userId == request.auth.uid`).

## 3. Conflict & Audit Matrix
| Collection | Identity Spoofing Blocked | State Shortcutting Blocked | Value/Size Poisoning Blocked | Shadow Update Blocked |
| :--- | :---: | :---: | :---: | :---: |
| `user_profiles` | Yes | N/A | Yes | Yes |
| `user_profiles/private` | Yes | N/A | Yes | Yes |
| `admins` | Yes | Yes | Yes | Yes |
| `site_configs` | Yes | Yes | Yes | Yes |
| `hero_slides` | Yes | N/A | Yes | Yes |
| `departments` | Yes | N/A | Yes | Yes |
| `products` | Yes | N/A | Yes | Yes |
| `media_items` | Yes | N/A | Yes | Yes |
| `campaigns` | Yes | N/A | Yes | Yes |
| `brand_assets` | Yes | N/A | Yes | Yes |
| `sharpening_orders` | Yes | Yes | Yes | Yes |
| `inquiries` | Yes | Yes | Yes | Yes |
| `campaign_inquiries` | Yes | Yes | Yes | Yes |
