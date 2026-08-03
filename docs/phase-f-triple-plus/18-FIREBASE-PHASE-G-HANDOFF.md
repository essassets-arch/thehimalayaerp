# Phase F+++ — 18 Firebase Phase G Handoff Report

## Status: HANDOFF READY

## Summary of Handoff Parameters for Phase G

1. **Client Configuration**:
   - Web VAPID Key: Configured in `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.
   - Service Worker Location: `frontend/public/firebase-messaging-sw.js`.
   - FCM Token Hook: `useFcmToken()` custom hook ready for instantiation upon user login.

2. **Backend Push Dispatcher**:
   - `FirebaseMessagingService` in NestJS backend ready to receive `SendPushNotificationDto` (`userId`, `title`, `body`, `deepLink`).
   - Handles multi-device token fan-out per user ID.
   - Cleans up invalid/expired FCM tokens (`messaging/registration-token-not-registered`).

3. **Security Constraints**:
   - Zero Firebase service account secrets stored in frontend bundles or Git repositories.
   - FCM device tokens sanitized on user logout.
