'use client';
import { fetchCryptos } from '@/lib/utils';
import { columns } from '../components/dataTable/columns';
import { DataTable } from '../components/dataTable/data-table';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Coin } from '@/schemas';

export default function Home() {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError } = useInfiniteQuery<Coin[], Error>({
		queryKey: ['cryptos'],
		queryFn: ({ pageParam = 1 }) => fetchCryptos({ pageParam: pageParam as number }),
		getNextPageParam: (lastPage, pages) => (pages.length < 4 && lastPage.length === 20 ? pages.length + 1 : undefined),
		initialPageParam: 1
	});

	const cryptoData = data?.pages.flatMap((page) => page) || [];

	const [isNearBottom, setIsNearBottom] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 200;
			setIsNearBottom(bottom);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		if (isNearBottom && hasNextPage && !isFetchingNextPage && !isError) {
			fetchNextPage();
		}
	}, [isNearBottom, hasNextPage, isFetchingNextPage, fetchNextPage, isError]);

	return (
		<main className="flex flex-col items-center">
			<div className="w-full">
				<DataTable columns={columns} data={cryptoData} isLoading={isFetchingNextPage} />
			</div>
		</main>
	);
}
