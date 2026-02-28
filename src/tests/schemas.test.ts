import { describe, it, expect } from 'vitest';
import { TransactionSchema, TransactionTypeSchema } from '@/src/schemas/transaction';
import { CoinModel } from '@/src/schemas/coin';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// TransactionTypeSchema
// ---------------------------------------------------------------------------
describe('TransactionTypeSchema', () => {
	it('accepts ACHAT', () => {
		expect(TransactionTypeSchema.parse('ACHAT')).toBe('ACHAT');
	});

	it('accepts VENTE', () => {
		expect(TransactionTypeSchema.parse('VENTE')).toBe('VENTE');
	});

	it('rejects unknown types', () => {
		expect(() => TransactionTypeSchema.parse('BUY')).toThrow();
		expect(() => TransactionTypeSchema.parse('')).toThrow();
	});
});

// ---------------------------------------------------------------------------
// TransactionSchema
// ---------------------------------------------------------------------------
describe('TransactionSchema', () => {
	const validTransaction = {
		portfolioCoinId: 'abc-123',
		quantityCrypto: 1.5,
		amountUsd: 45000,
		type: 'ACHAT',
		pricePerCoin: 30000
	};

	it('parses a valid transaction', () => {
		const result = TransactionSchema.safeParse(validTransaction);
		expect(result.success).toBe(true);
	});

	it('accepts optional fees and note', () => {
		const result = TransactionSchema.safeParse({
			...validTransaction,
			fees: 10.5,
			note: 'buy dip'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.fees).toBe(10.5);
			expect(result.data.note).toBe('buy dip');
		}
	});

	it('rejects zero or negative quantityCrypto', () => {
		expect(TransactionSchema.safeParse({ ...validTransaction, quantityCrypto: 0 }).success).toBe(false);
		expect(TransactionSchema.safeParse({ ...validTransaction, quantityCrypto: -1 }).success).toBe(false);
	});

	it('rejects negative amountUsd', () => {
		expect(TransactionSchema.safeParse({ ...validTransaction, amountUsd: -1 }).success).toBe(false);
	});

	it('accepts amountUsd of 0', () => {
		// Edge case: some transactions might record 0 amount
		expect(TransactionSchema.safeParse({ ...validTransaction, amountUsd: 0 }).success).toBe(true);
	});

	it('rejects negative fees', () => {
		expect(TransactionSchema.safeParse({ ...validTransaction, fees: -5 }).success).toBe(false);
	});

	it('rejects missing required fields', () => {
		expect(TransactionSchema.safeParse({ quantityCrypto: 1, amountUsd: 100 }).success).toBe(false);
	});

	it('rejects invalid transaction type', () => {
		expect(TransactionSchema.safeParse({ ...validTransaction, type: 'HOLD' }).success).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// CoinModel
// ---------------------------------------------------------------------------
describe('CoinModel', () => {
	const validCoin = {
		id: 'bitcoin',
		symbol: 'btc',
		name: 'Bitcoin',
		image: 'https://example.com/btc.png',
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
		price_change_percentage_1y: 150.2
	};

	it('parses a valid coin', () => {
		expect(CoinModel.safeParse(validCoin).success).toBe(true);
	});

	it('accepts null max_supply', () => {
		const result = CoinModel.safeParse({ ...validCoin, max_supply: null });
		expect(result.success).toBe(true);
	});

	it('rejects missing required fields', () => {
		const { id, ...withoutId } = validCoin;
		expect(CoinModel.safeParse(withoutId).success).toBe(false);
	});

	it('rejects non-numeric current_price', () => {
		expect(CoinModel.safeParse({ ...validCoin, current_price: 'sixty-five-thousand' }).success).toBe(false);
	});
});
