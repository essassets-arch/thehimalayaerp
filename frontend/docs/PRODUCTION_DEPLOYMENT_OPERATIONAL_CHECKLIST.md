# Himalaya ERP V2 — Production Deployment & Operational Rollout Playbook

---

## 1. Release Milestone & Release Gate Lifecycle

```text
┌────────────────┐     ┌─────────────────────┐     ┌──────────────────────────┐     ┌─────────────────┐
│  RC-1 (Frozen) │ ──> │ Production Deployed │ ──> │ Production Smoke Verified│ ──> │  Production GA  │
└────────────────┘     └─────────────────────┘     └──────────────────────────┘     └─────────────────┘
```

- **Current Status**: **RC-1 (Frozen Baseline)**
- **Automated QA Verification**: **495 / 495 Tests Passed (100% PASS)**
- **Next.js Production Build**: **Exit Code 0**
- **Code & Logic Integrity**: **0 Business Logic Changes | 0 Desktop Regressions**
- **Policy**: Phases 1–9 are frozen. No feature or logic changes will be made unless a real defect is discovered during the production smoke test.

---

## 2. Pre-Deployment Operational Checklist

### A. Environment Configuration & Secrets Management
- [ ] **Production `.env` Audit**: Ensure `DATABASE_URL`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `PORT`, `CORS_ORIGIN`, and `NODE_ENV=production` are set.
- [ ] **CORS & Domain Locking**: Verify allowed origins strictly point to the production domain (e.g. `https://erp.himalaya.com`).
- [ ] **Cookie Security**: Ensure `Secure`, `HttpOnly`, and `SameSite=Strict` or `Lax` flags are enabled for session cookies under HTTPS.
- [ ] **Firebase / FCM Credentials**: Mount production `firebase-service-account.json` securely without committing private keys into source repositories.
- [ ] **Google Maps API Restrictions**: Restrict production Google Maps API key by HTTP referrers (e.g. `https://*.himalaya.com/*`) and enable only Maps JavaScript API & Geocoding API.

### B. Database Migration & Disaster Recovery
- [ ] **PostgreSQL Production Backup**: Execute pre-rollout snapshot / dump:
  ```bash
  pg_dump -U erp_user -d himalaya_erp -F c -b -v -f himalaya_erp_pre_deploy.dump
  ```
- [ ] **Restore Verification**: Test restoration of backup into staging to ensure dump integrity.
- [ ] **Prisma Migration Execution**: Run production migrations:
  ```bash
  npx prisma migrate deploy
  ```
- [ ] **Prisma Client Generation**: Ensure client schema sync:
  ```bash
  npx prisma generate
  ```

### C. Docker & VPS Container Deployment
- [ ] **Backend Image Build**:
  ```bash
  docker build -t himalaya-backend:latest ./backend
  ```
- [ ] **Frontend Image Build**:
  ```bash
  docker build -t himalaya-frontend:latest ./frontend
  ```
- [ ] **Reverse Proxy / NGINX Configuration**: Configure SSL termination (Let's Encrypt / Certbot), WebSocket proxying for Socket.IO (`/socket.io/`), and upload size limits (`client_max_body_size 25M`).

---

## 3. Post-Deployment Smoke & Health Verification

| Step | Target Service / Workflow | Verification Method | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **1** | Health Endpoint | `GET /api/backend/health` | HTTP `200 OK` with DB connectivity `true` |
| **2** | Authentication | Login with Super Admin / Sales | Successful JWT issuance & redirect to role dashboard |
| **3** | Document Sequencing | Create test quotation / lead | Increments sequential number with current FY (`26-27`) |
| **4** | Realtime Socket.IO | Connect GPS / Live Tracking | Stable handshake without connection drop |
| **5** | Storage & Uploads | Upload test document / POD | File stored in designated volume with secure permissions |
| **6** | Logging & Monitoring | Inspect container stdout & APM | Structured JSON logs with 0 unhandled exceptions |
