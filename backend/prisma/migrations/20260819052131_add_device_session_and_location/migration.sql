-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('WEB', 'APP');

-- CreateEnum
CREATE TYPE "LocationPermissionState" AS ENUM ('GRANTED', 'DENIED', 'PROMPT', 'UNAVAILABLE', 'UNSUPPORTED');

-- CreateTable
CREATE TABLE "DeviceSession" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "deviceModel" TEXT,
    "operatingSystem" TEXT,
    "browser" TEXT,
    "clientType" "ClientType" NOT NULL DEFAULT 'WEB',
    "locationPermission" "LocationPermissionState" NOT NULL DEFAULT 'PROMPT',
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connectedAt" TIMESTAMP(3),
    "disconnectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LatestUserLocation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceSessionId" TEXT NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "altitude" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "batteryLevel" DOUBLE PRECISION,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LatestUserLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceSession_sessionId_key" ON "DeviceSession"("sessionId");

-- CreateIndex
CREATE INDEX "DeviceSession_companyId_idx" ON "DeviceSession"("companyId");

-- CreateIndex
CREATE INDEX "DeviceSession_companyId_lastSeenAt_idx" ON "DeviceSession"("companyId", "lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceSession_userId_deviceId_key" ON "DeviceSession"("userId", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "LatestUserLocation_deviceSessionId_key" ON "LatestUserLocation"("deviceSessionId");

-- CreateIndex
CREATE INDEX "LatestUserLocation_companyId_idx" ON "LatestUserLocation"("companyId");

-- CreateIndex
CREATE INDEX "LatestUserLocation_companyId_capturedAt_idx" ON "LatestUserLocation"("companyId", "capturedAt");

-- AddForeignKey
ALTER TABLE "DeviceSession" ADD CONSTRAINT "DeviceSession_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceSession" ADD CONSTRAINT "DeviceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LatestUserLocation" ADD CONSTRAINT "LatestUserLocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LatestUserLocation" ADD CONSTRAINT "LatestUserLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LatestUserLocation" ADD CONSTRAINT "LatestUserLocation_deviceSessionId_fkey" FOREIGN KEY ("deviceSessionId") REFERENCES "DeviceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

