-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mysteryNudgedAt" TIMESTAMP(3),
ADD COLUMN     "senderReceipts" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "allowGuess" SET DEFAULT false,
ALTER COLUMN "allowHints" SET DEFAULT false,
ALTER COLUMN "receiptReactions" SET DEFAULT false;

