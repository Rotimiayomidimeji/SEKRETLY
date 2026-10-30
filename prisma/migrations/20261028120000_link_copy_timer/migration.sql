-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "intro" TEXT,
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "timerSetAt" TIMESTAMP(3);

