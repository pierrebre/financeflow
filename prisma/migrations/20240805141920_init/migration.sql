-- CreateTable
CREATE TABLE "User" (
    "UserId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("UserId")
);

-- CreateTable
CREATE TABLE "Coin" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "current_price" DOUBLE PRECISION NOT NULL,
    "market_cap" DOUBLE PRECISION NOT NULL,
    "market_cap_rank" INTEGER NOT NULL,
    "fully_diluted_valuation" DOUBLE PRECISION NOT NULL,
    "total_volume" DOUBLE PRECISION NOT NULL,
    "high_24h" DOUBLE PRECISION NOT NULL,
    "low_24h" DOUBLE PRECISION NOT NULL,
    "price_change_24h" DOUBLE PRECISION NOT NULL,
    "price_change_percentage_24h" DOUBLE PRECISION NOT NULL,
    "market_cap_change_24h" DOUBLE PRECISION NOT NULL,
    "market_cap_change_percentage_24h" DOUBLE PRECISION NOT NULL,
    "circulating_supply" DOUBLE PRECISION NOT NULL,
    "total_supply" DOUBLE PRECISION NOT NULL,
    "max_supply" DOUBLE PRECISION,
    "ath" DOUBLE PRECISION NOT NULL,
    "ath_change_percentage" DOUBLE PRECISION NOT NULL,
    "ath_date" TEXT NOT NULL,
    "atl" DOUBLE PRECISION NOT NULL,
    "atl_change_percentage" DOUBLE PRECISION NOT NULL,
    "atl_date" TEXT NOT NULL,
    "roi" JSONB,
    "last_updated" TEXT NOT NULL,
    "price_change_percentage_1h_in_currency" DOUBLE PRECISION NOT NULL,
    "price_change_percentage_7d" DOUBLE PRECISION NOT NULL,
    "price_change_percentage_30d" DOUBLE PRECISION NOT NULL,
    "price_change_percentage_1y" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Coin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coinId" TEXT NOT NULL,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_userId_coinId_key" ON "Watchlist"("userId", "coinId");

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("UserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_coinId_fkey" FOREIGN KEY ("coinId") REFERENCES "Coin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
