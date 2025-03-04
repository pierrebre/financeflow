'use client';

import { useMemo } from 'react';
import { Pie, PieChart, Cell, LabelList, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Transaction } from '@/src/schemas/';
import { useQuery } from '@tanstack/react-query';
import { getCoinsByPortfolio } from '@/src/repositories/portfolio';

import { motion } from 'framer-motion';

const COLORS = ['hsl(215, 100%, 50%)', 'hsl(280, 100%, 60%)', 'hsl(30, 100%, 55%)', 'hsl(340, 100%, 55%)', 'hsl(190, 100%, 45%)', 'hsl(60, 100%, 45%)', 'hsl(320, 100%, 45%)'];

export function PortfolioAllocationChart({ portfolioId, transactions }: { portfolioId: string; transactions: Transaction[] }) {
	const { data: coins = [] } = useQuery({
		queryKey: ['portfolio-coins', portfolioId],
		queryFn: () => getCoinsByPortfolio(portfolioId),
		enabled: !!portfolioId
	});

	const { chartData, totalValue } = useMemo(() => {
		if (!transactions || !coins || coins.length === 0) {
			return { chartData: [], totalValue: 0 };
		}

		const coinBalances: Record<string, { value: number; coinId: string; name: string; transactions: number }> = {};

		transactions.forEach((transaction) => {
			const portfolioCoinId = transaction.portfolioCoinId;
			const matchingCoin = coins.find((coin) => coin.id === portfolioCoinId);

			if (matchingCoin) {
				const coinId = matchingCoin.coinId;
				const amount = transaction.amountUsd;
				const multiplier = transaction.type === 'ACHAT' ? 1 : -1; // 'ACHAT' means 'BUY' in French

				if (!coinBalances[coinId]) {
					coinBalances[coinId] = {
						value: 0,
						coinId,
						name: matchingCoin.coin?.name || coinId.charAt(0).toUpperCase() + coinId.slice(1),
						transactions: 0
					};
				}

				coinBalances[coinId].value += amount * multiplier;
				coinBalances[coinId].transactions += 1;
			}
		});

		// Filter out coins with negative or zero balances
		const positiveBalances = Object.values(coinBalances)
			.filter((item) => item.value > 0)
			.sort((a, b) => b.value - a.value);

		const portfolioTotal = positiveBalances.reduce((total, item) => total + item.value, 0);

		const data = positiveBalances.map((item, index) => ({
			name: item.name,
			value: item.value,
			transactions: item.transactions,
			percentage: ((item.value / portfolioTotal) * 100).toFixed(1),
			fill: COLORS[index % COLORS.length]
		}));

		return { chartData: data, totalValue: portfolioTotal };
	}, [transactions, coins]);

	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-3 border rounded shadow-lg">
					<p className="font-medium">{payload[0].name}</p>
					<p className="text-sm font-semibold">{`${payload[0].value.toFixed(2)} USD`}</p>
					<p className="text-sm">{`${payload[0].payload.percentage}% of portfolio`}</p> {/* Changed from "du portfolio" to "of portfolio" */}
					<p className="text-xs text-gray-500">{`${payload[0].payload.transactions} transaction(s)`}</p>
				</div>
			);
		}
		return null;
	};

	return (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
			<Card className="flex flex-col h-full overflow-hidden">
				<CardHeader className="items-center pb-0">
					<CardTitle>Portfolio Allocation</CardTitle> {/* Changed from "Allocation du Portfolio" */}
					<CardDescription>Total Value: {totalValue.toFixed(2)} USD</CardDescription> {/* Changed from "Valeur Totale" */}
				</CardHeader>
				<CardContent className="flex-1 pb-0 pt-6">
					{chartData.length > 0 ? (
						<div className="w-full h-64">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value" animationDuration={750} animationBegin={0}>
										{chartData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.fill} />
										))}
										<LabelList dataKey="percentage" position="inside" fill="#fff" fontSize={12} stroke="none" formatter={(value: any) => `${value}%`} />
									</Pie>
									<Tooltip content={<CustomTooltip />} />
								</PieChart>
							</ResponsiveContainer>
						</div>
					) : (
						<div className="flex items-center justify-center h-64 text-muted-foreground">Insufficient data to generate chart</div>
					)}
				</CardContent>
				<div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
					{chartData.map((entry, index) => (
						<div key={`legend-${index}`} className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }}></div>
							<span className="truncate">
								{entry.name}: {entry.percentage}%
							</span>
						</div>
					))}
				</div>
			</Card>
		</motion.div>
	);
}
