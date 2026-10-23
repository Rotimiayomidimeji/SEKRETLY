-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allowVisitors" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "blurMedia" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "chatTimerDays" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "chatsFrom" TEXT NOT NULL DEFAULT 'everyone',
ADD COLUMN     "gameInvites" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "gameListing" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "inboxTimerDays" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "notifPrefs" JSONB,
ADD COLUMN     "publicProfile" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

