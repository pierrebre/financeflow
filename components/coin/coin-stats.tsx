'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, ArrowUp, ArrowDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Coin } from '@/schemas';

export const CoinStats = ({ coin }: { readonly coin: Coin }) => (
	<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
		<Card>
			<CardContent className="pt-6">
				<div className="flex justify-between items-center mb-2">
					<span className="text-muted-foreground">Market Cap</span>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Info className="h-4 w-4 text-muted-foreground" />
							</TooltipTrigger>
							<TooltipContent>
								<p>Total market value of the coin in USD</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<p className="text-xl font-semibold">${coin?.market_cap.toLocaleString()}</p>
				<span className={`text-xs ${coin?.market_cap_change_percentage_24h >= 0 ? 'text-emerald-500' : 'text-red-500'} flex items-center`}>
					{coin?.market_cap_change_percentage_24h >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
					{coin?.market_cap_change_percentage_24h.toFixed(2)}% (24h)
				</span>
			</CardContent>
		</Card>

		<Card>
			<CardContent className="pt-6">
				<div className="flex justify-between items-center mb-2">
					<span className="text-muted-foreground">Volume (24h)</span>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Info className="h-4 w-4 text-muted-foreground" />
							</TooltipTrigger>
							<TooltipContent>
								<p>Total trading volume in the last 24 hours</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<p className="text-xl font-semibold">${coin?.total_volume.toLocaleString()}</p>
			</CardContent>
		</Card>

		<Card>
			<CardContent className="pt-6">
				<div className="flex justify-between items-center mb-2">
					<span className="text-muted-foreground">Circulating Supply</span>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Info className="h-4 w-4 text-muted-foreground" />
							</TooltipTrigger>
							<TooltipContent>
								<p>The amount of coins currently in circulation</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<p className="text-xl font-semibold">
					{coin?.circulating_supply.toLocaleString()} {coin?.symbol.toUpperCase()}
				</p>
				{coin?.max_supply != null && coin?.max_supply > 0 ? (
					<div className="mt-2">
						<div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
							<span>Supply</span>
							<span>{(((coin?.circulating_supply ?? 0) / (coin?.max_supply ?? 0)) * 100).toFixed(2)}%</span>
						</div>
						<Progress className="h-2" value={((coin?.circulating_supply ?? 0) / (coin?.max_supply ?? 0)) * 100} />
					</div>
				) : null}
			</CardContent>
		</Card>

		<Card>
			<CardContent className="pt-6">
				<div className="flex justify-between items-center mb-2">
					<span className="text-muted-foreground">Max Supply</span>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Info className="h-4 w-4 text-muted-foreground" />
							</TooltipTrigger>
							<TooltipContent>
								<p>The maximum amount of coins that will ever exist</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<p className="text-xl font-semibold">{coin?.max_supply != null && coin?.max_supply > 0 ? `${coin.max_supply.toLocaleString()} ${coin.symbol.toUpperCase()}` : '∞'}</p>
			</CardContent>
		</Card>
	</div>
);
