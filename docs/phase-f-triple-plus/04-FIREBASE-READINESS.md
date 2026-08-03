# Phase F+++ — 04 Firebase Readiness Report

## Status: AUDITED & PREPARED (Implementation deferred to Phase G)

## 1. Architectural Boundary

Per the Phase F+++ prompt directives:
- Real-time Firebase push notifications will be implemented in **Phase G**.
- Phase F+++ audits Firebase readiness and establishes token storage schemas without introducing active push messaging payloads.

---

## 2. Firebase SDK & File Inspection

| Component | Target Location | Preparedness Status | Security Rule |
|-----------|-----------------|---------------------|---------------|
| Client SDK | `frontend/package.json` | Ready for `firebase` v10+ installation | Public client config only (`apiKey`, `projectId`, `messagingSenderId`) |
| Service Worker | `frontend/public/firebase-messaging-sw.js` | Placeholder created for background push listener | No private keys embedded |
| Server Admin SDK | `backend/src/notifications/` | Admin SDK initialization structure audited | Service account key stored in backend `.env` (`FIREBASE_SERVICE_ACCOUNT_JSON`) |
| FCM Device Token Table | Prisma Schema (`FcmToken`) | `token`, `userId`, `companyId`, `deviceInfo`, `createdAt` | Token associated with User & Company ID; unassigned on logout |

---

## 3. Phase G Implementation Readiness Checklist
- [x] Client environment variable schema defined (`NEXT_PUBLIC_FIREBASE_VAPID_KEY`).
- [x] Backend service account environment schema defined (`FIREBASE_SERVICE_ACCOUNT_PATH`).
- [x] Unregister FCM token trigger linked to `logout()` flow in `authStore.ts`.
- [x] Notification permission prompt UX design specified.
