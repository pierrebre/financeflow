import { Coin } from '@/types/Coin';
import { columns } from '../components/dataTable/columns';
import { DataTable } from '../components/dataTable/data-table';

export default async function Home() {
	const crypto = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=1h');
	const cryptoData: Coin[] = await crypto.json();

	return (
		<main className="flex flex-col items-center ">
			<div className="w-full">
				<DataTable columns={columns} data={cryptoData} />
			</div>
		</main>
	);
}
