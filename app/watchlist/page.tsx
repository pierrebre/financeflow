'use client';

import { getCoinsWatchlist } from '@/src/actions/external/crypto';
import useFavoritesManager from '@/src/hooks/use-favorites';
import { useQuery } from '@tanstack/react-query';
import { WatchlistView } from '@/src/components/watchlist/watchlist-view';

export default function Watchlist() {
	const { favorites, toggleFavorite } = useFavoritesManager();

	const { data: coinsWatchlist = [], isError, isLoading } = useQuery({
		queryKey: ['coinsWatchlist', favorites],
		queryFn: () => getCoinsWatchlist(favorites),
		enabled: favorites.length > 0,
		refetchInterval: 60_000
	});

	return (
		<main className="min-h-screen py-6">
			<h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight mb-6">Watchlist</h1>
			<WatchlistView
				coins={coinsWatchlist}
				favorites={favorites}
				toggleFavorite={toggleFavorite}
				isLoading={isLoading && favorites.length > 0}
				isError={isError}
			/>
		</main>
	);
}
