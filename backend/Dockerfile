# ==============================================================================
# HIMALAYA ERP — BACKEND DOCKERFILE (NestJS + Prisma ORM 5.x)
# ==============================================================================

# ── Stage 1: Build Dependencies & Compile NestJS ─────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma engine compatibility
RUN apk add --no-cache openssl ca-certificates

# Copy package manifests
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies needed for build & Prisma)
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy application source code
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# Build NestJS production bundle to dist/
RUN npm run build

# Prune devDependencies for lean runtime
RUN npm prune --production


# ── Stage 2: Production Execution Image ──────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install OpenSSL and curl for runtime Prisma engine and container health check
RUN apk add --no-cache openssl ca-certificates curl

ENV NODE_ENV=production
ENV PORT=4000

# Create non-root system user and group
RUN addgroup -S nestjs && adduser -S nestjs -G nestjs

# Create uploads directory and assign permissions
RUN mkdir -p /app/uploads && chown -R nestjs:nestjs /app/uploads

# Copy node_modules, generated Prisma client, and built dist from builder
COPY --from=builder --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nestjs /app/dist ./dist
COPY --from=builder --chown=nestjs:nestjs /app/dist-seed ./dist-seed
COPY --from=builder --chown=nestjs:nestjs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nestjs /app/package.json ./package.json

USER nestjs

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://127.0.0.1:4000/api/v1/health/readiness || exit 1

CMD ["node", "dist/main.js"]
