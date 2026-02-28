'use client';

import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	type TooltipProps
} from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/src/components/ui/toggle-group';
import { Skeleton } from '@/src/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getPriceHistory } from '@/src/actions/external/crypto';
import { useTransactions } from '../transaction/transaction-provider';
import { usePortfolioCoins } from '../asset/portfolio-coin-provider';
import { ChartInterval } from '@/src/schemas/';

type PeriodPoint = { date: string; value: number };

// Calculate holdings for a given coinId at or before a given date string
function holdingsAt(
	transactions: ReturnType<typeof useTransactions>['optimisticTransactions'],
	coinId: string,
	beforeDateStr: string
): number {
	let qty = 0;
	for (const tx of transactions) {
		if (tx.portfolioCoin?.coinId !== coinId) continue;
		const txDate = tx.date ? new Date(tx.date).getTime() : 0;
		// Use a rough date comparison — we match date string prefix
		const chartDate = new Date(beforeDateStr.split('/').reverse().join('-')).getTime();
		if (txDate <= chartDate || txDate === 0) {
			qty += tx.type === 'ACHAT' ? tx.quantityCrypto : -tx.quantityCrypto;
		}
	}
	return Math.max(0, qty);
}

const PERIOD_LABELS: Record<ChartInterval, string> = {
	'1': '1D',
	'7': '7D',
	'30': '1M',
	'365': '1Y'
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
	if (!active || !payload?.length) return null;
	const value = payload[0]?.value as number;
	return (
		<div className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2 text-sm">
			<p className="text-muted-foreground mb-0.5">{label}</p>
			<p className="font-semibold">${value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
		</div>
	);
};

export function PortfolioHistoryChart() {
	const [interval, setInterval] = useState<ChartInterval>('30');
	const { optimisticTransactions } = useTransactions();
	const { optimisticPortfolioCoins } = usePortfolioCoins();

	const coinIds = optimisticPortfolioCoins.map((c) => c.coinId);

	// Fetch price history for each coin in parallel
	const priceHistoryQueries = useQueries({
		queries: coinIds.map((coinId) => ({
			queryKey: ['priceHistory', coinId, interval],
			queryFn: () => getPriceHistory(coinId, interval),
			staleTime: 60_000,
			enabled: coinIds.length > 0
		}))
	});

	const isLoading = priceHistoryQueries.some((q) => q.isLoading);
	const isError = priceHistoryQueries.some((q) => q.isError);

	const chartData = useMemo<PeriodPoint[]>(() => {
		if (!coinIds.length || isLoading) return [];

		// Use the first coin's dates as the timeline baseline
		const baseHistory = priceHistoryQueries[0]?.data;
		if (!baseHistory?.length) return [];

		return baseHistory.map(({ month: date }) => {
			let totalValue = 0;

			for (let i = 0; i < coinIds.length; i++) {
				const coinId = coinIds[i];
				const history = priceHistoryQueries[i]?.data;
				if (!history?.length) continue;

				// Find the price closest to this date
				const point = history.find((p) => p.month === date) ?? history[i];
				const price = point?.price ?? 0;
				const qty = holdingsAt(optimisticTransactions, coinId, date);

				totalValue += qty * price;
			}

			return { date, value: Math.max(0, totalValue) };
		});
	}, [coinIds, priceHistoryQueries, optimisticTransactions, isLoading]);

	// Performance metrics
	const { startValue, endValue, change, changePct, isPositive } = useMemo(() => {
		if (chartData.length < 2) return { startValue: 0, endValue: 0, change: 0, changePct: 0, isPositive: true };
		const start = chartData[0].value;
		const end = chartData[chartData.length - 1].value;
		const diff = end - start;
		const pct = start > 0 ? (diff / start) * 100 : 0;
		return { startValue: start, endValue: end, change: diff, changePct: pct, isPositive: diff >= 0 };
	}, [chartData]);

	const gradientColor = isPositive ? '#10b981' : '#ef4444';

	if (!coinIds.length) return null;

	return (
		<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
			<Card className="w-full">
				<CardHeader className="flex flex-row items-start justify-between pb-2">
					<div>
						<CardTitle className="text-base font-semibold">Portfolio Performance</CardTitle>
						{!isLoading && chartData.length > 1 && (
							<CardDescription className="flex items-center gap-1.5 mt-1">
								<span className={`font-semibold ${isPositive ? 'text-emerald-500' : 'text-red-500'} flex items-center gap-1`}>
									{isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
									{isPositive ? '+' : ''}{change.toFixed(2)} USD ({changePct.toFixed(2)}%)
								</span>
								<span className="text-muted-foreground">over selected period</span>
							</CardDescription>
						)}
					</div>
					<ToggleGroup
						type="single"
						value={interval}
						onValueChange={(v) => v && setInterval(v as ChartInterval)}
						size="sm"
					>
						{(Object.keys(PERIOD_LABELS) as ChartInterval[]).map((key) => (
							<ToggleGroupItem key={key} value={key} className="text-xs px-2 h-7">
								{PERIOD_LABELS[key]}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</CardHeader>

				<CardContent className="pt-2">
					{isLoading ? (
						<Skeleton className="h-48 w-full" />
					) : isError ? (
						<div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
							Failed to load price history
						</div>
					) : chartData.every((d) => d.value === 0) ? (
						<div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
							No price data available for this period
						</div>
					) : (
						<div className="h-52">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
									<defs>
										<linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor={gradientColor} stopOpacity={0.25} />
											<stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
									<XAxis
										dataKey="date"
										tickLine={false}
										axisLine={false}
										tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
										interval="preserveStartEnd"
									/>
									<YAxis
										tickLine={false}
										axisLine={false}
										tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
										tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}`}
										width={55}
									/>
									<Tooltip content={<CustomTooltip />} />
									<Area
										type="monotone"
										dataKey="value"
										stroke={gradientColor}
										strokeWidth={2}
										fill="url(#portfolioGradient)"
										dot={false}
										activeDot={{ r: 4, strokeWidth: 0 }}
										animationDuration={600}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}
