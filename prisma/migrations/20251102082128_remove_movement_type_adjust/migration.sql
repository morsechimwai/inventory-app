/*
  Warnings:

  - The values [ADJUST] on the enum `MovementType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MovementType_new" AS ENUM ('IN', 'OUT');
ALTER TABLE "StockMovement" ALTER COLUMN "movementType" TYPE "MovementType_new" USING ("movementType"::text::"MovementType_new");
ALTER TYPE "MovementType" RENAME TO "MovementType_old";
ALTER TYPE "MovementType_new" RENAME TO "MovementType";
DROP TYPE "public"."MovementType_old";
COMMIT;
