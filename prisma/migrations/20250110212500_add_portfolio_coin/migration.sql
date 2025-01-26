/*
  Warnings:

  - You are about to drop the column `coinId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `portfolioId` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `portfolioCoinId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_coinId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_portfolioId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "coinId",
DROP COLUMN "portfolioId",
ADD COLUMN     "portfolioCoinId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PortfolioCoin" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "coinId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioCoin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioCoin_portfolioId_coinId_key" ON "PortfolioCoin"("portfolioId", "coinId");

-- AddForeignKey
ALTER TABLE "PortfolioCoin" ADD CONSTRAINT "PortfolioCoin_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioCoin" ADD CONSTRAINT "PortfolioCoin_coinId_fkey" FOREIGN KEY ("coinId") REFERENCES "Coin"("CoinId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_portfolioCoinId_fkey" FOREIGN KEY ("portfolioCoinId") REFERENCES "PortfolioCoin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
