-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('LIVE', 'CLOSED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "accent" TEXT NOT NULL DEFAULT '#e0115f',
    "hostId" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "status" "RoomStatus" NOT NULL DEFAULT 'LIVE',
    "takesAllowed" BOOLEAN NOT NULL DEFAULT true,
    "voiceAllowed" BOOLEAN NOT NULL DEFAULT true,
    "takesOn" BOOLEAN NOT NULL DEFAULT true,
    "voiceOn" BOOLEAN NOT NULL DEFAULT true,
    "maxVoiceSec" INTEGER NOT NULL DEFAULT 180,
    "hostReadyAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomPost" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "style" TEXT NOT NULL DEFAULT 'clip',
    "audioUrl" TEXT,
    "audioSec" INTEGER,
    "peaks" JSONB,
    "voice" TEXT,
    "take" TEXT,
    "takeAudioUrl" TEXT,
    "takeAudioSec" INTEGER,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "messageId" TEXT,
    "s0" INTEGER NOT NULL DEFAULT 0,
    "s1" INTEGER NOT NULL DEFAULT 0,
    "s2" INTEGER NOT NULL DEFAULT 0,
    "s3" INTEGER NOT NULL DEFAULT 0,
    "reports" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomStamp" (
    "postId" TEXT NOT NULL,
    "who" TEXT NOT NULL,
    "stamp" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomStamp_pkey" PRIMARY KEY ("postId","who","stamp")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_handle_key" ON "Room"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "Room_hostId_key" ON "Room"("hostId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_linkId_key" ON "Room"("linkId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomPost_messageId_key" ON "RoomPost"("messageId");

-- CreateIndex
CREATE INDEX "RoomPost_roomId_deletedAt_createdAt_idx" ON "RoomPost"("roomId", "deletedAt", "createdAt");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomPost" ADD CONSTRAINT "RoomPost_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomStamp" ADD CONSTRAINT "RoomStamp_postId_fkey" FOREIGN KEY ("postId") REFERENCES "RoomPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
