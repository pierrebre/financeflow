import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	cn,
	getDateRangeMessage,
	getPeriod,
	formatTransactionForDisplay,
	prepareTransactionForSubmission,
	areTransactionsEqual
} from '@/src/lib/utils';
import { Transaction } from '@/src/schemas/';

// Mock date-fns format for stable snapshots
vi.mock('date-fns', async () => {
	const actual = await vi.importActual<typeof import('date-fns')>('date-fns');
	return {
		...actual,
		// Keep real implementations — just let date-fns run
	};
});

// ---------------------------------------------------------------------------
// cn (classname merger)
// ---------------------------------------------------------------------------
describe('cn()', () => {
	it('merges class names', () => {
		expect(cn('a', 'b')).toBe('a b');
	});

	it('handles conditional classes', () => {
		expect(cn('base', false && 'gone', 'kept')).toBe('base kept');
	});

	it('deduplicates tailwind conflicting classes', () => {
		// tailwind-merge should resolve conflicts
		expect(cn('p-2', 'p-4')).toBe('p-4');
	});

	it('handles undefined / null gracefully', () => {
		expect(cn(undefined, null as unknown as string, 'ok')).toBe('ok');
	});
});

// ---------------------------------------------------------------------------
// getDateRangeMessage
// ---------------------------------------------------------------------------
describe('getDateRangeMessage()', () => {
	it('returns a string with " - " separator', () => {
		const result = getDateRangeMessage('30');
		expect(result).toMatch(/ - /);
	});

	it('returns a string with dates in dd/MM/yyyy format', () => {
		const result = getDateRangeMessage('7');
		expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} - \d{2}\/\d{2}\/\d{4}/);
	});

	it('handles all valid intervals', () => {
		for (const interval of ['1', '7', '30', '365'] as const) {
			expect(() => getDateRangeMessage(interval)).not.toThrow();
		}
	});
});

// ---------------------------------------------------------------------------
// getPeriod
// ---------------------------------------------------------------------------
describe('getPeriod()', () => {
	it('returns "day" for interval "1"', () => {
		expect(getPeriod('1')).toBe('day');
	});

	it('returns "week" for interval "7"', () => {
		expect(getPeriod('7')).toBe('week');
	});

	it('returns "month" for interval "30"', () => {
		expect(getPeriod('30')).toBe('month');
	});

	it('returns "year" for interval "365"', () => {
		expect(getPeriod('365')).toBe('year');
	});
});

// ---------------------------------------------------------------------------
// Shared test fixture
// ---------------------------------------------------------------------------
const mockTransaction: Transaction = {
	id: 'tx-001',
	portfolioCoinId: 'portfolio-123_bitcoin',
	quantityCrypto: 0.5,
	amountUsd: 15000,
	type: 'ACHAT',
	pricePerCoin: 30000,
	fees: 15,
	note: 'First buy',
	date: new Date('2024-01-15')
};

// ---------------------------------------------------------------------------
// formatTransactionForDisplay
// ---------------------------------------------------------------------------
describe('formatTransactionForDisplay()', () => {
	it('formats amountUsd with dollar sign', () => {
		const result = formatTransactionForDisplay(mockTransaction);
		expect(result.formattedAmount).toBe('$15000.00');
	});

	it('formats quantityCrypto to 2 decimal places', () => {
		const result = formatTransactionForDisplay(mockTransaction);
		expect(result.formattedQuantity).toBe('0.50');
	});

	it('formats pricePerCoin with dollar sign', () => {
		const result = formatTransactionForDisplay(mockTransaction);
		expect(result.formattedPrice).toBe('$30000.00');
	});

	it('formats fees with dollar sign', () => {
		const result = formatTransactionForDisplay(mockTransaction);
		expect(result.formattedFees).toBe('$15.00');
	});

	it('falls back to $0.00 when fees are absent', () => {
		const { fees, ...noFees } = mockTransaction;
		const result = formatTransactionForDisplay({ ...noFees, fees: undefined });
		expect(result.formattedFees).toBe('$0.00');
	});

	it('falls back to N/A when date is absent', () => {
		const result = formatTransactionForDisplay({ ...mockTransaction, date: undefined });
		expect(result.formattedDate).toBe('N/A');
	});

	it('preserves all original transaction fields', () => {
		const result = formatTransactionForDisplay(mockTransaction);
		expect(result.id).toBe('tx-001');
		expect(result.type).toBe('ACHAT');
	});
});

// ---------------------------------------------------------------------------
// prepareTransactionForSubmission
// ---------------------------------------------------------------------------
describe('prepareTransactionForSubmission()', () => {
	it('splits portfolioCoinId into portfolioId and coinId', () => {
		const result = prepareTransactionForSubmission(mockTransaction);
		expect(result.portfolioId).toBe('portfolio-123');
		expect(result.coinId).toBe('bitcoin');
	});

	it('falls back to full portfolioCoinId as coinId when no underscore', () => {
		const tx = { ...mockTransaction, portfolioCoinId: 'someId' };
		const result = prepareTransactionForSubmission(tx);
		expect(result.coinId).toBe('someId');
	});

	it('defaults fees to 0 when undefined', () => {
		const result = prepareTransactionForSubmission({ ...mockTransaction, fees: undefined });
		expect(result.fees).toBe(0);
	});

	it('defaults note to empty string when undefined', () => {
		const result = prepareTransactionForSubmission({ ...mockTransaction, note: undefined });
		expect(result.note).toBe('');
	});

	it('passes through numeric values unchanged', () => {
		const result = prepareTransactionForSubmission(mockTransaction);
		expect(result.quantityCrypto).toBe(0.5);
		expect(result.amountUsd).toBe(15000);
		expect(result.pricePerCoin).toBe(30000);
	});
});

// ---------------------------------------------------------------------------
// areTransactionsEqual
// ---------------------------------------------------------------------------
describe('areTransactionsEqual()', () => {
	it('returns true for identical transactions', () => {
		expect(areTransactionsEqual(mockTransaction, { ...mockTransaction })).toBe(true);
	});

	it('returns false when id differs', () => {
		expect(areTransactionsEqual(mockTransaction, { ...mockTransaction, id: 'tx-002' })).toBe(false);
	});

	it('returns false when quantity differs', () => {
		expect(areTransactionsEqual(mockTransaction, { ...mockTransaction, quantityCrypto: 1 })).toBe(false);
	});

	it('returns false when amount differs', () => {
		expect(areTransactionsEqual(mockTransaction, { ...mockTransaction, amountUsd: 9999 })).toBe(false);
	});

	it('returns false when type differs', () => {
		expect(areTransactionsEqual(mockTransaction, { ...mockTransaction, type: 'VENTE' })).toBe(false);
	});
});
