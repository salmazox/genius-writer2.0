-- AlterTable
ALTER TABLE "User" ADD COLUMN     "street" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3);
