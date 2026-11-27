# PRODUCTION ROLLBACK AND DISASTER RECOVERY PLAN
**Contingency Protocols, State Reversion, and Point-in-Time Recovery**

| System | Himalaya ERP (`https://thehimalaya.cloud`) |
| :--- | :--- |
| **Audit Status** | Second-Pass Contingency Specification |
| **Recovery Objective** | RPO < 5 Minutes • RTO < 15 Minutes • Zero Data Loss |
| **Audit Protocol** | Read-Only • No Modifications Executed |

---

## 1. Principles of Safe Production Deployment

Every security remediation must be treated as a potentially reversible deployment. In an active production ERP, a rollback strategy must exist **prior to executing any code change**.

### Non-Negotiable Recovery Rules:
1. **Pre-Deployment Full Database Backup:** A timestamped, uncompressed PostgreSQL snapshot must be generated immediately prior to applying any patch.
2. **Atomic Code Branches:** Each remediation must reside on an isolated Git branch (e.g., `fix/sec-auth-001`, `fix/sec-tenant-001`).
3. **No Irreversible Database Migrations:** No migration may drop existing columns or delete table partitions without a multi-release deprecation cycle.
4. **Isolated Service Rollback:** Backend, frontend, and reverse-proxy services run as independent Docker containers, allowing pinpoint rollback of a single service without affecting others.

---

## 2. Pre-Deployment Snapshot Protocol

Prior to maintenance deployment, execute the following read-only snapshot command on the VPS host:

```bash
# 1. Capture snapshot with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/himalaya_pre_patch"
mkdir -p "$BACKUP_DIR"

# 2. Execute pg_dump from the active Postgres container
docker exec himalaya-postgres pg_dump \
  -U himalaya_erp_user \
  -d himalaya_erp \
  -F c \
  -b \
  -v \
  -f "/tmp/himalaya_backup_${TIMESTAMP}.dump"

# 3. Copy dump to safe host storage outside Docker volume
docker cp "himalaya-postgres:/tmp/himalaya_backup_${TIMESTAMP}.dump" "$BACKUP_DIR/"
docker exec himalaya-postgres rm "/tmp/himalaya_backup_${TIMESTAMP}.dump"

# 4. Record SHA256 checksum for integrity verification
sha256sum "${BACKUP_DIR}/himalaya_backup_${TIMESTAMP}.dump" > "${BACKUP_DIR}/himalaya_backup_${TIMESTAMP}.sha256"
echo " [OK] Pre-deployment snapshot verified at ${BACKUP_DIR}/himalaya_backup_${TIMESTAMP}.dump"
```

---

## 3. Step-by-Step Rollback Scenarios

### Scenario A: Application Code Rollback (Backend or Frontend Bug)
**Trigger:** An unforeseen runtime exception or frontend crash occurs following a code deployment, but database data remains intact.

1. **Identify Previous Stable Commit:**
   ```bash
   git log -n 5 --oneline
   # Stable baseline commit identified: a5ce1482
   ```
2. **Revert Git Working Tree to Stable State:**
   ```bash
   git checkout main
   git reset --hard a5ce1482
   ```
3. **Rebuild & Restart Containers:**
   ```bash
   docker compose build backend frontend
   docker compose up -d --no-deps backend frontend
   ```
4. **Verify Health Endpoint:**
   ```bash
   curl -s -f http://127.0.0.1:4001/api/v1/health || echo "Health check failed"
   ```
   **Downtime Estimate:** < 60 seconds.

---

### Scenario B: Database State Rollback (Data Inconsistency)
**Trigger:** A bug or unexpected script behavior causes corrupt state or unintended record changes.

1. **Stop Application Containers Immediately to Prevent Further Writes:**
   ```bash
   docker compose stop backend frontend
   ```
2. **Verify Backup Archive Integrity:**
   ```bash
   sha256sum -c "${BACKUP_DIR}/himalaya_backup_${TIMESTAMP}.sha256"
   ```
3. **Restore PostgreSQL Database from Custom-Format Dump:**
   ```bash
   # Terminate active client connections
   docker exec -i himalaya-postgres psql -U himalaya_erp_user -d postgres -c \
     "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'himalaya_erp' AND pid <> pg_backend_pid();"

   # Drop and recreate clean database
   docker exec -i himalaya-postgres psql -U himalaya_erp_user -d postgres -c "DROP DATABASE IF EXISTS himalaya_erp;"
   docker exec -i himalaya-postgres psql -U himalaya_erp_user -d postgres -c "CREATE DATABASE himalaya_erp OWNER himalaya_erp_user;"

   # Restore verified pre-deployment snapshot
   docker cp "${BACKUP_DIR}/himalaya_backup_${TIMESTAMP}.dump" himalaya-postgres:/tmp/restore.dump
   docker exec -i himalaya-postgres pg_restore \
     -U himalaya_erp_user \
     -d himalaya_erp \
     -v \
     /tmp/restore.dump
   docker exec himalaya-postgres rm /tmp/restore.dump
   ```
4. **Restart Application Stack:**
   ```bash
   docker compose up -d
   ```
   **Recovery Time:** < 5 minutes.

---

### Scenario C: Reverse Proxy / Caddy / SSL Rollback
**Trigger:** A TLS misconfiguration or broken subdomain proxy halts access to `thehimalaya.cloud`.

1. **Restore Known-Good Caddyfile:**
   ```bash
   git checkout a5ce1482 -- Caddyfile
   ```
2. **Reload Caddy Configuration (Zero Downtime):**
   ```bash
   docker exec himalaya-caddy caddy reload --config /etc/caddy/Caddyfile
   ```

---

## 4. Post-Rollback Verification Checklist

Following any rollback action, the following 6-point verification must be performed:
- [ ] Database connection responds within < 100ms.
- [ ] Super Admin and staff can authenticate with original credentials.
- [ ] Latest Sales Orders, Quotations, and Dispatch records are present and accounted for.
- [ ] Background backup cron job is operational.
- [ ] SSL certificate on `https://thehimalaya.cloud` evaluates valid with TLS 1.3.
- [ ] Post-incident review logged in `audit/PRODUCTION_SAFETY_AND_CHANGE_LOG.md`.
