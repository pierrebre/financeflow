'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChartInterval, Coin, DataPrice } from '@/schemas';
import { ArrowDown, ArrowUp, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Chart } from '@/components/chart';
import Converter from '@/components/converter';
import useFavorites from '@/lib/hooks/use-favorites';
import { CoinStats } from '@/components/coin/coin-stats';
import { AllTimeStats } from '@/components/coin/all-time-stats';
import { PriceHighLow } from '@/components/coin/price-high-low';
import { CoinPageSkeleton } from '@/components/skeletons/coin-page-skeleton';
import Image from 'next/image';

interface CoinPageProps {
	readonly params: {
		readonly id: string;
	};
}

export default function CoinPage({ params }: CoinPageProps) {
	const [interval, setInterval] = useState<ChartInterval>('30');
	const { favorites, toggleFavorite } = useFavorites();

	const queryClient = useQueryClient();

	const coin: Coin | undefined = queryClient.getQueryData(['coin', params.id]);
	const priceHistory: DataPrice[] | undefined = queryClient.getQueryData(['priceHistory', params.id, interval]);

	const [priceChangePercentage, setPriceChangePercentage] = useState<number | null>(coin?.price_change_percentage_30d ?? null);

	const handleIntervalSelect = (value: ChartInterval) => {
		const percentageChangeMap = {
			'1': coin?.price_change_percentage_24h,
			'7': coin?.price_change_percentage_7d,
			'30': coin?.price_change_percentage_30d,
			'365': coin?.price_change_percentage_1y
		};

		if (percentageChangeMap[value] === undefined) {
			return;
		}

		setPriceChangePercentage(percentageChangeMap[value] ?? null);
		setInterval(value);
	};

	const isLoading = !coin || !priceHistory;

	return (
		<div className="container mx-auto px-4 py-6">
			{isLoading ? (
				<CoinPageSkeleton />
			) : (
				<>
					<div className="flex flex-col md:flex-row justify-between items-start mb-6">
						<div className="flex items-center gap-4 mb-4 md:mb-0">
							{coin.image && <Image src={coin.image || '/placeholder.svg'} alt={coin.name} width={48} height={48} className="rounded-full" />}
							<div>
								<div className="flex items-center gap-3">
									<h1 className="text-3xl font-bold first-letter:uppercase">{coin.name}</h1>
									<Badge variant="outline" className="uppercase">
										{coin.symbol}
									</Badge>
									<Button variant="ghost" size="icon" onClick={() => toggleFavorite(params.id)} className="h-8 w-8">
										<Star className={`h-5 w-5 ${favorites.includes(params.id) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} aria-pressed={favorites.includes(params.id)} />
									</Button>
								</div>
								<div className="flex items-center gap-2 mt-1">
									<Badge variant="secondary">Rank #{coin.market_cap_rank}</Badge>
								</div>
							</div>
						</div>
					</div>

					<div className="flex flex-col lg:flex-row gap-6">
						<div className="w-full lg:w-1/4 space-y-6">
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-2xl font-bold">${coin.current_price.toLocaleString()}</CardTitle>
									<CardDescription className="flex items-center">
										<span className={`flex items-center ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
											{coin.price_change_percentage_24h >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
											{coin.price_change_percentage_24h.toFixed(2)}% (24h)
										</span>
									</CardDescription>
								</CardHeader>
								<CardContent>
									<PriceHighLow coin={coin} />
									<Converter Coin={coin} />
								</CardContent>
							</Card>

							<AllTimeStats coin={coin} />
						</div>

						<div className="w-full lg:w-3/4">
							<Tabs defaultValue="chart" className="w-full">
								<TabsList className="mb-4">
									<TabsTrigger value="chart">Price Chart</TabsTrigger>
									<TabsTrigger value="statistics">Statistics</TabsTrigger>
									<TabsTrigger value="about">About</TabsTrigger>
								</TabsList>

								<TabsContent value="chart" className="space-y-4">
									<ToggleGroup className="lg:justify-end mb-4" type="single" defaultValue="30" value={interval} onValueChange={handleIntervalSelect}>
										<ToggleGroupItem value="1">1D</ToggleGroupItem>
										<ToggleGroupItem value="7">7D</ToggleGroupItem>
										<ToggleGroupItem value="30">30D</ToggleGroupItem>
										<ToggleGroupItem value="365">1Y</ToggleGroupItem>
									</ToggleGroup>
									<Chart priceData={priceHistory} unity={interval} priceChangePercentage={priceChangePercentage} />
								</TabsContent>

								<TabsContent value="statistics">
									<Card>
										<CardHeader>
											<CardTitle>Market Statistics</CardTitle>
										</CardHeader>
										<CardContent>
											<CoinStats coin={coin} />
										</CardContent>
									</Card>
								</TabsContent>

								<TabsContent value="about">
									<Card>
										<CardHeader>
											<CardTitle>About {coin.name}</CardTitle>
										</CardHeader>
										<CardContent>
											<p className="text-muted-foreground">Information about {coin.name} would appear here. This could include a description, use cases, technology, team information, and more.</p>
										</CardContent>
									</Card>
								</TabsContent>
							</Tabs>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
