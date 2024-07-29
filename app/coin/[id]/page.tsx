import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/app/get-query-client';
import CoinPage from './coin-page';
import { fetchCoinData, fetchPriceHistory } from '../../../lib/api';

type Props = {
	readonly params: {
		readonly id: string;
	};
};

export default async function Coin({ params }: Props) {
	const queryClient = getQueryClient();

	await queryClient.prefetchQuery({
		queryKey: ['coin', params.id],
		queryFn: () => fetchCoinData(params.id)
	});

	await queryClient.prefetchQuery({
		queryKey: ['priceHistory', params.id, '30'],
		queryFn: () => fetchPriceHistory(params.id, '30	')
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<CoinPage params={params} />
		</HydrationBoundary>
	);
}
