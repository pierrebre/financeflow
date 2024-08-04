'use client';

import { columns } from '@/components/dataTable/columns';
import { DataTable } from '@/components/dataTable/data-table';
import { fetchCoinsWatchlist } from '@/lib/api';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import { useQuery } from '@tanstack/react-query';

export default function Watchlist() {
	const [favorites] = useLocalStorage<string[]>('noLoginWatchlistIds', []);

	const { data: coinsWatchlist } = useQuery({
		queryKey: ['coinsWatchlist', favorites],
		queryFn: () => fetchCoinsWatchlist(favorites)
	});

	return (
		<main className="min-h-screen">
			<div>
				<h1 className="scroll-m-20 text-xl font-extrabold tracking-tight lg:text-2xl text-center pb-4">Watchlist</h1>
				<DataTable columns={columns} data={coinsWatchlist || []} />
			</div>
		</main>
	);
}
