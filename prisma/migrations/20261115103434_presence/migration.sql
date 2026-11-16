-- CreateTable
CREATE TABLE "Presence" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "userId" TEXT,
    "ip" TEXT NOT NULL,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "device" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "referrer" TEXT NOT NULL DEFAULT 'Direct',
    "firstPath" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "pages" INTEGER NOT NULL DEFAULT 1,
    "seconds" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Presence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Presence_lastSeenAt_idx" ON "Presence"("lastSeenAt");

-- CreateIndex
CREATE INDEX "Presence_fingerprint_idx" ON "Presence"("fingerprint");

-- CreateIndex
CREATE INDEX "Presence_userId_idx" ON "Presence"("userId");

-- CreateIndex
CREATE INDEX "Presence_ip_idx" ON "Presence"("ip");
