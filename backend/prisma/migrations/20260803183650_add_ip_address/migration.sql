-- AlterTable
ALTER TABLE "Applicant" ADD COLUMN     "ipAddress" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "ipAddress" TEXT;

-- CreateIndex
CREATE INDEX "Applicant_ipAddress_createdAt_idx" ON "Applicant"("ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_ipAddress_createdAt_idx" ON "Lead"("ipAddress", "createdAt");
