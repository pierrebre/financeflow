'use client';

import { TrendingDown, TrendingUp, Info, Calendar, DollarSign } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, YAxis, ReferenceLine, Tooltip, type TooltipProps } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartInterval, DataPrice } from '@/schemas';
import { getPeriod } from '@/lib/utils';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type Props = {
	readonly priceData: DataPrice[];
	readonly unity: ChartInterval;
	readonly priceChangePercentage: number | null;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
	if (active && payload && payload.length) {
		return (
			<div className="bg-background border border-border rounded-lg shadow-lg p-2 flex flex-col gap-1">
				<p className="text-xs text-muted-foreground">{label}</p>
				<div className="flex items-center gap-1">
					<DollarSign className="h-3 w-3 text-primary" />
					<span className="font-semibold text-foreground text-sm">{payload[0].value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
				</div>
			</div>
		);
	}
	return null;
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

	const isPositive = priceChangePercentage !== null && priceChangePercentage > 0;
	const priceChangeColor = isPositive ? 'text-green-500' : 'text-red-500';

	const gradientDef = useMemo(
		() => (
			<linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stopColor={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'} stopOpacity={0.3} />
				<stop offset="100%" stopColor={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'} stopOpacity={0} />
			</linearGradient>
		),
		[isPositive]
	);

	return (
		<Card className="w-full mb-4 border-border shadow-sm overflow-hidden">
			<CardHeader className="pb-2 px-3 pt-3">
				<div className="flex justify-between items-center">
					<CardTitle className="text-lg flex items-center gap-1.5">
						Price Chart
						<TooltipProvider>
							<UITooltip>
								<TooltipTrigger asChild>
									<Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
										<Info className="h-3.5 w-3.5 text-muted-foreground" />
										<span className="sr-only">Chart information</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									<p className="text-xs">Historical price data</p>
								</TooltipContent>
							</UITooltip>
						</TooltipProvider>
					</CardTitle>

					<CardDescription className="flex items-center gap-1 text-xs">
						<Calendar className="h-3 w-3 text-muted-foreground" />
						Last {period}
					</CardDescription>
				</div>
			</CardHeader>

			<CardContent className="p-0">
				<div className="w-full h-[380px]">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={priceData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
							<defs>{gradientDef}</defs>

							<YAxis
								dataKey="price"
								orientation="right"
								domain={[domainMin, domainMax]}
								axisLine={false}
								tickLine={false}
								tickCount={5}
								tickFormatter={(value) => `$${value.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 })}`}
								fontSize={10}
								width={40}
								tick={{ fill: 'hsl(var(--muted-foreground))' }}
							/>

							<CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" opacity={0.5} />

							<ReferenceLine
								y={currentPrice}
								stroke="hsl(var(--muted-foreground))"
								strokeDasharray="3 3"
								label={{
									value: 'Current',
									position: 'insideRight',
									fill: 'hsl(var(--muted-foreground))',
									fontSize: 10,
									offset: 5
								}}
							/>

							<Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 10 }} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }} />

							<Area
								type="monotone"
								dataKey="price"
								stroke={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
								fill="url(#gradientArea)"
								strokeWidth={2}
								dot={false}
								activeDot={{
									r: 4,
									fill: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
									strokeWidth: 2,
									stroke: 'hsl(var(--background))',
									className: 'touch-none'
								}}
								isAnimationActive={true}
								animationDuration={750}
								animationBegin={0}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</CardContent>

			<CardFooter className="border-t py-3 px-3 flex justify-between items-center bg-muted/50">
				<div className="flex items-center gap-2">
					<Badge variant="outline" className="font-medium text-sm">
						<DollarSign className="h-3 w-3 mr-0.5" />
						{currentPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
					</Badge>

					{priceChangePercentage !== null && (
						<Badge variant={isPositive ? 'default' : 'destructive'} className={cn('font-medium text-xs', isPositive ? 'bg-green-500' : 'bg-red-500')}>
							{isPositive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
							{Math.abs(priceChangePercentage).toFixed(2)}%
						</Badge>
					)}
				</div>
			</CardFooter>
		</Card>
	);
}
