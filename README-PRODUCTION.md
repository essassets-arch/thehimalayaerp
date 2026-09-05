# Himalaya ERP — Production Operations & Security Manual

This document is the senior DevOps/SRE operations guide for managing the production **Himalaya ERP** platform, PostgreSQL database UI, container management tool, log viewer, automated database backups, and reverse proxy infrastructure.

---

## 1. System Architecture Diagram

```
                             ┌───────────────────────────────────┐
                             │       Internet / Clients          │
                             └─────────────────┬─────────────────┘
                                               │
                                      HTTPS (80 / 443)
                                               │
                    ┌──────────────────────────▼──────────────────────────┐
                    │     Reverse Proxy (Caddy / Host Nginx)              │
                    └──────┬───────────────┬───────────────┬──────────────┘
                           │               │               │
  https://thehimalaya.cloud│               │               │https://logs.thehimalaya.cloud
                           │               │               │
    ┌──────────────────────▼┐  ┌───────────▼───────────┐  ┌▼────────────────────────┐
    │ Frontend (Next.js)    │  │ pgAdmin 4 UI          │  │ Dozzle Log Viewer      │
    │ Container :3000       │  │ Container :5050       │  │ Container :8080        │
    └──────────┬────────────┘  └───────────┬───────────┘  └───────────┬────────────┘
               │ Internal Bridge           │                          │ Read-only
               │ /api/backend/*            │ Internal DB Auth         │ /var/run/docker.sock
    ┌──────────▼────────────┐              │                          │
    │ Backend (NestJS)      │              │                          │
    │ Container :4000/api/v1│              │                          │
    └──────────┬────────────┘              │                          │
               │                           │                          │
               └─────────────┬─────────────┘                          │
                             │ Internal PostgreSQL Protocol           │
                    ┌────────▼────────┐                               │
                    │ PostgreSQL 16   │                               │
                    │ Container :5432 │                               │
                    └─────────────────┘                               │
                                                                      │
  https://portainer.thehimalaya.cloud                                 │
    ┌─────────────────────────────────────────────────────────────────▼──────────┐
    │ Portainer CE Container Management UI (:9000)                              │
    └────────────────────────────────────────────────────────────────────────────┘

    ======================== Internal Network: erp-network ========================
```

---

## 2. Platform Component Matrix

| Service | Container Name | Image | Port (Internal) | Host Port | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL** | `himalaya-postgres` | `postgres:16-alpine` | `5432` | None (Internal) | Core relational database |
| **Backend API** | `himalaya-backend` | Custom NestJS | `4000` | None (Internal) | NestJS business logic |
| **Frontend** | `himalaya-frontend` | Custom Next.js | `3000` | `127.0.0.1:3000` | Next.js UI & API Bridge |
| **pgAdmin 4** | `himalaya-pgadmin` | `dpage/pgadmin4:latest` | `80` | `127.0.0.1:5050` | Database administration UI |
| **Portainer CE**| `himalaya-portainer`| `portainer/portainer-ce:latest` | `9000` | `127.0.0.1:9000` | Docker container management |
| **Dozzle** | `himalaya-dozzle` | `amir20/dozzle:latest` | `8080` | `127.0.0.1:8080` | Real-time container log viewer |
| **Reverse Proxy**| Host Nginx / Caddy| `caddy:2-alpine` / Nginx | `80`, `443` | `80`, `443` | SSL termination & routing |

---

## 3. Initial Setup & Deployment Commands

### 3.1 Environment Configuration
1. Clone repository to `/opt/the_himalaya_erp`:
   ```bash
   cd /opt/the_himalaya_erp
   ```
2. Copy environment template:
   ```bash
   cp .env.docker.example .env
   nano .env
   ```
3. Update management credentials in `.env`:
   - `PGADMIN_DEFAULT_EMAIL=admin@thehimalaya.cloud`
   - `PGADMIN_DEFAULT_PASSWORD=StrongPgAdminPassword123!`
   - `DOZZLE_USERNAME=admin`
   - `DOZZLE_PASSWORD=StrongLogsPassword123!`

---

### 3.2 Deployment Execution Commands

#### Standard Application Stack:
```bash
./scripts/first-vps-deploy.sh
```

#### Launching Core ERP + Management Stack:
```bash
docker compose -f docker-compose.yml -f docker-compose.management.yml up -d
```

---

## 4. Accessing Management & Observability Tools

### 4.1 PostgreSQL Administration UI (pgAdmin 4)
- **URL**: `https://dbadmin.thehimalaya.cloud`
- **Login Credentials**: Use `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` configured in `.env`.
- **Connecting to Database**:
  - **Host name / address**: `postgres` (internal Docker hostname)
  - **Port**: `5432`
  - **Maintenance database**: `himalaya_erp`
  - **Username**: `himalaya_erp_user` (or value of `POSTGRES_USER`)
  - **Password**: Password configured in `POSTGRES_PASSWORD`

---

### 4.2 Docker Container Management (Portainer CE)
- **URL**: `https://portainer.thehimalaya.cloud`
- **First Login**: Set up your initial admin username and strong password when prompted.
- **Capabilities**:
  - View real-time CPU, RAM, and disk utilization per container.
  - Inspect container environment parameters (secret values remain masked).
  - Restart, stop, or view event metrics across `himalaya-backend`, `himalaya-frontend`, `himalaya-postgres`, etc.

---

### 4.3 Container Log Viewer (Dozzle)
- **URL**: `https://logs.thehimalaya.cloud`
- **Authentication**: Simple auth using `dozzle-users.yml` or reverse proxy authentication.
- **Features**:
  - Live log streaming for all 6 containers (`himalaya-backend`, `himalaya-frontend`, `himalaya-postgres`, `himalaya-pgadmin`, `himalaya-portainer`, `himalaya-dozzle`).
  - Real-time text search and log filtering.

---

## 5. Reverse Proxy Configuration Options

### Option A — Host Nginx Configuration (`/etc/nginx/sites-available/thehimalaya.cloud.conf`)
If your VPS uses Host Nginx with Certbot SSL certificates:

```nginx
# 1. Main ERP Application
server {
    listen 443 ssl http2;
    server_name thehimalaya.cloud www.thehimalaya.cloud;

    ssl_certificate /etc/letsencrypt/live/thehimalaya.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thehimalaya.cloud/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 100M;

    # Real-Time WebSocket & Polling Gateway (NestJS Location & Notification Engine)
    location /socket.io/ {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 2. pgAdmin 4 UI
server {
    listen 443 ssl http2;
    server_name dbadmin.thehimalaya.cloud;

    ssl_certificate /etc/letsencrypt/live/thehimalaya.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thehimalaya.cloud/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5050;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Script-Name /;
    }
}

# 3. Portainer CE UI
server {
    listen 443 ssl http2;
    server_name portainer.thehimalaya.cloud;

    ssl_certificate /etc/letsencrypt/live/thehimalaya.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thehimalaya.cloud/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 4. Dozzle Log Viewer
server {
    listen 443 ssl http2;
    server_name logs.thehimalaya.cloud;

    ssl_certificate /etc/letsencrypt/live/thehimalaya.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thehimalaya.cloud/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Reload Nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

### Option B — Caddy Container Configuration (`Caddyfile`)
If using Caddy for automatic HTTPS certificate issuance, view [Caddyfile](file:///d:/prototype-next-main/Caddyfile). All 4 domains (`thehimalaya.cloud`, `dbadmin.thehimalaya.cloud`, `portainer.thehimalaya.cloud`, `logs.thehimalaya.cloud`) are configured out-of-the-box.

---

## 6. Automated Backup & Retention Strategy

### 6.1 Instant Manual Backup
```bash
./scripts/backup-db.sh
```
Output is stored in `./backups/himalaya_erp_backup_YYYYMMDD_HHMMSS.sql.gz`.

### 6.2 Automated Daily Crontab Backup
To set up automated daily database backups at 2:00 AM with a 30-day retention cleanup policy:

Edit crontab:
```bash
crontab -e
```
Add line:
```cron
0 2 * * * /opt/the_himalaya_erp/scripts/backup-db-cron.sh >> /opt/the_himalaya_erp/logs/backup-cron.log 2>&1
```

### 6.3 Database Restoration Procedure
To restore from a backup file:
```bash
./scripts/restore-db.sh ./backups/himalaya_erp_backup_YYYYMMDD_HHMMSS.sql.gz
```

---

## 7. Security Checklist & Production Hardening

- [x] **No Internal Database Ports Exposed**: PostgreSQL port `5432` is bound strictly to `erp-network` and is not exposed to the internet.
- [x] **Management UI Access Control**: pgAdmin, Portainer, and Dozzle require strong authentication credentials.
- [x] **Isolated Docker Networks**: `erp-network` isolates inter-container communication.
- [x] **Read-only Docker Socket Mounts**: Dozzle mounts `/var/run/docker.sock:ro` with read-only privileges.
- [x] **Persistent Named Volumes**: Database data (`postgres_data`), pgAdmin configuration (`pgadmin_data`), Portainer state (`portainer_data`), and user uploads (`backend_uploads`) are preserved across container rebuilds.
- [x] **Log Rotation**: All containers use Docker `json-file` log driver with `max-size: 10m` and `max-file: 5` limits to prevent VPS disk fill-up.
