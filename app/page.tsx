import { Coin } from "@/types/Coin";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function Home() {
  const crypto = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=1h"
  );
  const cryptoData: Coin[] = await crypto.json();

  return (
    <main className="flex min-h-screen flex-col items-center ">
      <h1>FinanceFlow</h1>
      <div className="mt-10 w-3/4">
      <DataTable columns={columns} data={cryptoData}  />
      </div>
    </main>
  );
}
