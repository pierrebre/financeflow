'use client';

import { fetchCryptos } from '@/src/actions/external/crypto';
import { columns } from '@/src/components/dataTable/columns';
import { DataTable } from '@/src/components/dataTable/data-table';
import { TopMovers } from '@/src/components/top-movers';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Coin } from '@/src/schemas/';
import { useIntersectionObserver } from '@/src/hooks/use-intersection-observer';

export default function Home() {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError, isLoading } = useInfiniteQuery<Coin[], Error>({
		queryKey: ['cryptos'],
		queryFn: ({ pageParam = 1 }) => fetchCryptos({ pageParam: pageParam as number }),
		getNextPageParam: (lastPage, pages) => (pages.length < 5 && lastPage.length === 20 ? pages.length + 1 : undefined),
		initialPageParam: 1,
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000
	});

	const cryptoData = data?.pages.flatMap((page) => page) ?? [];
	// First page data is available for the Top Movers widget (zero extra API calls)
	const firstPage = data?.pages[0] ?? [];

	const { observerRef } = useIntersectionObserver({
		onIntersect: () => {
			if (hasNextPage && !isFetchingNextPage && !isError) {
				fetchNextPage();
			}
		},
		threshold: 0.1
	});

	return (
		<main className="flex flex-col">
			<TopMovers coins={firstPage} />
			<DataTable columns={columns} data={cryptoData} isLoading={isLoading} isError={isError} />
			<div ref={observerRef} className="h-[10px]" />
		</main>
	);
}
