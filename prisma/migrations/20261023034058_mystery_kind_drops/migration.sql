-- AlterEnum
ALTER TYPE "LinkTopic" ADD VALUE 'DROP';

-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "dropNumber" INTEGER,
ADD COLUMN     "dropSelf" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "followUpOfId" TEXT,
ADD COLUMN     "held" TEXT,
ADD COLUMN     "reactedAt" TIMESTAMP(3),
ADD COLUMN     "reaction" INTEGER,
ADD COLUMN     "receiptCode" TEXT,
ADD COLUMN     "releasedAt" TIMESTAMP(3),
ADD COLUMN     "senderHint" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allowGuess" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allowHints" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cloudPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "hiddenWords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "kindMode" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "pinnedBadges" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "receiptReactions" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "streakSaves" INTEGER NOT NULL DEFAULT 2;

-- CreateTable
CREATE TABLE "Guess" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "guesserId" TEXT NOT NULL,
    "guessedUserId" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "resolveAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreakSave" (
    "userId" TEXT NOT NULL,
    "dropNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreakSave_pkey" PRIMARY KEY ("userId","dropNumber")
);

-- CreateIndex
CREATE INDEX "Guess_messageId_idx" ON "Guess"("messageId");

-- CreateIndex
CREATE INDEX "Guess_guessedUserId_status_idx" ON "Guess"("guessedUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Message_receiptCode_key" ON "Message"("receiptCode");

-- AddForeignKey
ALTER TABLE "Guess" ADD CONSTRAINT "Guess_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guess" ADD CONSTRAINT "Guess_guesserId_fkey" FOREIGN KEY ("guesserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreakSave" ADD CONSTRAINT "StreakSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

