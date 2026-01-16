-- AlterTable
ALTER TABLE "Touchpoint" ADD COLUMN "plannedFor" TIMESTAMP(3);
ALTER TABLE "Touchpoint" ADD COLUMN "subject" TEXT;
ALTER TABLE "Touchpoint" ADD COLUMN "content" TEXT;
