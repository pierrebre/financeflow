import type { Coin, DataPrice } from '@/types/Coin';
import { format } from 'date-fns';

export const fetchCoinData = async (coinId: string): Promise<Coin> => {
	const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
	const data = await response.json();

	return {
		id: data.id,
		name: data.name,
		symbol: data.symbol,
		image: data.image.large,
		current_price: data.market_data.current_price.usd,
		market_cap: data.market_data.market_cap.usd,
		market_cap_rank: data.market_cap_rank,
		price_change_percentage_24h: data.market_data.price_change_percentage_24h
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
