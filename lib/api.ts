import type { Coin, DataPrice } from '@/schemas';
import { format } from 'date-fns';

export const fetchCoinData = async (coinId: string): Promise<Coin> => {
	const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
	const data = await response.json();

	return {
		id: data.id,
		name: data.name,
		symbol: data.symbol,
		image: data.image.small,
		current_price: data.market_data.current_price.usd,
		market_cap: data.market_data.market_cap.usd,
		market_cap_rank: data.market_cap_rank,
		fully_diluted_valuation: data.market_data.fully_diluted_valuation || 0,
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
		ath_change_percentage: data.market_data.ath_change_percentage,
		ath_date: data.market_data.ath_date,
		atl: data.market_data.atl.usd,
		atl_change_percentage: data.market_data.atl_change_percentage,
		atl_date: data.market_data.atl_date,
		roi: null,
		last_updated: data.last_updated,
		price_change_percentage_1h_in_currency: data.market_data.price_change_percentage_1h_in_currency,
		price_change_percentage_7d: data.market_data.price_change_percentage_7d,
		price_change_percentage_30d: data.market_data.price_change_percentage_30d,
		price_change_percentage_1y: data.market_data.price_change_percentage_1y
	};
};

export const fetchPriceHistory = async (coinId: string, interval: string): Promise<DataPrice[]> => {
	const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?days=${interval}&vs_currency=usd`);
	const data = await response.json();

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
		price: parseFloat(price.toFixed(2))
	}));
};

export const fetchCoinsWatchlist = async (coinId: string[]): Promise<Coin[]> => {
	if (coinId.length === 0) {
		return [];
	}

	const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=1h`);
	const data = await response.json();

	return data.map((coin: Coin) => ({
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
		last_updated: coin.last_updated
	}));
};
