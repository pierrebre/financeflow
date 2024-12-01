'use client';

import { columns } from '@/components/dataTable/columns';
import { DataTable } from '@/components/dataTable/data-table';
import { getCoinsWatchlist } from '@/data/coin';
import useFavoritesManager from '@/lib/hooks/use-favorites';
import { useQuery } from '@tanstack/react-query';

export default function Watchlist() {
	const { favorites } = useFavoritesManager();

	const {
		data: coinsWatchlist,
		isError,
		isLoading,
	} = useQuery({
		queryKey: ['coinsWatchlist', favorites],
		queryFn: () => getCoinsWatchlist(favorites),
		enabled: favorites.length > 0
	});

	return (
		<main className="min-h-screen">
			<div>
				<h1 className="scroll-m-20 text-xl font-extrabold tracking-tight lg:text-2xl text-center pb-4">Watchlist</h1>
				<DataTable columns={columns} data={coinsWatchlist || []} isLoading={isLoading} isError={isError} />
			</div>
		</main>
	);
}
