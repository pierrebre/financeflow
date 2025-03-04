'use client';

import { fetchCryptos } from '@/src/actions/external/crypto';
import { columns } from '@/src/components/dataTable/columns';
import { DataTable } from '@/src/components/dataTable/data-table';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Coin } from '@/src/schemas/';
import { useIntersectionObserver } from '@/src/hooks/use-intersection-observer';


export default function Home() {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError, isLoading } = useInfiniteQuery<Coin[], Error>({
		queryKey: ['cryptos'],
		queryFn: ({ pageParam = 1 }) => fetchCryptos({ pageParam: pageParam as number }),
		getNextPageParam: (lastPage, pages) => (pages.length < 5 && lastPage.length === 20 ? pages.length + 1 : undefined),
		initialPageParam: 1,
		retry: 3,
		retryDelay: 1000,
		staleTime: 30 * 1000,
		gcTime: 5 * 60 * 1000
	});

	const cryptoData = data?.pages.flatMap((page) => page) || [];

	const { observerRef } = useIntersectionObserver({
		onIntersect: () => {
			if (hasNextPage && !isFetchingNextPage && !isError) {
				fetchNextPage();
			}
		},
		threshold: 0.1
	});

	return (
		<main className="flex flex-col items-center">
			<div className="w-full">
				<DataTable columns={columns} data={cryptoData} isLoading={isLoading} isError={isError} />
				<div ref={observerRef} className="h-[10px]" />
			</div>
		</main>
	);
}
