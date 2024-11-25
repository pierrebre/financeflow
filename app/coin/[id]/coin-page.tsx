'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getCoinData, getPriceHistory } from '@/data/coin';
import { ChartInterval, Coin } from '@/schemas';

import { Chart } from '@/components/chart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';
import Converter from '@/components/converter';

import useFavorites from '@/lib/hooks/use-favorites';

interface CoinPageProps {
	readonly params: {
		readonly id: string;
	};
}

const CoinStats = ({ Coin }: { readonly Coin: Coin }) => (
	<div className="flex flex-col gap-2 my-6 text-[#acb0b9]">
		<p>
			Market Cap <span className="text-black">{Coin?.market_cap.toFixed(2)} $</span>
		</p>
		<div>
			Circulating Supply{' '}
			<span className="text-black">
				{Coin?.circulating_supply.toFixed(2)} {Coin?.symbol.toUpperCase()}
			</span>
			{Coin?.max_supply != null && Coin?.max_supply > 0 ? (
				<div className="flex items-end">
					<Progress className="w-[60%] my-2 h-3 mr-4" value={((Coin?.circulating_supply ?? 0) / (Coin?.max_supply ?? 0)) * 100} />
					{(((Coin?.circulating_supply ?? 0) / (Coin?.max_supply ?? 0)) * 100).toFixed(2)}%
				</div>
			) : null}
		</div>
		<p>
			Max supply <span className="text-black">{Coin?.max_supply != null && Coin?.max_supply > 0 ? Coin.max_supply + ' ' + Coin.symbol.toUpperCase() : '∞'}</span>
		</p>
	</div>
);

export default function CoinPage({ params }: CoinPageProps) {
	const [interval, setInterval] = useState<ChartInterval>('30');
	const { favorites, toggleFavorite } = useFavorites();

	const { data: coin, isLoading: isCoinLoading } = useQuery({
		queryKey: ['coin', params.id],
		queryFn: () => getCoinData(params.id)
	});

	const [priceChangePercentage, setPriceChangePercentage] = useState<number | null>(coin?.price_change_percentage_24h ?? null);

	const {
		data: priceHistory,
		isLoading: isPriceHistoryLoading,
		error: priceHistoryError
	} = useQuery({
		queryKey: ['priceHistory', params.id, interval],
		queryFn: () => getPriceHistory(params.id, interval)
	});

	const handleIntervalSelect = (value: ChartInterval) => {
		const percentageChangeMap = {
			'1': coin?.price_change_percentage_24h,
			'7': coin?.price_change_percentage_7d,
			'30': coin?.price_change_percentage_30d,
			'365': coin?.price_change_percentage_1y
		};
		setPriceChangePercentage(percentageChangeMap[value] ?? null);
		setInterval(value);
	};

	if (isPriceHistoryLoading || isCoinLoading) {
		return <div>Chargement...</div>;
	}

	if (priceHistoryError) {
		return <div>Erreur de chargement des données</div>;
	}

	return (
		<main className="flex lg:flex-row flex-col">
			<section className="border-gray-200 lg:w-1/4">
				<div className="flex items-center gap-6 mb-2">
					<h1 className="scroll-m-20 text-3xl bold tracking-tight lg:text-4xl first-letter:capitalize">{params.id}</h1>
					<button className="bg-slate-200 p-1.5 rounded-lg" onClick={() => toggleFavorite(params.id)}>
						<Star className={`text-[#a6b1c2] h-5 w-5 ${favorites.includes(params.id) ? 'fill-[#f6b87e] text-[#f6b87e]' : ''}`} aria-pressed={favorites.includes(params.id)} />
					</button>
				</div>
				<p className="lg:text-2xl text-xl font-extrabold">
					{'$ ' + coin?.current_price?.toFixed(2)} <span className={`${coin?.price_change_percentage_24h != null && coin?.price_change_percentage_24h < 0 ? 'text-[#db121c]' : 'text-[#1d5a2e]'} font-medium lg:text-lg`}>{coin?.price_change_percentage_24h?.toFixed(2) ?? 'N/A'}%</span>
				</p>
				{coin && <CoinStats Coin={coin} />}
				{coin && <Converter Coin={coin} />}
			</section>
			<section className="lg:w-3/4 w-full lg:mt-0 mt-10">
				<ToggleGroup className="lg:justify-end mb-4" type="single" defaultValue="30" onValueChange={handleIntervalSelect}>
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
