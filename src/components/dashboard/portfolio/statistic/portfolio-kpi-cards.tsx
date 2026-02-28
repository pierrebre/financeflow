'use client';

import { useMemo, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Card, CardContent } from '@/src/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Layers, Percent } from 'lucide-react';
import { useTransactions } from '../transaction/transaction-provider';
import { usePortfolioCoins } from '../asset/portfolio-coin-provider';
import { useQuery } from '@tanstack/react-query';
import { getCoinsWatchlist } from '@/src/actions/external/crypto';
import { computePortfolioMetrics } from '@/src/lib/portfolio-calculations';

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 2 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
	const motionVal = useMotionValue(0);
	const rounded = useTransform(motionVal, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`);
	const prevValue = useRef(0);

	useEffect(() => {
		const controls = animate(motionVal, value, {
			duration: 1.2,
			ease: 'easeOut'
		});
		prevValue.current = value;
		return controls.stop;
	}, [value, motionVal]);

	return <motion.span>{rounded}</motion.span>;
}

interface KpiCardProps {
	icon: React.ReactNode;
	label: string;
	value: number;
	prefix?: string;
	suffix?: string;
	decimals?: number;
	trend?: number | null;
	colorClass?: string;
	subtitle?: string;
}

function KpiCard({ icon, label, value, prefix = '$', suffix = '', decimals = 2, trend, colorClass = 'text-primary', subtitle }: KpiCardProps) {
	const isPositive = (trend ?? 0) >= 0;

	return (
		<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
			<Card className="h-full">
				<CardContent className="pt-5 pb-4 px-5">
					<div className="flex items-center justify-between mb-3">
						<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
						<div className={`p-2 rounded-md bg-muted ${colorClass}`}>{icon}</div>
					</div>
					<div className={`text-2xl font-bold ${colorClass}`}>
						<AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
					</div>
					{trend !== null && trend !== undefined && (
						<div className={`flex items-center gap-1 mt-1 text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
							{isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
							<AnimatedNumber value={Math.abs(trend)} prefix="" suffix="%" decimals={2} />
						</div>
					)}
					{subtitle && !trend && (
						<p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}

export function PortfolioKpiCards() {
	const { optimisticTransactions } = useTransactions();
	const { optimisticPortfolioCoins } = usePortfolioCoins();

	const coinIds = optimisticPortfolioCoins.map((c) => c.coinId);

	const { data: coinsData = [] } = useQuery({
		queryKey: ['coins-data', coinIds],
		queryFn: () => (coinIds.length > 0 ? getCoinsWatchlist(coinIds) : Promise.resolve([])),
		enabled: coinIds.length > 0,
		refetchInterval: 60_000
	});

	const metrics = useMemo(() => {
		const priceMap: Record<string, number> = {};
		for (const coin of coinsData) {
			priceMap[coin.id] = coin.current_price ?? 0;
		}
		return computePortfolioMetrics(optimisticTransactions, priceMap);
	}, [optimisticTransactions, coinsData]);

	const cards: KpiCardProps[] = [
		{
			icon: <DollarSign size={16} />,
			label: 'Portfolio Value',
			value: metrics.totalCurrentValue,
			colorClass: 'text-blue-500'
		},
		{
			icon: <Layers size={16} />,
			label: 'Total Invested',
			value: metrics.totalInvested,
			colorClass: 'text-violet-500',
			subtitle: `${metrics.assetCount} asset${metrics.assetCount !== 1 ? 's' : ''}`
		},
		{
			icon: metrics.unrealizedPnL >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />,
			label: 'Unrealized P&L',
			value: metrics.unrealizedPnL,
			trend: metrics.unrealizedPnLPct,
			colorClass: metrics.unrealizedPnL >= 0 ? 'text-emerald-500' : 'text-red-500'
		},
		{
			icon: metrics.realizedPnL >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />,
			label: 'Realized P&L',
			value: metrics.realizedPnL,
			colorClass: metrics.realizedPnL >= 0 ? 'text-emerald-500' : 'text-red-500',
			subtitle: 'FIFO method'
		},
		{
			icon: <Percent size={16} />,
			label: 'Total ROI',
			value: metrics.totalROI,
			prefix: '',
			suffix: '%',
			colorClass: metrics.totalROI >= 0 ? 'text-amber-500' : 'text-red-500'
		}
	];

	return (
		<div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
			{cards.map((card) => (
				<KpiCard key={card.label} {...card} />
			))}
		</div>
	);
}
