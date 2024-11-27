'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, YAxis, ReferenceLine, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartInterval, DataPrice } from '@/schemas';
import { getPeriod } from '@/lib/utils';

type Props = {
	readonly priceData: DataPrice[];
	readonly unity: ChartInterval;
	readonly priceChangePercentage: number | null;
};

export function Chart({ priceData, unity, priceChangePercentage }: Props) {
	const period = getPeriod(unity);
	const currentPrice = priceData[priceData.length - 1]?.price;

	const prices = priceData.map((d) => d.price);
	const minPrice = Math.min(...prices);
	const maxPrice = Math.max(...prices);
	const priceDiff = maxPrice - minPrice;
	const domainMin = minPrice - priceDiff * 0.1;
	const domainMax = maxPrice + priceDiff * 0.1;

	return (
		<Card className="w-full  mb-8">
			<CardHeader>
				<CardTitle>Price Chart</CardTitle>
				<CardDescription>Showing the price for the last {period}</CardDescription>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={400}>
					<AreaChart data={priceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
						<defs>
							<linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
								<stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
							</linearGradient>
						</defs>

						<YAxis dataKey="price" orientation="right" domain={[domainMin, domainMax]} axisLine={false} tickLine={false} tickCount={8} tickFormatter={(value) => `$${value.toFixed(2)}`} fontSize={12} width={80} tick={{ fill: '#6B7280' }} />

						<CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" opacity={0.5} />

						<ReferenceLine y={currentPrice} stroke="#9CA3AF" strokeDasharray="3 3" />

						<Tooltip
							contentStyle={{
								backgroundColor: '#fff',
								border: '1px solid #E5E7EB',
								borderRadius: '6px',
								padding: '8px'
							}}
							formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
						/>

						<Area type="monotone" dataKey="price" stroke="#22C55E" fill="url(#gradientArea)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#22C55E' }} isAnimationActive={true} animationDuration={750} animationBegin={0} />
					</AreaChart>
				</ResponsiveContainer>
			</CardContent>
			<CardFooter className="border-t">
				<div className="flex items-center gap-2 mt-6">
					{priceChangePercentage !== null && (
						<>
							<span className="flex items-center gap-1">
								{priceChangePercentage > 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
								{Math.abs(priceChangePercentage).toFixed(2)}%
							</span>
							<span className="text-muted-foreground">in the last {period}</span>
						</>
					)}
				</div>
			</CardFooter>
		</Card>
	);
}
