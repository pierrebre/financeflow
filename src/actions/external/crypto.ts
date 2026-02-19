'use server';

import { Coin, DataPrice } from '@/src/schemas/';
import { format } from 'date-fns';

interface ApiError extends Error {
	status?: number;
	details?: string;
}

const fetchWithConfig = async (url: string, retries = 2, timeout = 10000) => {
	const controller = new AbortController();

	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			const timeoutId = setTimeout(() => controller.abort(), timeout);
			const response = await fetch(url, {
				signal: controller.signal,
				headers: { Accept: 'application/json' }
			});
			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`API request failed with status ${response.status}: ${errorText}`) as ApiError;
			}

			return await response.json();
		} catch (error) {
			if (attempt === retries) {
				const apiError = error instanceof Error ? error : new Error('Unknown fetch error');
				(apiError as ApiError).status = attempt;
				throw apiError;
			}
			await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
		}
	}
};

const withErrorHandling = async <T>(fn: () => Promise<T>, context: Record<string, unknown>, defaultValue?: T): Promise<T> => {
	try {
		return await fn();
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error(`API Error`, {
			...context,
			error: errorMessage,
			timestamp: new Date().toISOString()
		});
		if (defaultValue !== undefined) return defaultValue;
		throw new Error(`${context.action || 'Operation'} failed: ${errorMessage}`);
	}
};

export const fetchCryptoMarketData = async (pageParam: number = 1) => {
	return withErrorHandling(
		async () => {
			const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=${pageParam}&sparkline=false&price_change_percentage=1h`;
			return await fetchWithConfig(url);
		},
		{ action: 'fetchCryptoMarketData', page: pageParam }
	);
};

export const fetchCoinDetails = async (coinId: string) => {
	return withErrorHandling(
		async () => {
			if (!coinId?.trim()) throw new Error('Coin ID is required');
			const url = `https://api.coingecko.com/api/v3/coins/${coinId}`;
			return await fetchWithConfig(url);
		},
		{ action: 'fetchCoinDetails', coinId },
		null
	);
};

export const fetchCryptos = async ({ pageParam = 1 }: { pageParam?: number }): Promise<Coin[]> => {
	return withErrorHandling(
		async () => {
			const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=${pageParam}&sparkline=false&price_change_percentage=1h`;
			const data = await fetchWithConfig(url);
			return data as Coin[];
		},
		{ action: 'fetchCryptos', page: pageParam }
	);
};

export const getCoinData = async (coinId: string): Promise<Coin> => {
	return withErrorHandling(
		async () => {
			if (!coinId?.trim()) throw new Error('Coin ID is required');
			const url = `https://api.coingecko.com/api/v3/coins/${coinId}`;
			const data = await fetchWithConfig(url);

			if (!data?.id) throw new Error('Invalid coin data received');

			return {
				id: data.id,
				name: data.name,
				symbol: data.symbol,
				image: data.image.small,
				current_price: data.market_data.current_price.usd,
				market_cap: data.market_data.market_cap.usd,
				market_cap_rank: data.market_cap_rank,
				fully_diluted_valuation: data.market_data.fully_diluted_valuation?.usd || 0,
				total_volume: data.market_data.total_volume.usd,
				high_24h: data.market_data.high_24h.usd,
				low_24h: data.market_data.low_24h.usd,
				price_change_24h: data.market_data.price_change_24h,
				price_change_percentage_24h: data.market_data.price_change_percentage_24h,
				market_cap_change_24h: data.market_data.market_cap_change_24h,
				market_cap_change_percentage_24h: data.market_data.market_cap_change_percentage_24h,
				circulating_supply: data.market_data.circulating_supply,
				total_supply: data.market_data.total_supply,
				max_supply: data.market_data.max_supply,
				ath: data.market_data.ath.usd,
				ath_change_percentage: data.market_data.ath_change_percentage.usd,
				ath_date: data.market_data.ath_date.usd,
				atl: data.market_data.atl.usd,
				atl_change_percentage: data.market_data.atl_change_percentage.usd,
				atl_date: data.market_data.atl_date.usd,
				roi: null,
				last_updated: data.last_updated,
				price_change_percentage_1h_in_currency: data.market_data.price_change_percentage_1h_in_currency?.usd,
				price_change_percentage_7d: data.market_data.price_change_percentage_7d,
				price_change_percentage_30d: data.market_data.price_change_percentage_30d,
				price_change_percentage_1y: data.market_data.price_change_percentage_1y
			};
		},
		{ action: 'getCoinData', coinId }
	);
};

export const getPriceHistory = async (coinId: string, interval: string): Promise<DataPrice[]> => {
	return withErrorHandling(
		async () => {
			if (!coinId?.trim()) throw new Error('Coin ID is required');
			if (!interval?.trim()) throw new Error('Interval is required');

			const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?days=${interval}&vs_currency=usd`;
			const data = await fetchWithConfig(url);

			if (!data?.prices?.length) throw new Error('No price history data available');

			const formatTime = (timestamp: number): string => {
				const date = new Date(timestamp);
				switch (interval) {
					case '1':
						return format(date, 'HH:mm');
					case '7':
					case '30':
					case '365':
						return format(date, 'dd/MM/yyyy');
					default:
						return format(date, 'dd/MM/yyyy');
				}
			};

			return data.prices.map(([timestamp, price]: [number, number]) => ({
				month: formatTime(timestamp),
				price: Number(price.toFixed(2))
			}));
		},
		{ action: 'getPriceHistory', coinId, interval }
	);
};

export const getCoinsWatchlist = async (coinsId: string[]): Promise<Coin[]> => {
	return withErrorHandling(
		async () => {
			if (!Array.isArray(coinsId)) throw new Error('Coins ID must be an array');
			if (coinsId.length === 0) return [];

			const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinsId.join(',')}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=1h`;
			const data = await fetchWithConfig(url);

			return (data as Coin[]).map((coin) => ({
				id: coin.id,
				name: coin.name,
				symbol: coin.symbol,
				image: coin.image,
				current_price: coin.current_price,
				market_cap: coin.market_cap,
				market_cap_rank: coin.market_cap_rank,
				fully_diluted_valuation: coin.fully_diluted_valuation,
				total_volume: coin.total_volume,
				high_24h: coin.high_24h,
				low_24h: coin.low_24h,
				price_change_24h: coin.price_change_24h,
				price_change_percentage_24h: coin.price_change_percentage_24h,
				market_cap_change_24h: coin.market_cap_change_24h,
				market_cap_change_percentage_24h: coin.market_cap_change_percentage_24h,
				circulating_supply: coin.circulating_supply,
				total_supply: coin.total_supply,
				max_supply: coin.max_supply,
				ath: coin.ath,
				ath_change_percentage: coin.ath_change_percentage,
				ath_date: coin.ath_date,
				atl: coin.atl,
				atl_change_percentage: coin.atl_change_percentage,
				atl_date: coin.atl_date,
				roi: coin.roi,
				last_updated: coin.last_updated,
				price_change_percentage_1h_in_currency: coin.price_change_percentage_1h_in_currency ?? 0,
				price_change_percentage_7d: coin.price_change_percentage_7d ?? 0,
				price_change_percentage_30d: coin.price_change_percentage_30d ?? 0,
				price_change_percentage_1y: coin.price_change_percentage_1y ?? 0
			}));
		},
		{ action: 'getCoinsWatchlist', coinsCount: coinsId.length }
	);
};
