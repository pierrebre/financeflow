'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCoinData, fetchPriceHistory } from '../../../lib/api';
import { Chart } from '@/components/chart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useEffect, useState } from 'react';
import { ChartInterval } from '@/types/Chart';
import { Star } from 'lucide-react';
import Converter from '@/components/converter';

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
	const [priceChangePercentage, setPriceChangePercentage] = useState<number | null>(coin?.price_change_percentage_24h ?? null);

	const {
		data: priceHistory,
		isLoading: isPriceHistoryLoading,
		error: priceHistoryError
	} = useQuery({
		queryKey: ['priceHistory', params.id, interval],
		queryFn: () => fetchPriceHistory(params.id, interval)
	});

	if (isPriceHistoryLoading) {
		return <div>Chargement...</div>;
	}

	if (priceHistoryError) {
		return <div>Erreur de chargement des données</div>;
	}

	const handleSelect = (value: ChartInterval) => {
		const percentageChangeMap: { [key: string]: number | null } = {
			'1': coin?.price_change_percentage_24h ?? null,
			'7': coin?.price_change_percentage_7d ?? null,
			'30': coin?.price_change_percentage_30d ?? null,
			'365': coin?.price_change_percentage_1y ?? null
		};
		setPriceChangePercentage(percentageChangeMap[value]);
		setInterval(value);
	};
	return (
		<main className="flex lg:flex-row flex-col">
			<section className="border-gray-200 lg:w-1/4">
				<div className="flex items-center gap-6 mb-2">
					<h1 className="scroll-m-20 text-3xl bold tracking-tight lg:text-4xl first-letter:capitalize">{params.id}</h1>
					<span className="bg-slate-200 p-1.5 rounded-lg">
						<Star className="text-gray-400 h-5 w-5 " />
					</span>
				</div>
				<p className="lg:text-2xl text-xl font-extrabold">
					{'$ ' + coin?.current_price?.toFixed(2)} <span className={`${coin?.price_change_percentage_24h != null && coin?.price_change_percentage_24h < 0 ? 'text-[#ea3943]' : 'text-[#16c784]'} font-medium lg:text-lg`}>{coin?.price_change_percentage_24h?.toFixed(2) ?? 'N/A'}%</span>
				</p>
				<div className="flex flex-col gap-2 my-6 text-[#acb0b9]">
					<p>
						Market Cap <span className="text-black">{coin?.market_cap.toFixed(2)} $</span>
					</p>
					<p>
						Circulating Supply{' '}
						<span className="text-black">
							{coin?.circulating_supply.toFixed(2)} {coin?.symbol.toUpperCase()}
						</span>
					</p>
					<p>
						Max supply <span className="text-black">{coin?.max_supply != null && coin?.max_supply > 0 ? coin.max_supply + ' ' + coin.symbol.toUpperCase() : '∞'}</span>
					</p>
				</div>
				{coin && <Converter Coin={coin} />}
			</section>
			<section className="lg:w-3/4 w-full lg:mt-0 mt-10">
				<ToggleGroup className="lg:justify-end mb-4" type="single" defaultValue="30" onValueChange={(value: ChartInterval) => handleSelect(value)}>
					<ToggleGroupItem value="1">1D</ToggleGroupItem>
					<ToggleGroupItem value="7">7D</ToggleGroupItem>
					<ToggleGroupItem value="30">30D</ToggleGroupItem>
					<ToggleGroupItem value="365">1Y</ToggleGroupItem>
				</ToggleGroup>
				<Chart priceData={priceHistory ?? []} unity={interval} priceChangePercentage={priceChangePercentage} />
			</section>
		</main>
	);
}
