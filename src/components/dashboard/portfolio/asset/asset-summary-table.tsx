'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
import { useTransactions } from '../transaction/transaction-provider';
import { usePortfolioCoins } from './portfolio-coin-provider';
import { useQuery } from '@tanstack/react-query';
import { getCoinsWatchlist } from '@/src/actions/external/crypto';
import { computeHoldings, computeRealizedPnL } from '@/src/lib/portfolio-calculations';
import { CoinDetailPanel } from './coin-detail-panel';
import { computeCoinStats } from '@/src/lib/portfolio-calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';

type SortKey = 'coinName' | 'qty' | 'avgCostBasis' | 'currentValue' | 'unrealizedPnL' | 'unrealizedPnLPct';
type SortDir = 'asc' | 'desc';

interface AssetRow {
	coinId: string;
	coinName: string;
	coinSymbol: string;
	coinImage: string;
	qty: number;
	avgCostBasis: number;
	currentPrice: number;
	currentValue: number;
	unrealizedPnL: number;
	unrealizedPnLPct: number;
	realizedPnL: number;
	change24h: number;
	totalFees: number;
	txCount: number;
}

interface AssetSummaryTableProps {
	portfolioId: string;
}

function SortButton({ label, sortKey, current, dir, onSort }: { label: string; sortKey: SortKey; current: SortKey; dir: SortDir; onSort: (k: SortKey) => void }) {
	const active = current === sortKey;
	return (
		<button
			onClick={() => onSort(sortKey)}
			className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
		>
			{label}
			{active ? (
				dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
			) : (
				<ArrowUpDown size={12} className="opacity-40" />
			)}
		</button>
	);
}

export function AssetSummaryTable({ portfolioId }: AssetSummaryTableProps) {
	const { optimisticTransactions } = useTransactions();
	const { optimisticPortfolioCoins } = usePortfolioCoins();
	const [expandedCoin, setExpandedCoin] = useState<string | null>(null);
	const [sortKey, setSortKey] = useState<SortKey>('currentValue');
	const [sortDir, setSortDir] = useState<SortDir>('desc');

	const coinIds = optimisticPortfolioCoins.map((c) => c.coinId);

	const { data: coinsData = [] } = useQuery({
		queryKey: ['coins-data', coinIds],
		queryFn: () => (coinIds.length > 0 ? getCoinsWatchlist(coinIds) : Promise.resolve([])),
		enabled: coinIds.length > 0,
		refetchInterval: 60_000
	});

	const rows = useMemo((): AssetRow[] => {
		const priceMap: Record<string, number> = {};
		const coinMeta: Record<string, { name: string; symbol: string; image: string; change24h: number }> = {};

		for (const coin of coinsData) {
			priceMap[coin.id] = coin.current_price ?? 0;
			coinMeta[coin.id] = {
				name: coin.name,
				symbol: coin.symbol,
				image: coin.image,
				change24h: coin.price_change_percentage_24h ?? 0
			};
		}

		const holdings = computeHoldings(optimisticTransactions);
		const { byCoin: realizedByCoin } = computeRealizedPnL(optimisticTransactions);

		return Object.entries(holdings)
			.filter(([, h]) => h.qty > 0)
			.map(([coinId, h]) => {
				const price = priceMap[coinId] ?? 0;
				const stats = computeCoinStats(coinId, optimisticTransactions, price);
				const meta = coinMeta[coinId];
				const realized = realizedByCoin[coinId]?.pnl ?? 0;

				return {
					coinId,
					coinName: meta?.name ?? coinId,
					coinSymbol: meta?.symbol ?? coinId,
					coinImage: meta?.image ?? '',
					qty: h.qty,
					avgCostBasis: h.avgCostBasis,
					currentPrice: price,
					currentValue: stats.currentValue,
					unrealizedPnL: stats.unrealizedPnL,
					unrealizedPnLPct: stats.unrealizedPnLPct,
					realizedPnL: realized,
					change24h: meta?.change24h ?? 0,
					totalFees: h.totalFees,
					txCount: stats.txCount
				};
			});
	}, [optimisticTransactions, coinsData]);

	const sorted = useMemo(() => {
		return [...rows].sort((a, b) => {
			const av = a[sortKey as keyof AssetRow];
			const bv = b[sortKey as keyof AssetRow];
			if (typeof av === 'string') {
				const as = av.toLowerCase();
				const bs = (bv as string).toLowerCase();
				return sortDir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
			}
			return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
		});
	}, [rows, sortKey, sortDir]);

	function handleSort(key: SortKey) {
		if (key === sortKey) {
			setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortKey(key);
			setSortDir('desc');
		}
	}

	function toggleExpand(coinId: string) {
		setExpandedCoin((prev) => (prev === coinId ? null : coinId));
	}

	const fmt = (n: number) =>
		`$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

	if (rows.length === 0) return null;

	return (
		<Card>
			<CardHeader className="pb-2 pt-4 px-4">
				<CardTitle className="text-sm font-semibold">Assets</CardTitle>
			</CardHeader>
			<CardContent className="px-0 pb-0">
				{/* Table header */}
				<div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_40px] gap-2 px-4 pb-2 border-b">
					<SortButton label="Asset" sortKey="coinName" current={sortKey} dir={sortDir} onSort={handleSort} />
					<SortButton label="Holdings" sortKey="qty" current={sortKey} dir={sortDir} onSort={handleSort} />
					<SortButton label="Avg Buy" sortKey="avgCostBasis" current={sortKey} dir={sortDir} onSort={handleSort} />
					<SortButton label="Value" sortKey="currentValue" current={sortKey} dir={sortDir} onSort={handleSort} />
					<SortButton label="Unrealized P&L" sortKey="unrealizedPnL" current={sortKey} dir={sortDir} onSort={handleSort} />
					<SortButton label="24h" sortKey="unrealizedPnLPct" current={sortKey} dir={sortDir} onSort={handleSort} />
					<span />
				</div>

				{/* Rows */}
				<div className="divide-y">
					{sorted.map((row, i) => {
						const isExpanded = expandedCoin === row.coinId;
						const pnlPos = row.unrealizedPnL >= 0;
						const changePos = row.change24h >= 0;

						return (
							<div key={row.coinId}>
								<motion.div
									initial={{ opacity: 0, x: -6 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: i * 0.04 }}
									className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_40px] gap-2 px-4 py-3 items-center cursor-pointer hover:bg-muted/40 transition-colors ${isExpanded ? 'bg-muted/30' : ''}`}
									onClick={() => toggleExpand(row.coinId)}
								>
									{/* Asset */}
									<div className="flex items-center gap-2 min-w-0">
										{row.coinImage && (
											<Image src={row.coinImage} alt={row.coinName} width={28} height={28} className="rounded-full shrink-0" />
										)}
										<div className="min-w-0">
											<p className="text-sm font-medium truncate">{row.coinName}</p>
											<p className="text-xs text-muted-foreground">{row.coinSymbol.toUpperCase()}</p>
										</div>
									</div>

									{/* Holdings */}
									<div className="text-sm tabular-nums">
										<p>{row.qty.toLocaleString('en-US', { maximumFractionDigits: 6 })}</p>
										<p className="text-xs text-muted-foreground">{fmt(row.currentValue)}</p>
									</div>

									{/* Avg buy */}
									<span className="text-sm tabular-nums">{fmt(row.avgCostBasis)}</span>

									{/* Current value */}
									<span className="text-sm font-medium tabular-nums">{fmt(row.currentValue)}</span>

									{/* Unrealized P&L */}
									<div className={`text-sm font-medium tabular-nums ${pnlPos ? 'text-emerald-500' : 'text-red-500'}`}>
										<p>{pnlPos ? '+' : ''}{fmt(row.unrealizedPnL)}</p>
										<p className="text-xs">
											{pnlPos ? '+' : ''}{row.unrealizedPnLPct.toFixed(2)}%
										</p>
									</div>

									{/* 24h */}
									<div className={`flex items-center gap-1 text-sm font-medium ${changePos ? 'text-emerald-500' : 'text-red-500'}`}>
										{changePos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
										{Math.abs(row.change24h).toFixed(2)}%
									</div>

									{/* Expand toggle */}
									<Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => { e.stopPropagation(); toggleExpand(row.coinId); }}>
										{isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
									</Button>
								</motion.div>

								{/* Detail panel */}
								<AnimatePresence>
									{isExpanded && (
										<CoinDetailPanel
											key={`detail-${row.coinId}`}
											coinId={row.coinId}
											coinImage={row.coinImage}
											coinName={row.coinName}
											coinSymbol={row.coinSymbol}
											stats={{
												coinId: row.coinId,
												qty: row.qty,
												avgCostBasis: row.avgCostBasis,
												currentPrice: row.currentPrice,
												currentValue: row.currentValue,
												totalInvested: row.qty * row.avgCostBasis,
												unrealizedPnL: row.unrealizedPnL,
												unrealizedPnLPct: row.unrealizedPnLPct,
												realizedPnL: row.realizedPnL,
												totalFees: row.totalFees,
												txCount: row.txCount
											}}
											portfolioId={portfolioId}
										/>
									)}
								</AnimatePresence>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
