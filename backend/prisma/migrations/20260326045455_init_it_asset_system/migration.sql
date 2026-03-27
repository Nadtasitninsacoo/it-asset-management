-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "BorrowRequest" ADD COLUMN     "actualReturn" TIMESTAMP(3),
ADD COLUMN     "purpose" TEXT;
