import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface FavoriteHookResponse {
	favorites: string[];
	toggleFavorite: (coinId: string) => void;
}

function useFavoritesManager(): FavoriteHookResponse {
	const { status, data: session } = useSession();
	const [favorites, setFavorites] = useState<string[]>([]);

	useEffect(() => {
		const loadFavorites = async () => {
			if (status === 'authenticated') {
				try {
					const response = await fetch('/api/favorites');
					if (!response.ok) throw new Error('Failed to fetch favorites');
					const data = await response.json();
					setFavorites(data);
				} catch (error) {
					console.error('Error fetching favorites from API:', error);
				}
			} else {
				const savedFavorites = JSON.parse(localStorage.getItem('localFavorites') ?? '[]');
				setFavorites(savedFavorites);
			}
		};
		loadFavorites();
	}, [status]);

	const toggleFavorite = useCallback(
		async (coinId: string) => {
			const isFavorite = favorites.includes(coinId);
			const updatedFavorites = isFavorite ? favorites.filter((id) => id !== coinId) : [...favorites, coinId];

			setFavorites(updatedFavorites);
			if (status === 'authenticated') {
				try {
					await fetch('/api/favorites', {
						method: isFavorite ? 'DELETE' : 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ coinId, add: !isFavorite })
					});
				} catch (error) {
					console.error('Error updating favorites on server:', error);
				}
			} else {
				localStorage.setItem('localFavorites', JSON.stringify(updatedFavorites));
			}
		},
		[favorites, status]
	);

	return { favorites, toggleFavorite };
}

export default useFavoritesManager;
