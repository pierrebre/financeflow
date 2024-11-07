'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ChartInterval, DataPrice } from '@/schemas';
import { getDateRangeMessage } from '@/lib/utils';

const chartConfig = {
	price: {
		label: 'Price',
		color: 'hsl(var(--chart-1))'
	}
} satisfies ChartConfig;

type Props = {
	readonly priceData: DataPrice[];
	readonly unity: ChartInterval;
	readonly priceChangePercentage: number | null;
};

export function Chart({ priceData, unity, priceChangePercentage }: Props) {
	const period = unity === '1' ? 'day' : unity === '7' ? 'week' : unity === '30' ? 'month' : 'year';

	return (
		<Card>
			<CardHeader className="flex lg:flex-row justify-between">
				<div className="lg:mb-0 mb-4">
					<CardTitle>Price Chart</CardTitle>
					<CardDescription>Showing the price for the last {period}</CardDescription>
				</div>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<AreaChart
						accessibilityLayer
						data={priceData}
						margin={{
							left: 12,
							right: 12
						}}
					>
						<CartesianGrid vertical={false} />
						<XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 20)} />
						<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
						<Area dataKey="price" type="natural" fill="var(--color-desktop)" fillOpacity={0.4} stroke="var(--color-desktop)" />
					</AreaChart>
				</ChartContainer>
			</CardContent>
			<CardFooter>
				<div className="flex w-full items-start gap-2 text-sm">
					<div className="grid gap-2">
						<div className="flex items-center gap-2 font-medium leading-none">
							{priceChangePercentage !== null && priceChangePercentage !== undefined ? (
								<>
									{priceChangePercentage > 0 ? 'Trending up' : 'Trending down'} by {priceChangePercentage.toFixed(2)}% last {period} {priceChangePercentage < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
								</>
							) : (
								'Price change data unavailable'
							)}
						</div>
						<div className="flex items-center gap-2 leading-none text-muted-foreground">{getDateRangeMessage(unity)}</div>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
}
