'use client';

import { columns } from '@/components/dataTable/columns';
import { DataTable } from '@/components/dataTable/data-table';
import { getCoinsWatchlist } from '@/data/coin';
import useFavoritesManager from '@/lib/hooks/use-favorites';
import { useQuery } from '@tanstack/react-query';

export default function Watchlist() {
	// Utilisation du hook personnalisé pour gérer les favoris
	const { favorites } = useFavoritesManager();

	// Utilisation de React Query pour récupérer les coins de la watchlist
	const {
		data: coinsWatchlist,
		error,
		isLoading
	} = useQuery({
		queryKey: ['coinsWatchlist', favorites],
		queryFn: () => getCoinsWatchlist(favorites),
		enabled: favorites.length > 0
	});

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error fetching watchlist coins.</div>;

	return (
		<main className="min-h-screen">
			<div>
				<h1 className="scroll-m-20 text-xl font-extrabold tracking-tight lg:text-2xl text-center pb-4">Watchlist</h1>
				<DataTable columns={columns} data={coinsWatchlist || []} />
			</div>
		</main>
	);
}
