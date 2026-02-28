/**
 * Portfolio Calculations — FIFO method
 *
 * All functions are pure (no side-effects, no async) and work on the
 * Transaction[] array already available from the TransactionContext.
 */

import { Transaction } from '@/src/schemas/';

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

/** A single purchase lot, used for FIFO queue */
export interface Lot {
	qty: number;
	pricePerCoin: number;
	fees: number;
	date: Date;
}

/** Current holdings for one coin */
export interface Holding {
	coinId: string;
	qty: number;
	/** Weighted average cost per coin (USD) */
	avgCostBasis: number;
	/** Total USD invested in currently-held coins */
	totalInvested: number;
	/** Cumulative fees paid for BUY transactions for this coin */
	totalFees: number;
}

/** FIFO-computed realized P&L for one coin */
export interface RealizedResult {
	/** Total sale proceeds (amountUsd of all sell transactions) */
	proceeds: number;
	/** FIFO cost basis of the sold coins */
	costBasis: number;
	/** proceeds - costBasis */
	pnl: number;
	/** pnl / costBasis × 100 (NaN when costBasis = 0) */
	pnlPct: number;
}

/** Per-coin realized result attached to a single sell transaction */
export interface TxRealizedPnL {
	txId: string;
	pnl: number;
	pnlPct: number;
}

/** Global portfolio metrics */
export interface PortfolioMetrics {
	totalCurrentValue: number;
	totalInvested: number;
	unrealizedPnL: number;
	unrealizedPnLPct: number;
	realizedPnL: number;
	totalFees: number;
	/** (unrealizedPnL + realizedPnL) / netInvested × 100 */
	totalROI: number;
	assetCount: number;
}

/** Stats for a single coin (used in CoinDetailPanel) */
export interface CoinStats {
	coinId: string;
	qty: number;
	avgCostBasis: number;
	currentPrice: number;
	currentValue: number;
	totalInvested: number;
	unrealizedPnL: number;
	unrealizedPnLPct: number;
	realizedPnL: number;
	totalFees: number;
	txCount: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getCoinId(tx: Transaction): string {
	return tx.portfolioCoin?.coinId ?? tx.portfolioCoinId;
}

function txDate(tx: Transaction): number {
	return tx.date ? new Date(tx.date).getTime() : tx.createdAt ? new Date(tx.createdAt).getTime() : 0;
}

function sortedByDate(txs: Transaction[], dir: 'asc' | 'desc' = 'asc'): Transaction[] {
	return [...txs].sort((a, b) => (dir === 'asc' ? txDate(a) - txDate(b) : txDate(b) - txDate(a)));
}

// ---------------------------------------------------------------------------
// 1. FIFO queue builder
// ---------------------------------------------------------------------------

/**
 * Returns per-coin FIFO queues of BUY lots, sorted oldest-first.
 * Does NOT mutate — callers receive a deep copy.
 */
export function buildFIFOQueue(transactions: Transaction[]): Record<string, Lot[]> {
	const queues: Record<string, Lot[]> = {};

	for (const tx of sortedByDate(transactions, 'asc')) {
		if (tx.type !== 'ACHAT') continue;
		const coinId = getCoinId(tx);
		if (!queues[coinId]) queues[coinId] = [];
		queues[coinId].push({
			qty: tx.quantityCrypto,
			pricePerCoin: tx.pricePerCoin,
			fees: tx.fees ?? 0,
			date: tx.date ? new Date(tx.date) : new Date(0)
		});
	}

	return queues;
}

// ---------------------------------------------------------------------------
// 2. Current holdings (average cost basis)
// ---------------------------------------------------------------------------

/**
 * Computes current holdings per coin using weighted average cost.
 * Sells reduce quantity; avgCostBasis = totalInvested / qty.
 */
export function computeHoldings(transactions: Transaction[]): Record<string, Holding> {
	const result: Record<string, Holding> = {};

	for (const tx of sortedByDate(transactions, 'asc')) {
		const coinId = getCoinId(tx);
		if (!result[coinId]) {
			result[coinId] = { coinId, qty: 0, avgCostBasis: 0, totalInvested: 0, totalFees: 0 };
		}
		const h = result[coinId];
		const fees = tx.fees ?? 0;

		if (tx.type === 'ACHAT') {
			const newQty = h.qty + tx.quantityCrypto;
			const newInvested = h.totalInvested + tx.amountUsd + fees;
			h.avgCostBasis = newInvested / newQty;
			h.totalInvested = newInvested;
			h.qty = newQty;
			h.totalFees += fees;
		} else {
			// VENTE — reduce position proportionally
			const soldRatio = h.qty > 0 ? tx.quantityCrypto / h.qty : 0;
			h.totalInvested = Math.max(0, h.totalInvested * (1 - soldRatio));
			h.qty = Math.max(0, h.qty - tx.quantityCrypto);
			h.avgCostBasis = h.qty > 0 ? h.totalInvested / h.qty : 0;
			h.totalFees += fees;
		}
	}

	return result;
}

// ---------------------------------------------------------------------------
// 3. Realized P&L (FIFO)
// ---------------------------------------------------------------------------

/**
 * Computes realized P&L per coin using FIFO.
 * Returns aggregate result per coin AND per-transaction P&L for sell rows.
 */
export function computeRealizedPnL(transactions: Transaction[]): {
	byCoin: Record<string, RealizedResult>;
	byTx: Record<string, TxRealizedPnL>;
} {
	// Deep-copy of FIFO queues (we'll mutate them as we consume lots)
	const queues: Record<string, Lot[]> = {};
	for (const tx of sortedByDate(transactions, 'asc')) {
		if (tx.type !== 'ACHAT') continue;
		const coinId = getCoinId(tx);
		if (!queues[coinId]) queues[coinId] = [];
		queues[coinId].push({
			qty: tx.quantityCrypto,
			pricePerCoin: tx.pricePerCoin,
			fees: tx.fees ?? 0,
			date: tx.date ? new Date(tx.date) : new Date(0)
		});
	}

	const byCoin: Record<string, RealizedResult> = {};
	const byTx: Record<string, TxRealizedPnL> = {};

	for (const tx of sortedByDate(transactions, 'asc')) {
		if (tx.type !== 'VENTE') continue;
		const coinId = getCoinId(tx);
		const lots = queues[coinId] ?? [];

		let remaining = tx.quantityCrypto;
		let costBasis = 0;

		while (remaining > 0 && lots.length > 0) {
			const lot = lots[0];
			const consume = Math.min(remaining, lot.qty);
			const lotFeePerUnit = lot.qty > 0 ? lot.fees / lot.qty : 0;
			costBasis += consume * lot.pricePerCoin + consume * lotFeePerUnit;
			lot.qty -= consume;
			remaining -= consume;
			if (lot.qty <= 0) lots.shift();
		}

		const sellFees = tx.fees ?? 0;
		const proceeds = tx.amountUsd - sellFees;
		const pnl = proceeds - costBasis;
		const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

		if (!byCoin[coinId]) {
			byCoin[coinId] = { proceeds: 0, costBasis: 0, pnl: 0, pnlPct: 0 };
		}
		byCoin[coinId].proceeds += proceeds;
		byCoin[coinId].costBasis += costBasis;
		byCoin[coinId].pnl += pnl;
		byCoin[coinId].pnlPct =
			byCoin[coinId].costBasis > 0 ? (byCoin[coinId].pnl / byCoin[coinId].costBasis) * 100 : 0;

		byTx[tx.id] = { txId: tx.id, pnl, pnlPct };
	}

	return { byCoin, byTx };
}

// ---------------------------------------------------------------------------
// 4. Global portfolio metrics
// ---------------------------------------------------------------------------

export function computePortfolioMetrics(
	transactions: Transaction[],
	priceMap: Record<string, number>
): PortfolioMetrics {
	const holdings = computeHoldings(transactions);
	const { byCoin: realizedByCoin } = computeRealizedPnL(transactions);

	let totalCurrentValue = 0;
	let totalInvested = 0;
	let totalFees = 0;
	let unrealizedPnL = 0;
	let realizedPnL = 0;
	let assetCount = 0;

	for (const h of Object.values(holdings)) {
		if (h.qty <= 0) continue;
		const price = priceMap[h.coinId] ?? 0;
		const currentValue = h.qty * price;
		const unrealized = currentValue - h.totalInvested;

		totalCurrentValue += currentValue;
		totalInvested += h.totalInvested;
		totalFees += h.totalFees;
		unrealizedPnL += unrealized;
		assetCount++;
	}

	// Add fees from SELL transactions
	for (const tx of transactions) {
		if (tx.type === 'VENTE') totalFees += tx.fees ?? 0;
	}

	for (const r of Object.values(realizedByCoin)) {
		realizedPnL += r.pnl;
	}

	const unrealizedPnLPct = totalInvested > 0 ? (unrealizedPnL / totalInvested) * 100 : 0;
	const netInvested = totalInvested;
	const totalROI = netInvested > 0 ? ((unrealizedPnL + realizedPnL) / netInvested) * 100 : 0;

	return {
		totalCurrentValue,
		totalInvested,
		unrealizedPnL,
		unrealizedPnLPct,
		realizedPnL,
		totalFees,
		totalROI,
		assetCount
	};
}

// ---------------------------------------------------------------------------
// 5. Per-coin stats
// ---------------------------------------------------------------------------

export function computeCoinStats(
	coinId: string,
	transactions: Transaction[],
	currentPrice: number
): CoinStats {
	const coinTxs = transactions.filter((tx) => getCoinId(tx) === coinId);
	const holdings = computeHoldings(coinTxs);
	const { byCoin } = computeRealizedPnL(coinTxs);

	const h = holdings[coinId] ?? { qty: 0, avgCostBasis: 0, totalInvested: 0, totalFees: 0 };
	const realized = byCoin[coinId] ?? { pnl: 0 };

	const currentValue = h.qty * currentPrice;
	const unrealizedPnL = currentValue - h.totalInvested;
	const unrealizedPnLPct = h.totalInvested > 0 ? (unrealizedPnL / h.totalInvested) * 100 : 0;

	return {
		coinId,
		qty: h.qty,
		avgCostBasis: h.avgCostBasis,
		currentPrice,
		currentValue,
		totalInvested: h.totalInvested,
		unrealizedPnL,
		unrealizedPnLPct,
		realizedPnL: realized.pnl,
		totalFees: h.totalFees,
		txCount: coinTxs.length
	};
}
