# Protec Security Specification & Threat Model

## 1. Data Invariants
1. **Customer PII & Media Isolation**: Customer quote requests (`/quotes/{quoteId}`) contain sensitive PII (full name, phone number, email, residential/project address) and private media attachment paths. Unauthenticated users and non-admin signed-in users can NEVER `get`, `list`, `update`, or `delete` `/quotes/{quoteId}` documents or download files under `/api/quotes/media/*`.
2. **Initial Quote Status Lock**: Public quote submissions MUST be created with `status == 'new'` and without forged `adminNotes` or pre-completed states.
3. **Immutable Audit Fields**: `createdAt` and `referenceCode` on quotes, services, projects, and offers are immutable after creation; `createdAt` and `updatedAt` MUST match `request.time`.
4. **Verified Admin Identity**: Admin access requires `request.auth != null && request.auth.token.email_verified == true` and either an authorized company/owner email (`protecprotection4@gmail.com` or `mohamedmezher555@gmail.com`) or a verified UID entry in `/admins/{uid}`.
5. **Bounded Payloads & Key Allowlisting**: Every collection enforces `keys().hasAll(...)` and `keys().hasOnly(...)` on create, `affectedKeys().hasOnly(...)` on update, strict `.size()` bounds on every string, and `.size() <= 10` on every array.
6. **Public Reviews Integrity (`/reviews/{reviewId}`)**: Public visitors can read reviews and submit new 1–5 star reviews validated with strict schema keys, integer rating range (`1..5`), `createdAt == request.time`, and bounded comment lengths. Updates are blocked (`update: if false`) and only verified admins may delete reviews.
7. **Admin Credential Hash Isolation**: `/adminCredentials/{credentialId}` stores only a salted PBKDF2-SHA256 hash (`iterations >= 100000`), never plaintext secrets, and blocks all unauthenticated, unverified, list, or non-admin read/write operations.

## 2. Dirty Dozen Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unverified Email Spoof**: User with `email: "protecprotection4@gmail.com"` and `email_verified: false` attempts to `list` `/quotes` or `get` `/adminCredentials/primary`.
2. **Shadow Field Injection on Quote**: Public user submits a quote with an extra ghost field `isApproved: true` or `adminNotes: "approved"`.
3. **Quote Status Escalation**: Public user creates a quote with `status: "completed"` instead of `"new"`.
4. **Quote & Credential Scraping**: Unauthenticated or non-admin user attempts `get` or `list` on `/quotes` or `/adminCredentials/primary`.
5. **Client Timestamp Forgery**: Quote or AdminCredential submitted with backdated `createdAt: Timestamp(2020-01-01)` instead of server `request.time`.
6. **ID Poisoning**: Attempt to write `/services/<1500-char-invalid-id>` with slashes or special characters.
7. **Unbounded Array / DoW Attack**: Quote submitted with 25 attachment entries (`attachments.size() > 10`).
8. **Type Poisoning on Update**: Attempt to update `areaSqm` on a project to a string or negative number, or `iterations` on `/adminCredentials/primary` below `100000`.
9. **Unauthorized Content Mutation**: Non-admin user attempts to `update` `/siteContent/main`, `/offers/{id}`, or `/services/{id}`.
10. **Self-Assigned Admin Escalation**: Non-admin authenticated user attempts to write `/admins/{theirUid}` with `role: "admin"`.
11. **Immutable Field Tampering**: Admin or user attempts to alter `referenceCode` on `/quotes/{id}`, `email` on `/adminCredentials/primary`, or `createdAt` during an update.
12. **Excessive String Payload**: Public user submits a 100KB `description` string exceeding `description.size() <= 3000`.

