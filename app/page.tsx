'use client';
import { fetchCryptos } from '@/data/coin';
import { columns } from '../components/dataTable/columns';
import { DataTable } from '../components/dataTable/data-table';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Coin } from '@/schemas';

export default function Home() {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError } = useInfiniteQuery<Coin[], Error>({
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

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && !isError) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 }
		);

		const sentinel = document.getElementById('scroll-sentinel');
		if (sentinel) {
			observer.observe(sentinel);
		}

		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage, isError]);

	return (
		<main className="flex flex-col items-center">
			<div className="w-full">
				<DataTable columns={columns} data={cryptoData} isLoading={isFetchingNextPage} />
				<div id="scroll-sentinel" className="h-[10px]" />
			</div>
		</main>
	);
}
