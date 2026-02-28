'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCryptoMarketData } from '@/src/actions/external/crypto';
import { Coin } from '@/src/schemas/';
import { TrendingUp, TrendingDown } from 'lucide-react';

function TickerItem({ coin }: { coin: Coin }) {
	const isPositive = coin.price_change_percentage_24h >= 0;
	return (
		<span className="inline-flex items-center gap-2 mx-6 whitespace-nowrap text-sm font-medium">
			<span className="text-muted-foreground">{coin.symbol.toUpperCase()}</span>
			<span>${coin.current_price.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
			<span className={`inline-flex items-center gap-0.5 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
				{isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
				{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
			</span>
		</span>
	);
}

export function PriceTicker() {
	const { data, isLoading } = useQuery<Coin[], Error>({
		// Share query key with home page — React Query deduplicates the network request
		queryKey: ['cryptos', 1],
		queryFn: () => fetchCryptoMarketData(1),
		staleTime: 60 * 1000,
		refetchInterval: 60 * 1000
	});

	if (isLoading || !data?.length) {
		return (
			<div className="border-b border-border bg-muted/40 overflow-hidden h-8 flex items-center">
				<div className="animate-pulse h-3 w-64 bg-muted rounded mx-4" />
			</div>
		);
	}

	const doubled = [...data, ...data];

	return (
		<div className="border-b border-border bg-muted/30 overflow-hidden h-9 flex items-center" aria-label="Live crypto prices ticker">
			<div className="flex animate-ticker will-change-transform">
				{doubled.map((coin, i) => (
					<TickerItem key={`${coin.id}-${i}`} coin={coin} />
				))}
			</div>
		</div>
	);
}
