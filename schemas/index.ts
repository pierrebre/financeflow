import { z } from 'zod';
import { ColumnDef } from '@tanstack/react-table';

// Settings schema

export const SettingsSchema = z.object({
	name: z.optional(z.string()),
	isTwoFactorAuthenticated: z.optional(z.boolean()),
	email: z.optional(z.string().email()),
	image: z.union([z.string().url().optional(), z.any().optional()])
});

const IntervalModel = z.enum(['1', '7', '30', '365']);

export type ChartInterval = z.infer<typeof IntervalModel>;

// Coin schema
const CoinModel = z.object({
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

const CoinSchemaTable = CoinModel.omit({
	id: true,
	current_price: true,
	market_cap: true,
	market_cap_rank: true,
	market_cap_change_percentage_24h: true,
	circulating_supply: true
});

const DataPriceModel = z.object({
	month: z.string(),
	price: z.number()
});

export type DataPrice = z.infer<typeof DataPriceModel>;

export type Coin = z.infer<typeof CoinModel>;

export type CoinTable = z.infer<typeof CoinSchemaTable>;

// Auth schema
export const LoginSchema = z.object({
	email: z.string().email({
		message: 'Email is required'
	}),
	password: z.string().min(6, { message: 'Password is required' }),
	code: z.optional(z.string().length(5), {
		message: 'Your one-time password must be 5 characters.'
	})
});

export const ResetPasswordSchema = z.object({
	email: z.string().email({
		message: 'Email is required'
	})
});

export const NewPasswordSchema = z.object({
	password: z.string().min(6, {
		message: 'Minimum 6 characters'
	})
});

export const RegisterSchema = z.object({
	email: z.string().email({
		message: 'Email is required'
	}),
	password: z.string().min(6, { message: 'Minimum 6 characters required' }),
	name: z.string().min(2, { message: 'Minimum is required' })
});

// DataTable schema
export interface DataTableProps<TData, TValue> {
	readonly columns: ColumnDef<TData, TValue>[];
	readonly data: TData[];
	readonly isLoading?: boolean;
	readonly isError?: boolean;
	readonly isForPortfolio?: boolean;
}


// Portfolio schema
export interface Portfolio {
	id: string;
	name: string;
	description: string | null;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
  }
