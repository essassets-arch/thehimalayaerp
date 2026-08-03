# Himalaya ERP — Production VPS Deployment Guide

This guide provides exact step-by-step instructions for deploying the **Himalaya ERP** system to an **Ubuntu LTS (22.04 or 24.04)** Virtual Private Server (VPS) using Docker, Docker Compose, and Caddy Reverse Proxy.

---

## 1. Prerequisites & Server Setup

### 1.1 Update Ubuntu & Create Non-Root Deploy User
Connect to your VPS via SSH as `root`:
```bash
ssh root@YOUR_VPS_IP
```

Update system packages and create a dedicated deployment user:
```bash
sudo apt update && sudo apt upgrade -y
sudo adduser deploy
sudo usermod -aG sudo deploy
```

Configure SSH Key authentication for the `deploy` user:
```bash
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

Test SSH login in a new terminal:
```bash
ssh deploy@YOUR_VPS_IP
```

---

### 1.2 Install Docker & Docker Compose Plugin
Run the official Docker Engine installation script:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker deploy
```
Log out and log back in as `deploy` to activate group permissions:
```bash
exit
ssh deploy@YOUR_VPS_IP
docker version
docker compose version
```

---

### 1.3 Configure Firewall (UFW)
Allow SSH, HTTP (port 80), and HTTPS (port 443) only. Keep PostgreSQL (5432) and application ports (3000, 4000) **internal**:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

---

## 2. Repository Setup & Environment Configuration

### 2.1 Clone Repository
Create the project root directory `/opt/himalaya-erp`:
```bash
sudo mkdir -p /opt/himalaya-erp
sudo chown deploy:deploy /opt/himalaya-erp
cd /opt/himalaya-erp

git clone https://github.com/essassets-arch/prototype-next-main.git .
```

---

### 2.2 Configure Production Environment Variables
Copy the production template `.env.docker.example` to `.env`:
```bash
cp .env.docker.example .env
nano .env
```

**Required Modifications**:
1. **`POSTGRES_PASSWORD`**: Set a strong random password.
2. **`DATABASE_URL`**: Update the password in `postgresql://himalaya_erp_user:YOUR_PASSWORD@postgres:5432/himalaya_erp?schema=public`.
3. **`JWT_SECRET` & `JWT_REFRESH_SECRET`**: Set long, unique secret keys (e.g. `openssl rand -base64 32`).
4. **`NEXT_PUBLIC_APP_URL` / `APP_URL`**: Set your domain (e.g. `https://erp.example.com`).
5. **`INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD`**: Configure initial Super Admin login credentials.

---

### 2.3 Configure Caddyfile Domain
Edit `Caddyfile` to replace `erp.example.com` with your actual domain or public IP:
```bash
nano Caddyfile
```

---

## 3. Initial Deployment Execution

Make deployment scripts executable:
```bash
chmod +x scripts/*.sh
```

Run the initial deployment script:
```bash
./scripts/first-vps-deploy.sh
```

The script automatically:
1. Builds multi-stage Docker images (`backend` & `frontend`).
2. Starts `himalaya-postgres` and waits for health checks to pass.
3. Executes database migrations via `npx prisma migrate deploy`.
4. Prompts to run the base seed script (`npm run prisma:seed`) to create roles, permissions, and the initial Super Admin account.
5. Starts `backend`, `frontend`, and `reverse-proxy` (Caddy).

---

## 4. Verification & Health Checks

Verify container status:
```bash
docker compose ps
```

All 4 services should report **running (healthy)**:
- `himalaya-postgres`
- `himalaya-backend`
- `himalaya-frontend`
- `himalaya-reverse-proxy`

### Test Health Endpoints:
```bash
# Backend Health
curl http://localhost:4000/api/v1/health

# Frontend Health
curl http://localhost:3000/api/health
```

Access your application at `https://erp.example.com` (or your VPS IP). Log in with the initial admin credentials.

---

## 5. Maintenance & Updates

### 5.1 Quick Application Updates
To pull new code and deploy updates:
```bash
./scripts/deploy-vps.sh
```

### 5.2 Database Backups
To create an instant timestamped PostgreSQL backup:
```bash
./scripts/backup-db.sh
```
Backups are stored in `./backups/himalaya_erp_backup_YYYYMMDD_HHMMSS.sql.gz`.

### 5.3 Database Restores
To restore from a backup file:
```bash
./scripts/restore-db.sh ./backups/himalaya_erp_backup_YYYYMMDD_HHMMSS.sql.gz
```

---

## 6. Useful Commands & Troubleshooting

```bash
# View all container logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# View frontend logs only
docker compose logs -f frontend

# View recent 100 backend logs
docker compose logs --tail=100 backend

# System resource usage
docker stats
```
