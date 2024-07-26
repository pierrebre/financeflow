'use client';

import useLocalStorage from '@/lib/hooks/useLocalStorage';

export default function Watchlist() {
	const [favorites] = useLocalStorage<string[]>('noLoginWatchlistIds', []);

	return (
		<main className="">
			<div>
				<h1>Watchlist</h1>
				{favorites.length > 0 ? favorites.map((id: string) => <div key={id}>{id}</div>) : <p>No items in your watchlist.</p>}
			</div>
		</main>
	);
}
