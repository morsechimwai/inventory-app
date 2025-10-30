/*
  Warnings:

  - The `referenceType` column on the `StockMovement` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('PURCHASE', 'SALE', 'RETURN', 'TRANSFER', 'ADJUSTMENT', 'MANUAL');

-- AlterTable
ALTER TABLE "StockMovement" DROP COLUMN "referenceType",
ADD COLUMN     "referenceType" "ReferenceType" NOT NULL DEFAULT 'MANUAL';

-- CreateIndex
CREATE INDEX "StockMovement_referenceType_referenceId_idx" ON "StockMovement"("referenceType", "referenceId");
