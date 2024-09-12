-- CreateTable
CREATE TABLE "User" (
    "UserId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("UserId")
);

-- CreateTable
CREATE TABLE "Coin" (
    "CoinId" TEXT NOT NULL,

    CONSTRAINT "Coin_pkey" PRIMARY KEY ("CoinId")
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchlistCoin" (
    "id" TEXT NOT NULL,
    "watchlistId" TEXT NOT NULL,
    "coinId" TEXT NOT NULL,

    CONSTRAINT "WatchlistCoin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_userId_key" ON "Watchlist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistCoin_watchlistId_coinId_key" ON "WatchlistCoin"("watchlistId", "coinId");

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("UserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistCoin" ADD CONSTRAINT "WatchlistCoin_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "Watchlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistCoin" ADD CONSTRAINT "WatchlistCoin_coinId_fkey" FOREIGN KEY ("coinId") REFERENCES "Coin"("CoinId") ON DELETE CASCADE ON UPDATE CASCADE;
