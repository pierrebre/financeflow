import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock next/cache before importing the module
vi.mock('next/cache', () => ({
	unstable_cache: (fn: (...args: unknown[]) => unknown) => fn
}));

// Import after mock is set up
import { fetchCryptos, getCoinsWatchlist } from '@/src/actions/external/crypto';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMockCoin(overrides: Partial<Record<string, unknown>> = {}) {
	return {
		id: 'bitcoin',
		symbol: 'btc',
		name: 'Bitcoin',
		image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
		current_price: 65000,
		market_cap: 1_200_000_000_000,
		market_cap_rank: 1,
		fully_diluted_valuation: 1_300_000_000_000,
		total_volume: 30_000_000_000,
		high_24h: 66000,
		low_24h: 64000,
		price_change_24h: 500,
		price_change_percentage_24h: 0.78,
		market_cap_change_24h: 10_000_000_000,
		market_cap_change_percentage_24h: 0.84,
		circulating_supply: 19_000_000,
		total_supply: 21_000_000,
		max_supply: 21_000_000,
		ath: 69000,
		ath_change_percentage: -5.8,
		ath_date: '2021-11-10T14:24:11.849Z',
		atl: 67.81,
		atl_change_percentage: 95750,
		atl_date: '2013-07-06T00:00:00.000Z',
		roi: null,
		last_updated: '2024-01-01T00:00:00.000Z',
		price_change_percentage_1h_in_currency: 0.12,
		price_change_percentage_7d: 3.5,
		price_change_percentage_30d: 12.4,
		price_change_percentage_1y: 150.2,
		...overrides
	};
}

// ---------------------------------------------------------------------------
// fetchCryptos
// ---------------------------------------------------------------------------
describe('fetchCryptos()', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('returns parsed coin array on success', async () => {
		const mockData = [makeMockCoin(), makeMockCoin({ id: 'ethereum', name: 'Ethereum', symbol: 'eth' })];

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
			headers: new Headers()
		} as Response);

		const result = await fetchCryptos({ pageParam: 1 });
		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(2);
		expect(result[0].id).toBe('bitcoin');
		expect(result[1].id).toBe('ethereum');
	});

	it('uses page 1 by default', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => [],
			headers: new Headers()
		} as Response);

		await fetchCryptos({});

		const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
		expect(calledUrl).toContain('page=1');
	});

	it('includes the correct per_page parameter', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => [],
			headers: new Headers()
		} as Response);

		await fetchCryptos({ pageParam: 2 });

		const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
		expect(calledUrl).toContain('per_page=20');
		expect(calledUrl).toContain('page=2');
	});

	it('throws on API error response', async () => {
		vi.mocked(fetch).mockResolvedValue({
			ok: false,
			status: 500,
			statusText: 'Internal Server Error',
			text: async () => 'Internal Server Error',
			headers: new Headers()
		} as Response);

		await expect(fetchCryptos({ pageParam: 1 })).rejects.toThrow();
	});

	it('retries on network failure and eventually throws', async () => {
		vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

		await expect(fetchCryptos({ pageParam: 1 })).rejects.toThrow('Network error');
		// Should have retried 3 times
		expect(vi.mocked(fetch)).toHaveBeenCalledTimes(3);
	}, 15000);

	it('handles 429 rate limit and retries', async () => {
		// First call: 429, second call: success
		vi.mocked(fetch)
			.mockResolvedValueOnce({
				ok: false,
				status: 429,
				headers: new Headers({ 'Retry-After': '1' }),
				text: async () => 'Rate limited'
			} as Response)
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => [makeMockCoin()],
				headers: new Headers()
			} as Response);

		const result = await fetchCryptos({ pageParam: 1 });
		expect(result).toHaveLength(1);
		expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
	}, 10000);
});

// ---------------------------------------------------------------------------
// getCoinsWatchlist
// ---------------------------------------------------------------------------
describe('getCoinsWatchlist()', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('returns empty array when given empty list', async () => {
		const result = await getCoinsWatchlist([]);
		expect(result).toEqual([]);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('joins coin IDs in the URL', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => [makeMockCoin()],
			headers: new Headers()
		} as Response);

		await getCoinsWatchlist(['bitcoin', 'ethereum']);

		const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
		// URL uses raw commas — both coin IDs should appear in the URL
		expect(calledUrl).toMatch(/ids=bitcoin/);
		expect(calledUrl).toMatch(/ethereum/);
	});

	it('maps null price_change fields to 0', async () => {
		const coinWithNullFields = makeMockCoin({
			price_change_percentage_1h_in_currency: null,
			price_change_percentage_7d: null,
			price_change_percentage_30d: null,
			price_change_percentage_1y: null
		});

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => [coinWithNullFields],
			headers: new Headers()
		} as Response);

		const result = await getCoinsWatchlist(['bitcoin']);
		expect(result[0].price_change_percentage_1h_in_currency).toBe(0);
		expect(result[0].price_change_percentage_7d).toBe(0);
	});

	it('throws on invalid input type', async () => {
		await expect(getCoinsWatchlist(null as unknown as string[])).rejects.toThrow('Coins ID must be an array');
	});
});
