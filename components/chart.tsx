'use client';

import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DataPrice } from '@/types/Coin';
import { ChartInterval } from '@/types/Chart';

const chartConfig = {
	price: {
		label: 'Price',
		color: 'hsl(var(--chart-1))'
	}
} satisfies ChartConfig;

type Props = {
	readonly priceData: DataPrice[];
	readonly unity: ChartInterval;
};

export function Chart({ priceData, unity }: Props) {
	return (
		<Card>
			<CardHeader className="flex lg:flex-row justify-between">
				<div className="lg:mb-0 mb-4">
					<CardTitle>Price Chart</CardTitle>
					<CardDescription>Showing total visitors for the last 6 months</CardDescription>
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
						<XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} /> <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
						<Area dataKey="price" type="natural" fill="var(--color-desktop)" fillOpacity={0.4} stroke="var(--color-desktop)" />
					</AreaChart>
				</ChartContainer>
			</CardContent>
			<CardFooter>
				<div className="flex w-full items-start gap-2 text-sm">
					<div className="grid gap-2">
						<div className="flex items-center gap-2 font-medium leading-none">
							Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
						</div>
						<div className="flex items-center gap-2 leading-none text-muted-foreground">January - June 2024</div>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
}
