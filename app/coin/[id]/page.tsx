import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/app/get-query-client';
import CoinPage from './coin-page';
import { getCoinData, getPriceHistory } from '@/src/actions/external/crypto';

type Props = {
	readonly params: {
		readonly id: string;
	};
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	try {
		const coin = await getCoinData(params.id);
		const priceChange = coin.price_change_percentage_24h >= 0
			? `+${coin.price_change_percentage_24h.toFixed(2)}%`
			: `${coin.price_change_percentage_24h.toFixed(2)}%`;
		const title = `${coin.name} (${coin.symbol.toUpperCase()})`;
		const description = `${coin.name} price today: $${coin.current_price.toLocaleString()} — ${priceChange} in the last 24h. Track ${coin.name} live charts, market cap, and statistics.`;

		return {
			title,
			description,
			openGraph: {
				title,
				description,
				images: coin.image ? [{ url: coin.image }] : []
			},
			twitter: {
				card: 'summary',
				title,
				description,
				images: coin.image ? [coin.image] : []
			}
		};
	} catch {
		return { title: params.id };
	}
}

export default async function Coin({ params }: Props) {
	const queryClient = getQueryClient();

	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ['coin', params.id],
			queryFn: () => getCoinData(params.id),
			staleTime: 30 * 1000
		}),

		...['30', '1', '7', '365'].map((period) =>
			queryClient.prefetchQuery({
				queryKey: ['priceHistory', params.id, period],
				queryFn: () => getPriceHistory(params.id, period),
				staleTime: 60 * 1000,
				gcTime: 5 * 60 * 1000
			})
		)
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<CoinPage params={params} />
		</HydrationBoundary>
	);
}
