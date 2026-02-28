'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Coin } from '@/src/schemas/';

interface TopMoversProps {
	coins: Coin[];
}

function MoverRow({ coin, rank }: { coin: Coin; rank: number }) {
	const isPositive = coin.price_change_percentage_24h >= 0;

	return (
		<motion.div
			initial={{ opacity: 0, x: -8 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: rank * 0.06 }}
		>
			<Link
				href={`/coin/${coin.id}`}
				className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-muted/50 transition-colors group"
			>
				<div className="flex items-center gap-3 min-w-0">
					<span className="text-xs text-muted-foreground w-4 shrink-0">{rank + 1}</span>
					<Image src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full shrink-0" />
					<div className="min-w-0">
						<p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{coin.name}</p>
						<p className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</p>
					</div>
				</div>
				<div className="text-right shrink-0 ml-2">
					<p className="text-sm font-medium tabular-nums">
						${coin.current_price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
					</p>
					<span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
						{isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
						{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
					</span>
				</div>
			</Link>
		</motion.div>
	);
}

export function TopMovers({ coins }: TopMoversProps) {
	const { gainers, losers } = useMemo(() => {
		if (!coins.length) return { gainers: [], losers: [] };

		const sorted = [...coins].sort(
			(a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)
		);

		return {
			gainers: sorted.slice(0, 3),
			losers: sorted.slice(-3).reverse()
		};
	}, [coins]);

	if (!coins.length) return null;

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
			<Card>
				<CardHeader className="pb-2 pt-4 px-4">
					<CardTitle className="text-sm font-semibold flex items-center gap-2">
						<Flame size={14} className="text-emerald-500" />
						Top Gainers (24h)
					</CardTitle>
				</CardHeader>
				<CardContent className="px-4 pb-3">
					{gainers.map((coin, i) => (
						<MoverRow key={coin.id} coin={coin} rank={i} />
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2 pt-4 px-4">
					<CardTitle className="text-sm font-semibold flex items-center gap-2">
						<TrendingDown size={14} className="text-red-500" />
						Top Losers (24h)
					</CardTitle>
				</CardHeader>
				<CardContent className="px-4 pb-3">
					{losers.map((coin, i) => (
						<MoverRow key={coin.id} coin={coin} rank={i} />
					))}
				</CardContent>
			</Card>
		</div>
	);
}
