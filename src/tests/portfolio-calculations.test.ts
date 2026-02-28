import { describe, it, expect } from 'vitest';
import {
	buildFIFOQueue,
	computeHoldings,
	computeRealizedPnL,
	computePortfolioMetrics,
	computeCoinStats
} from '@/src/lib/portfolio-calculations';
import { Transaction } from '@/src/schemas/';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let idCounter = 0;
function makeTx(overrides: Partial<Transaction> & { coinId: string }): Transaction {
	const { coinId, ...rest } = overrides;
	return {
		id: `tx-${++idCounter}`,
		portfolioCoinId: `pc-${coinId}`,
		portfolioCoin: { id: `pc-${coinId}`, coinId, portfolioId: 'p1' },
		quantityCrypto: 1,
		amountUsd: 100,
		pricePerCoin: 100,
		type: 'ACHAT',
		fees: 0,
		date: new Date('2024-01-01'),
		...rest
	};
}

const BTC = 'bitcoin';
const ETH = 'ethereum';

// ---------------------------------------------------------------------------
// 1. buildFIFOQueue
// ---------------------------------------------------------------------------

describe('buildFIFOQueue', () => {
	it('builds one lot per BUY transaction', () => {
		const txs = [
			makeTx({ coinId: BTC, quantityCrypto: 1, pricePerCoin: 30000, fees: 10, date: new Date('2024-01-01') }),
			makeTx({ coinId: BTC, quantityCrypto: 2, pricePerCoin: 35000, fees: 20, date: new Date('2024-02-01') })
		];
		const queues = buildFIFOQueue(txs);
		expect(queues[BTC]).toHaveLength(2);
		expect(queues[BTC][0].qty).toBe(1);
		expect(queues[BTC][0].pricePerCoin).toBe(30000);
		expect(queues[BTC][1].qty).toBe(2);
	});

	it('ignores SELL transactions', () => {
		const txs = [
			makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 0.5, amountUsd: 20000 })
		];
		const queues = buildFIFOQueue(txs);
		expect(queues[BTC]).toBeUndefined();
	});

	it('sorts lots oldest-first even if transactions arrive out of order', () => {
		const txs = [
			makeTx({ coinId: BTC, quantityCrypto: 1, pricePerCoin: 50000, date: new Date('2024-03-01') }),
			makeTx({ coinId: BTC, quantityCrypto: 1, pricePerCoin: 20000, date: new Date('2023-01-01') })
		];
		const queues = buildFIFOQueue(txs);
		expect(queues[BTC][0].pricePerCoin).toBe(20000); // oldest first
		expect(queues[BTC][1].pricePerCoin).toBe(50000);
	});

	it('separates queues per coin', () => {
		const txs = [
			makeTx({ coinId: BTC, quantityCrypto: 1 }),
			makeTx({ coinId: ETH, quantityCrypto: 5 })
		];
		const queues = buildFIFOQueue(txs);
		expect(queues[BTC]).toHaveLength(1);
		expect(queues[ETH]).toHaveLength(1);
	});
});

// ---------------------------------------------------------------------------
// 2. computeHoldings
// ---------------------------------------------------------------------------

describe('computeHoldings', () => {
	it('accumulates BUY transactions correctly', () => {
		const txs = [
			makeTx({ coinId: BTC, quantityCrypto: 1, pricePerCoin: 30000, amountUsd: 30000, fees: 0 }),
			makeTx({ coinId: BTC, quantityCrypto: 1, pricePerCoin: 40000, amountUsd: 40000, fees: 0 })
		];
		const holdings = computeHoldings(txs);
		expect(holdings[BTC].qty).toBe(2);
		expect(holdings[BTC].totalInvested).toBe(70000);
		expect(holdings[BTC].avgCostBasis).toBe(35000);
	});

	it('includes fees in totalInvested and avgCostBasis', () => {
		const txs = [
			makeTx({ coinId: BTC, quantityCrypto: 1, pricePerCoin: 30000, amountUsd: 30000, fees: 300 })
		];
		const holdings = computeHoldings(txs);
		expect(holdings[BTC].totalInvested).toBe(30300);
		expect(holdings[BTC].avgCostBasis).toBe(30300);
		expect(holdings[BTC].totalFees).toBe(300);
	});

	it('reduces position on SELL', () => {
		const txs = [
			makeTx({ coinId: BTC, quantityCrypto: 2, pricePerCoin: 30000, amountUsd: 60000, fees: 0 }),
			makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 1, amountUsd: 35000, pricePerCoin: 35000 })
		];
		const holdings = computeHoldings(txs);
		expect(holdings[BTC].qty).toBe(1);
		expect(holdings[BTC].totalInvested).toBe(30000); // half sold → half remaining
	});

	it('qty never goes below 0 (sell > buy)', () => {
		const txs = [
			makeTx({ coinId: BTC, quantityCrypto: 1 }),
			makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 5, amountUsd: 500, pricePerCoin: 100 })
		];
		const holdings = computeHoldings(txs);
		expect(holdings[BTC].qty).toBeGreaterThanOrEqual(0);
	});

	it('returns 0 avgCostBasis when qty is 0', () => {
		const txs = [
			makeTx({ coinId: BTC, quantityCrypto: 1, amountUsd: 30000, pricePerCoin: 30000 }),
			makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 1, amountUsd: 35000, pricePerCoin: 35000 })
		];
		const holdings = computeHoldings(txs);
		expect(holdings[BTC].qty).toBe(0);
		expect(holdings[BTC].avgCostBasis).toBe(0);
	});

	it('tracks fees from SELL transactions', () => {
		const txs = [
			makeTx({ coinId: BTC, quantityCrypto: 1, fees: 100 }),
			makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 1, amountUsd: 35000, pricePerCoin: 35000, fees: 50 })
		];
		const holdings = computeHoldings(txs);
		expect(holdings[BTC].totalFees).toBe(150);
	});

	it('handles multiple coins independently', () => {
		const txs = [
			makeTx({ coinId: BTC, quantityCrypto: 1, amountUsd: 30000, pricePerCoin: 30000 }),
			makeTx({ coinId: ETH, quantityCrypto: 10, amountUsd: 20000, pricePerCoin: 2000 })
		];
		const holdings = computeHoldings(txs);
		expect(holdings[BTC].qty).toBe(1);
		expect(holdings[ETH].qty).toBe(10);
		expect(holdings[ETH].avgCostBasis).toBe(2000);
	});
});

// ---------------------------------------------------------------------------
// 3. computeRealizedPnL — FIFO
// ---------------------------------------------------------------------------

describe('computeRealizedPnL', () => {
	it('returns empty result when no SELL transactions', () => {
		const txs = [makeTx({ coinId: BTC, quantityCrypto: 1 })];
		const { byCoin, byTx } = computeRealizedPnL(txs);
		expect(Object.keys(byCoin)).toHaveLength(0);
		expect(Object.keys(byTx)).toHaveLength(0);
	});

	it('computes correct P&L for a simple buy then sell', () => {
		const buy = makeTx({ coinId: BTC, quantityCrypto: 1, pricePerCoin: 30000, amountUsd: 30000, fees: 0, date: new Date('2024-01-01') });
		const sell = makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 1, amountUsd: 40000, pricePerCoin: 40000, fees: 0, date: new Date('2024-06-01') });
		const { byCoin, byTx } = computeRealizedPnL([buy, sell]);

		expect(byCoin[BTC].pnl).toBeCloseTo(10000);
		expect(byTx[sell.id].pnl).toBeCloseTo(10000);
		expect(byTx[sell.id].pnlPct).toBeCloseTo(33.33, 1);
	});

	it('FIFO: consumes oldest lot first', () => {
		// Buy 1 at 20k (old), then 1 at 50k (new)
		// Sell 1 — should use the 20k lot (FIFO)
		const buy1 = makeTx({ coinId: BTC, quantityCrypto: 1, pricePerCoin: 20000, amountUsd: 20000, fees: 0, date: new Date('2023-01-01') });
		const buy2 = makeTx({ coinId: BTC, quantityCrypto: 1, pricePerCoin: 50000, amountUsd: 50000, fees: 0, date: new Date('2024-01-01') });
		const sell = makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 1, amountUsd: 40000, pricePerCoin: 40000, fees: 0, date: new Date('2024-06-01') });

		const { byCoin, byTx } = computeRealizedPnL([buy1, buy2, sell]);

		// Cost basis should be 20000 (oldest lot), not 50000 or average
		expect(byCoin[BTC].costBasis).toBeCloseTo(20000);
		expect(byCoin[BTC].pnl).toBeCloseTo(20000); // 40000 proceeds - 20000 cost
		expect(byTx[sell.id].pnl).toBeCloseTo(20000);
	});

	it('FIFO: partial lot consumption', () => {
		// Buy 2 at 30k each → lot of qty=2
		// Sell 1 → consumes half the lot
		const buy = makeTx({ coinId: BTC, quantityCrypto: 2, pricePerCoin: 30000, amountUsd: 60000, fees: 0, date: new Date('2024-01-01') });
		const sell = makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 1, amountUsd: 40000, pricePerCoin: 40000, fees: 0, date: new Date('2024-06-01') });

		const { byCoin } = computeRealizedPnL([buy, sell]);
		expect(byCoin[BTC].costBasis).toBeCloseTo(30000); // 1 × 30000
		expect(byCoin[BTC].pnl).toBeCloseTo(10000);
	});

	it('includes buy fees in cost basis', () => {
		const buy = makeTx({ coinId: BTC, quantityCrypto: 1, pricePerCoin: 30000, amountUsd: 30000, fees: 300, date: new Date('2024-01-01') });
		const sell = makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 1, amountUsd: 40000, pricePerCoin: 40000, fees: 0, date: new Date('2024-06-01') });

		const { byCoin } = computeRealizedPnL([buy, sell]);
		expect(byCoin[BTC].costBasis).toBeCloseTo(30300); // price + fee
		expect(byCoin[BTC].pnl).toBeCloseTo(9700);
	});

	it('deducts sell fees from proceeds', () => {
		const buy = makeTx({ coinId: BTC, quantityCrypto: 1, pricePerCoin: 30000, amountUsd: 30000, fees: 0, date: new Date('2024-01-01') });
		const sell = makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 1, amountUsd: 40000, pricePerCoin: 40000, fees: 200, date: new Date('2024-06-01') });

		const { byCoin } = computeRealizedPnL([buy, sell]);
		expect(byCoin[BTC].proceeds).toBeCloseTo(39800); // 40000 - 200 fees
		expect(byCoin[BTC].pnl).toBeCloseTo(9800);
	});

	it('accumulates multiple sells for byCoin', () => {
		const buy = makeTx({ coinId: BTC, quantityCrypto: 3, pricePerCoin: 30000, amountUsd: 90000, fees: 0, date: new Date('2024-01-01') });
		const sell1 = makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 1, amountUsd: 35000, pricePerCoin: 35000, fees: 0, date: new Date('2024-03-01') });
		const sell2 = makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 1, amountUsd: 40000, pricePerCoin: 40000, fees: 0, date: new Date('2024-06-01') });

		const { byCoin, byTx } = computeRealizedPnL([buy, sell1, sell2]);
		expect(byCoin[BTC].pnl).toBeCloseTo(15000); // (35000-30000) + (40000-30000)
		expect(byTx[sell1.id].pnl).toBeCloseTo(5000);
		expect(byTx[sell2.id].pnl).toBeCloseTo(10000);
	});

	it('handles sell with no prior buy gracefully (remaining stays at 0)', () => {
		const sell = makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 1, amountUsd: 35000, pricePerCoin: 35000, fees: 0 });
		const { byCoin } = computeRealizedPnL([sell]);
		// No lots available → costBasis = 0, pnl = proceeds
		expect(byCoin[BTC]).toBeDefined();
		expect(byCoin[BTC].costBasis).toBe(0);
	});

	it('pnlPct = 0 when costBasis is 0', () => {
		const sell = makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 1, amountUsd: 35000, pricePerCoin: 35000, fees: 0 });
		const { byTx } = computeRealizedPnL([sell]);
		expect(byTx[sell.id].pnlPct).toBe(0);
	});
});

// ---------------------------------------------------------------------------
// 4. computePortfolioMetrics
// ---------------------------------------------------------------------------

describe('computePortfolioMetrics', () => {
	it('returns zero metrics for empty transactions', () => {
		const metrics = computePortfolioMetrics([], {});
		expect(metrics.totalCurrentValue).toBe(0);
		expect(metrics.totalInvested).toBe(0);
		expect(metrics.unrealizedPnL).toBe(0);
		expect(metrics.realizedPnL).toBe(0);
		expect(metrics.totalROI).toBe(0);
		expect(metrics.assetCount).toBe(0);
	});

	it('computes correct unrealized P&L when price rises', () => {
		const txs = [makeTx({ coinId: BTC, quantityCrypto: 1, pricePerCoin: 30000, amountUsd: 30000, fees: 0 })];
		const priceMap = { [BTC]: 40000 };
		const metrics = computePortfolioMetrics(txs, priceMap);

		expect(metrics.totalCurrentValue).toBeCloseTo(40000);
		expect(metrics.totalInvested).toBeCloseTo(30000);
		expect(metrics.unrealizedPnL).toBeCloseTo(10000);
		expect(metrics.unrealizedPnLPct).toBeCloseTo(33.33, 1);
		expect(metrics.assetCount).toBe(1);
	});

	it('computes negative unrealized P&L when price falls', () => {
		const txs = [makeTx({ coinId: BTC, quantityCrypto: 1, pricePerCoin: 50000, amountUsd: 50000, fees: 0 })];
		const priceMap = { [BTC]: 30000 };
		const metrics = computePortfolioMetrics(txs, priceMap);

		expect(metrics.unrealizedPnL).toBeCloseTo(-20000);
		expect(metrics.unrealizedPnLPct).toBeCloseTo(-40);
	});

	it('includes realized P&L in totalROI', () => {
		const buy = makeTx({ coinId: BTC, quantityCrypto: 2, pricePerCoin: 30000, amountUsd: 60000, fees: 0, date: new Date('2024-01-01') });
		const sell = makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 1, amountUsd: 40000, pricePerCoin: 40000, fees: 0, date: new Date('2024-06-01') });
		const priceMap = { [BTC]: 30000 };

		const metrics = computePortfolioMetrics([buy, sell], priceMap);
		expect(metrics.realizedPnL).toBeCloseTo(10000);
		// Remaining: 1 BTC, totalInvested = 30000, currentValue = 30000 → unrealized = 0
		expect(metrics.unrealizedPnL).toBeCloseTo(0);
		expect(metrics.totalROI).toBeGreaterThan(0);
	});

	it('sums fees from both BUY and SELL transactions', () => {
		const buy = makeTx({ coinId: BTC, quantityCrypto: 1, pricePerCoin: 30000, amountUsd: 30000, fees: 100 });
		const sell = makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 0.5, amountUsd: 20000, pricePerCoin: 40000, fees: 50, date: new Date('2024-06-01') });
		const metrics = computePortfolioMetrics([buy, sell], { [BTC]: 30000 });

		// Buy fees go into totalFees via holdings. Sell fees are added separately.
		expect(metrics.totalFees).toBeGreaterThanOrEqual(150);
	});

	it('ignores coins not present in priceMap (treats price as 0)', () => {
		const txs = [makeTx({ coinId: BTC, quantityCrypto: 1, pricePerCoin: 30000, amountUsd: 30000, fees: 0 })];
		const metrics = computePortfolioMetrics(txs, {}); // no BTC price
		expect(metrics.totalCurrentValue).toBe(0);
		expect(metrics.unrealizedPnL).toBeLessThan(0); // invested but no value
	});

	it('counts only coins with qty > 0 in assetCount', () => {
		const buy = makeTx({ coinId: BTC, quantityCrypto: 1, amountUsd: 30000, pricePerCoin: 30000 });
		const sell = makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 1, amountUsd: 35000, pricePerCoin: 35000, date: new Date('2024-06-01') });
		const metrics = computePortfolioMetrics([buy, sell], {});
		expect(metrics.assetCount).toBe(0); // fully sold out
	});
});

// ---------------------------------------------------------------------------
// 5. computeCoinStats
// ---------------------------------------------------------------------------

describe('computeCoinStats', () => {
	it('returns zero stats for empty transactions', () => {
		const stats = computeCoinStats(BTC, [], 50000);
		expect(stats.qty).toBe(0);
		expect(stats.currentValue).toBe(0);
		expect(stats.unrealizedPnL).toBe(0);
		expect(stats.realizedPnL).toBe(0);
		expect(stats.txCount).toBe(0);
	});

	it('computes correct stats for a simple buy', () => {
		const txs = [makeTx({ coinId: BTC, quantityCrypto: 1, pricePerCoin: 30000, amountUsd: 30000, fees: 0 })];
		const stats = computeCoinStats(BTC, txs, 40000);

		expect(stats.qty).toBe(1);
		expect(stats.avgCostBasis).toBe(30000);
		expect(stats.currentPrice).toBe(40000);
		expect(stats.currentValue).toBe(40000);
		expect(stats.totalInvested).toBe(30000);
		expect(stats.unrealizedPnL).toBeCloseTo(10000);
		expect(stats.unrealizedPnLPct).toBeCloseTo(33.33, 1);
		expect(stats.txCount).toBe(1);
	});

	it('includes realized P&L for partially-sold position', () => {
		const buy = makeTx({ coinId: BTC, quantityCrypto: 2, pricePerCoin: 30000, amountUsd: 60000, fees: 0, date: new Date('2024-01-01') });
		const sell = makeTx({ coinId: BTC, type: 'VENTE', quantityCrypto: 1, amountUsd: 40000, pricePerCoin: 40000, fees: 0, date: new Date('2024-06-01') });
		const stats = computeCoinStats(BTC, [buy, sell], 35000);

		expect(stats.realizedPnL).toBeCloseTo(10000);
		expect(stats.qty).toBe(1);
		expect(stats.txCount).toBe(2);
	});

	it('only processes transactions for the specified coinId', () => {
		const btcTx = makeTx({ coinId: BTC, quantityCrypto: 1, amountUsd: 30000, pricePerCoin: 30000 });
		const ethTx = makeTx({ coinId: ETH, quantityCrypto: 10, amountUsd: 20000, pricePerCoin: 2000 });
		// Pass both but ask for BTC only
		const stats = computeCoinStats(BTC, [btcTx, ethTx], 30000);

		expect(stats.qty).toBe(1);
		expect(stats.txCount).toBe(1);
	});
});
