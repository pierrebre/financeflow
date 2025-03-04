import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/app/get-query-client';
import CoinPage from './coin-page';
import { getCoinData, getPriceHistory } from '@/src/actions/external/crypto';

type Props = {
	readonly params: {
		readonly id: string;
	};
};

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
