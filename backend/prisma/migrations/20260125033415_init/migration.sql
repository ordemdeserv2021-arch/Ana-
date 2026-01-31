-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR', 'USER');

-- CreateEnum
CREATE TYPE "CondominiumType" AS ENUM ('CONDOMINIUM', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED');

-- CreateEnum
CREATE TYPE "ResidentType" AS ENUM ('RESIDENT', 'EMPLOYEE', 'PROVIDER', 'TENANT');

-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('CARD', 'BIOMETRIC', 'FACIAL', 'QR_CODE', 'PIN', 'APP');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ONLINE', 'OFFLINE', 'ERROR', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "VisitorStatus" AS ENUM ('PENDING', 'APPROVED', 'INSIDE', 'LEFT', 'DENIED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AccessType" AS ENUM ('GRANTED', 'DENIED', 'EXIT', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "AccessMethod" AS ENUM ('CARD', 'BIOMETRIC', 'FACIAL', 'QR_CODE', 'PIN', 'APP', 'MANUAL', 'REMOTE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "phone" TEXT,
    "avatar" TEXT,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condominiums" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" "CondominiumType" NOT NULL DEFAULT 'CONDOMINIUM',
    "phone" TEXT,
    "email" TEXT,
    "cnpj" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "condominiums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "unit" TEXT,
    "block" TEXT,
    "type" "ResidentType" NOT NULL DEFAULT 'RESIDENT',
    "photo" TEXT,
    "notes" TEXT,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "blockedReason" TEXT,
    "blockedAt" TIMESTAMP(3),
    "condominiumId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "residents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credentials" (
    "id" TEXT NOT NULL,
    "type" "CredentialType" NOT NULL,
    "value" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "validUntil" TIMESTAMP(3),
    "residentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 80,
    "model" TEXT NOT NULL,
    "serialNumber" TEXT,
    "location" TEXT,
    "description" TEXT,
    "status" "DeviceStatus" NOT NULL DEFAULT 'OFFLINE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastSync" TIMESTAMP(3),
    "lastPing" TIMESTAMP(3),
    "condominiumId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "phone" TEXT,
    "photo" TEXT,
    "vehicle" TEXT,
    "vehiclePlate" TEXT,
    "reason" TEXT,
    "expectedDate" TIMESTAMP(3),
    "notes" TEXT,
    "status" "VisitorStatus" NOT NULL DEFAULT 'PENDING',
    "checkInAt" TIMESTAMP(3),
    "checkInBy" TEXT,
    "checkOutAt" TIMESTAMP(3),
    "checkOutBy" TEXT,
    "registeredBy" TEXT,
    "condominiumId" TEXT NOT NULL,
    "visitingResidentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_logs" (
    "id" TEXT NOT NULL,
    "type" "AccessType" NOT NULL,
    "method" "AccessMethod" NOT NULL,
    "notes" TEXT,
    "grantedBy" TEXT,
    "deniedBy" TEXT,
    "residentId" TEXT,
    "visitorId" TEXT,
    "deviceId" TEXT,
    "condominiumId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "access_logs_condominiumId_createdAt_idx" ON "access_logs"("condominiumId", "createdAt");

-- CreateIndex
CREATE INDEX "access_logs_residentId_createdAt_idx" ON "access_logs"("residentId", "createdAt");

-- AddForeignKey
ALTER TABLE "condominiums" ADD CONSTRAINT "condominiums_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residents" ADD CONSTRAINT "residents_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "condominiums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "condominiums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "condominiums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_visitingResidentId_fkey" FOREIGN KEY ("visitingResidentId") REFERENCES "residents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "condominiums"("id") ON DELETE CASCADE ON UPDATE CASCADE;
