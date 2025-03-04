import { z } from 'zod';

export const CoinModel = z.object({
	id: z.string(),
	symbol: z.string(),
	name: z.string(),
	image: z.string(),
	current_price: z.number(),
	market_cap: z.number(),
	market_cap_rank: z.number(),
	fully_diluted_valuation: z.number(),
	total_volume: z.number(),
	high_24h: z.number(),
	low_24h: z.number(),
	price_change_24h: z.number(),
	price_change_percentage_24h: z.number(),
	market_cap_change_24h: z.number(),
	market_cap_change_percentage_24h: z.number(),
	circulating_supply: z.number(),
	total_supply: z.number(),
	max_supply: z.number().nullable(),
	ath: z.number(),
	ath_change_percentage: z.number(),
	ath_date: z.string(),
	atl: z.number(),
	atl_change_percentage: z.number(),
	atl_date: z.string(),
	roi: z.null(),
	last_updated: z.string(),
	price_change_percentage_1h_in_currency: z.number(),
	price_change_percentage_7d: z.number(),
	price_change_percentage_30d: z.number(),
	price_change_percentage_1y: z.number()
});

export const CoinSchemaTable = CoinModel.omit({
	id: true,
	current_price: true,
	market_cap: true,
	market_cap_rank: true,
	market_cap_change_percentage_24h: true,
	circulating_supply: true
});

export type Coin = z.infer<typeof CoinModel>;
export type CoinTable = z.infer<typeof CoinSchemaTable>;

export const DataPriceModel = z.object({
	month: z.string(),
	price: z.number()
});

export type DataPrice = z.infer<typeof DataPriceModel>;
