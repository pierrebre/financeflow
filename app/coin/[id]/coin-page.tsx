'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCoinData, fetchPriceHistory } from '../../../lib/api';
import { Chart } from '@/components/chart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useState } from 'react';
import { ChartInterval } from '@/types/Chart';

type Props = {
	readonly params: {
		readonly id: string;
	};
};

export default function CoinPage({ params }: Props) {
	const { data: coin } = useQuery({
		queryKey: ['coin', params.id],
		queryFn: () => fetchCoinData(params.id)
	});

	const [interval, setInterval] = useState<ChartInterval>('30');

	const {
		data: priceHistory, isLoading: isPriceHistoryLoading,error: priceHistoryError} = useQuery({
		queryKey: ['priceHistory', params.id, interval],
		queryFn: () => fetchPriceHistory(params.id, interval)
	});

	if (isPriceHistoryLoading) {
		return <div>Chargement...</div>;
	}

	if (priceHistoryError) {
		return <div>Erreur de chargement des données</div>;
	}
	return (
		<main className="flex lg:flex-row flex-col">
			<section className="border-gray-200 lg:w-1/4">
				<h1 className="scroll-m-20 text-3xl bold tracking-tight lg:text-4xl first-letter:capitalize mb-2">{params.id}</h1>
				<p className="lg:text-2xl text-xl font-extrabold">
					{'$ ' + coin?.current_price.toFixed(2)} <span className="text-green-800 font-medium lg:text-lg">{coin?.price_change_percentage_24h.toFixed(2)}%</span>
				</p>
			</section>
			<section className="lg:w-3/4 w-full lg:mt-0 mt-10">
				<ToggleGroup className="lg:justify-end mb-4" type="single" defaultValue="30" onValueChange={(value) => setInterval(value as ChartInterval)}>
					<ToggleGroupItem value="1">1D</ToggleGroupItem>
					<ToggleGroupItem value="7">7D</ToggleGroupItem>
					<ToggleGroupItem value="30">30D</ToggleGroupItem>
					<ToggleGroupItem value="365">1Y</ToggleGroupItem>
				</ToggleGroup>
				<Chart priceData={priceHistory ?? []} unity={interval} />
			</section>
		</main>
	);
}
