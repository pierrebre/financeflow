'use client';

import { useEffect, useState, useMemo } from 'react';
import { Pie, PieChart, Cell, LabelList, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Transaction } from '@/schemas';
import { useQuery } from '@tanstack/react-query';
import { getCoinsByPortfolio } from '@/actions/portfolio';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--chart-6, 210 100% 50%))', 'hsl(var(--chart-7, 260 100% 50%))', 'hsl(var(--chart-8, 300 100% 50%))'];

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

		const coinValues: Record<string, { value: number; coinId: string; name: string }> = {};
		let portfolioTotal = 0;

		transactions.forEach((transaction) => {
			if (transaction.type === 'ACHAT') {
				const portfolioCoinId = transaction.portfolioCoinId;
				const matchingCoin = coins.find((coin) => coin.id === portfolioCoinId);

				if (matchingCoin) {
					const coinId = matchingCoin.coinId;
					const value = transaction.amountUsd;

					if (!coinValues[coinId]) {
						coinValues[coinId] = {
							value: 0,
							coinId,
							name: coinId.charAt(0).toUpperCase() + coinId.slice(1)
						};
					}

					coinValues[coinId].value += value;
					portfolioTotal += value;
				}
			}
		});

		const data = Object.values(coinValues).map((item, index) => ({
			name: item.name,
			value: item.value,
			percentage: ((item.value / portfolioTotal) * 100).toFixed(1),
			fill: COLORS[index % COLORS.length]
		}));

		return { chartData: data, totalValue: portfolioTotal };
	}, [transactions, coins]);

	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-background p-2 border rounded shadow-sm">
					<p className="font-medium">{payload[0].name}</p>
					<p className="text-sm">{`${payload[0].value.toFixed(2)} USD (${payload[0].payload.percentage}%)`}</p>
				</div>
			);
		}
		return null;
	};

	return (
		<Card className="flex flex-col h-full">
			<CardHeader className="items-center pb-0">
				<CardTitle>Portfolio Allocation</CardTitle>
				<CardDescription>Total Value: {totalValue.toFixed(2)} USD</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 pb-0 pt-6">
				{chartData.length > 0 ? (
					<div className="w-full h-64">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value">
									{chartData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.fill} />
									))}
									<LabelList dataKey="percentage" position="inside" fill="#fff" fontSize={12} formatter={(value: any) => `${value}%`} />
								</Pie>
								<Tooltip content={<CustomTooltip />} />
							</PieChart>
						</ResponsiveContainer>
					</div>
				) : (
					<div className="flex items-center justify-center h-64 text-muted-foreground">No transaction data available</div>
				)}
			</CardContent>
			<div className="p-4 grid grid-cols-2 gap-2 text-sm">
				{chartData.map((entry, index) => (
					<div key={`legend-${index}`} className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }}></div>
						<span>
							{entry.name}: {entry.percentage}%
						</span>
					</div>
				))}
			</div>
		</Card>
	);
}
