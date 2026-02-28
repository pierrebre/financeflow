'use server';

import { unstable_cache } from 'next/cache';
import { Coin, DataPrice } from '@/src/schemas/';
import { format } from 'date-fns';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = 'https://api.coingecko.com/api/v3';

function buildHeaders(): Record<string, string> {
	const headers: Record<string, string> = { Accept: 'application/json' };
	const key = process.env.COINGECKO_API_KEY;
	if (key) headers['x-cg-demo-api-key'] = key;
	return headers;
}

// ---------------------------------------------------------------------------
// Core fetch helper — one AbortController per attempt + 429 handling
// ---------------------------------------------------------------------------

const fetchWithConfig = async (url: string, retries = 3, baseTimeout = 10_000): Promise<unknown> => {
	let lastError: Error = new Error('Unknown error');

	for (let attempt = 1; attempt <= retries; attempt++) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), baseTimeout);

		try {
			const response = await fetch(url, {
				signal: controller.signal,
				headers: buildHeaders(),
				// Next.js cache: revalidate every 60 s at the infrastructure level
				next: { revalidate: 60 }
			});
			clearTimeout(timeoutId);

			// Handle rate-limiting — respect Retry-After header
			if (response.status === 429) {
				const retryAfter = parseInt(response.headers.get('Retry-After') ?? '10', 10);
				const waitMs = (Number.isFinite(retryAfter) ? retryAfter : 10) * 1000;
				if (attempt < retries) {
					await new Promise((r) => setTimeout(r, waitMs));
					continue;
				}
				throw new Error(`Rate limited by CoinGecko API (429). Retry after ${retryAfter}s.`);
			}

			if (!response.ok) {
				const text = await response.text().catch(() => response.statusText);
				throw new Error(`CoinGecko API ${response.status}: ${text}`);
			}

			return await response.json();
		} catch (err) {
			clearTimeout(timeoutId);
			lastError = err instanceof Error ? err : new Error(String(err));

			// Abort errors mean the request timed out — retry immediately
			if (lastError.name === 'AbortError') {
				if (attempt < retries) continue;
				throw new Error(`CoinGecko request timed out after ${baseTimeout}ms`);
			}

			// Other errors: exponential backoff before retry
			if (attempt < retries) {
				await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)));
			}
		}
	}

	throw lastError;
};

// ---------------------------------------------------------------------------
// Application-level cache using Next.js unstable_cache (server-side KV)
// TTL matches the React Query staleTime on the client.
// ---------------------------------------------------------------------------

const MARKET_REVALIDATE = 60; // seconds

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/** Top N coins by market cap, with 1h/7d/30d/1y % change */
export const fetchCryptos = unstable_cache(
	async ({ pageParam = 1 }: { pageParam?: number }): Promise<Coin[]> => {
		const url =
			`${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc` +
			`&per_page=20&page=${pageParam}&sparkline=false&price_change_percentage=1h,7d,30d,1y`;
		const data = await fetchWithConfig(url);
		return data as Coin[];
	},
	['fetchCryptos'],
	{ revalidate: MARKET_REVALIDATE }
);

/** Alias kept for backward compatibility (price ticker etc.) */
export const fetchCryptoMarketData = (pageParam: number = 1) => fetchCryptos({ pageParam });

/** Detailed data for a single coin */
export const getCoinData = unstable_cache(
	async (coinId: string): Promise<Coin> => {
		if (!coinId?.trim()) throw new Error('Coin ID is required');
		const url = `${BASE_URL}/coins/${coinId}`;
		const data = (await fetchWithConfig(url)) as Record<string, unknown>;

		if (!data?.id) throw new Error('Invalid coin data received');

		const md = data.market_data as Record<string, Record<string, number>>;

		return {
			id: data.id as string,
			name: data.name as string,
			symbol: data.symbol as string,
			image: (data.image as Record<string, string>).small,
			current_price: md.current_price.usd,
			market_cap: md.market_cap.usd,
			market_cap_rank: data.market_cap_rank as number,
			fully_diluted_valuation: md.fully_diluted_valuation?.usd ?? 0,
			total_volume: md.total_volume.usd,
			high_24h: md.high_24h.usd,
			low_24h: md.low_24h.usd,
			price_change_24h: data.market_data ? (md as unknown as { price_change_24h: number }).price_change_24h : 0,
			price_change_percentage_24h: md.price_change_percentage_24h as unknown as number,
			market_cap_change_24h: data.market_data ? (md as unknown as { market_cap_change_24h: number }).market_cap_change_24h : 0,
			market_cap_change_percentage_24h: md.market_cap_change_percentage_24h as unknown as number,
			circulating_supply: md.circulating_supply as unknown as number,
			total_supply: md.total_supply as unknown as number,
			max_supply: md.max_supply as unknown as number | null,
			ath: md.ath.usd,
			ath_change_percentage: md.ath_change_percentage.usd,
			ath_date: (md.ath_date as unknown as Record<string, string>).usd,
			atl: md.atl.usd,
			atl_change_percentage: md.atl_change_percentage.usd,
			atl_date: (md.atl_date as unknown as Record<string, string>).usd,
			roi: null,
			last_updated: data.last_updated as string,
			price_change_percentage_1h_in_currency: md.price_change_percentage_1h_in_currency?.usd ?? 0,
			price_change_percentage_7d: (md.price_change_percentage_7d as unknown as number) ?? 0,
			price_change_percentage_30d: (md.price_change_percentage_30d as unknown as number) ?? 0,
			price_change_percentage_1y: (md.price_change_percentage_1y as unknown as number) ?? 0
		};
	},
	['getCoinData'],
	{ revalidate: MARKET_REVALIDATE }
);

/** Price history for a coin */
export const getPriceHistory = unstable_cache(
	async (coinId: string, interval: string): Promise<DataPrice[]> => {
		if (!coinId?.trim()) throw new Error('Coin ID is required');
		if (!interval?.trim()) throw new Error('Interval is required');

		const url = `${BASE_URL}/coins/${coinId}/market_chart?days=${interval}&vs_currency=usd`;
		const data = (await fetchWithConfig(url)) as { prices: [number, number][] };

		if (!data?.prices?.length) throw new Error('No price history data available');

		const formatTime = (ts: number): string => {
			const date = new Date(ts);
			return interval === '1' ? format(date, 'HH:mm') : format(date, 'dd/MM/yyyy');
		};

		return data.prices.map(([timestamp, price]) => ({
			month: formatTime(timestamp),
			price: Number(price.toFixed(2))
		}));
	},
	['getPriceHistory'],
	{ revalidate: MARKET_REVALIDATE }
);

/** Coins for watchlist / portfolio by ID list */
export const getCoinsWatchlist = unstable_cache(
	async (coinsId: string[]): Promise<Coin[]> => {
		if (!Array.isArray(coinsId)) throw new Error('Coins ID must be an array');
		if (coinsId.length === 0) return [];

		const url =
			`${BASE_URL}/coins/markets?vs_currency=usd&ids=${coinsId.join(',')}` +
			`&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=1h,7d,30d,1y`;
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
	['getCoinsWatchlist'],
	{ revalidate: MARKET_REVALIDATE }
);

/** Kept for backward compat */
export const fetchCoinDetails = async (coinId: string) => {
	try {
		return await fetchWithConfig(`${BASE_URL}/coins/${coinId}`);
	} catch {
		return null;
	}
};
