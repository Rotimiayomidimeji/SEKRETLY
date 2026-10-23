-- CreateEnum
CREATE TYPE "LinkTopic" AS ENUM ('DESCRIBE', 'QUIZ', 'CONFESS', 'RATE', 'AMA', 'CUSTOM');

-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('LIVE', 'PAUSED', 'DELETED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ageConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "linkKey" TEXT NOT NULL,
ALTER COLUMN "birthDate" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "topic" "LinkTopic" NOT NULL,
    "slug" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "customQuestion" TEXT,
    "maxMessages" INTEGER,
    "closesAt" TIMESTAMP(3),
    "status" "LinkStatus" NOT NULL DEFAULT 'LIVE',
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "options" TEXT[],
    "correctIndex" INTEGER NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "topic" "LinkTopic" NOT NULL,
    "text" TEXT NOT NULL,
    "data" JSONB,
    "mediaUrl" TEXT,
    "senderId" TEXT,
    "senderFingerprint" TEXT NOT NULL,
    "wantsReply" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkDay" (
    "linkId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "messages" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LinkDay_pkey" PRIMARY KEY ("linkId","day")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "fingerprint" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("fingerprint")
);

-- CreateIndex
CREATE INDEX "Link_ownerId_status_idx" ON "Link"("ownerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Link_ownerId_theme_slug_key" ON "Link"("ownerId", "theme", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "QuizQuestion_linkId_position_key" ON "QuizQuestion"("linkId", "position");

-- CreateIndex
CREATE INDEX "Message_recipientId_createdAt_idx" ON "Message"("recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_linkId_createdAt_idx" ON "Message"("linkId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_linkKey_key" ON "User"("linkKey");

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkDay" ADD CONSTRAINT "LinkDay_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

