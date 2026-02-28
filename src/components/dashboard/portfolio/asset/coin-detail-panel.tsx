'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrendingUp, TrendingDown, ReceiptText, Coins, ArrowDownUp, Wallet, DollarSign } from 'lucide-react';
import { CoinStats } from '@/src/lib/portfolio-calculations';
import TransactionTable from '../transaction/transaction-table';

interface StatItemProps {
	label: string;
	value: string;
	positive?: boolean | null;
	icon: React.ReactNode;
}

function StatItem({ label, value, positive, icon }: StatItemProps) {
	const valueColor =
		positive === null || positive === undefined
			? 'text-foreground'
			: positive
				? 'text-emerald-500'
				: 'text-red-500';

	return (
		<div className="flex flex-col gap-1">
			<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
				{icon}
				{label}
			</div>
			<span className={`text-sm font-semibold tabular-nums ${valueColor}`}>{value}</span>
		</div>
	);
}

interface CoinDetailPanelProps {
	coinId: string;
	coinImage?: string;
	coinName?: string;
	coinSymbol?: string;
	stats: CoinStats;
	portfolioId: string;
}

export function CoinDetailPanel({ coinId, coinImage, coinName, coinSymbol, stats, portfolioId }: CoinDetailPanelProps) {
	const fmt = (n: number, decimals = 2) =>
		`$${n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

	const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

	return (
		<motion.div
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: 'auto' }}
			exit={{ opacity: 0, height: 0 }}
			transition={{ duration: 0.25, ease: 'easeInOut' }}
			className="overflow-hidden"
		>
			<div className="border-t bg-muted/30 px-4 py-4">
				{/* Header */}
				<div className="flex items-center gap-3 mb-4">
					{coinImage && (
						<Image src={coinImage} alt={coinName ?? coinId} width={32} height={32} className="rounded-full" />
					)}
					<div>
						<p className="font-semibold text-sm">{coinName ?? coinId}</p>
						{coinSymbol && <p className="text-xs text-muted-foreground">{coinSymbol.toUpperCase()}</p>}
					</div>
					<div className="ml-auto text-right">
						<p className="text-sm font-semibold tabular-nums">{fmt(stats.currentPrice)}</p>
						<p className={`text-xs font-medium ${stats.unrealizedPnLPct >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
							{fmtPct(stats.unrealizedPnLPct)}
						</p>
					</div>
				</div>

				{/* Stats row */}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-4">
					<StatItem
						label="Avg Buy"
						value={fmt(stats.avgCostBasis)}
						icon={<Wallet size={12} />}
					/>
					<StatItem
						label="Holdings"
						value={`${stats.qty.toLocaleString('en-US', { maximumFractionDigits: 8 })} ${coinSymbol?.toUpperCase() ?? ''}`}
						icon={<Coins size={12} />}
					/>
					<StatItem
						label="Current Value"
						value={fmt(stats.currentValue)}
						icon={<DollarSign size={12} />}
					/>
					<StatItem
						label="Unrealized P&L"
						value={`${fmt(stats.unrealizedPnL)} (${fmtPct(stats.unrealizedPnLPct)})`}
						positive={stats.unrealizedPnL >= 0}
						icon={stats.unrealizedPnL >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
					/>
					<StatItem
						label="Realized P&L"
						value={fmt(stats.realizedPnL)}
						positive={stats.realizedPnL === 0 ? null : stats.realizedPnL > 0}
						icon={<ArrowDownUp size={12} />}
					/>
					<StatItem
						label="Total Fees"
						value={fmt(stats.totalFees)}
						icon={<ReceiptText size={12} />}
					/>
				</div>

				<div className="border-t mb-4" />

				{/* Filtered transaction table */}
				<TransactionTable portfolioId={portfolioId} coinId={coinId} />
			</div>
		</motion.div>
	);
}
