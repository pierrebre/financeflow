'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PortfolioDialog } from './portfolio-dialog';
import { useEffect, useOptimistic, useState } from 'react';
import PortfolioSelect from './portfolio-select';
import { Coin, Portfolio } from '@/schemas';
import { DataTable } from '../../dataTable/data-table';
import { columns } from '../../dataTable/columns';
import AssetDialog from './asset/asset-dialog';
import { getCoinsByPortfolio } from '@/actions/portfolio';
import { useQuery } from '@tanstack/react-query';
import { getCoinsWatchlist } from '@/data/coin';

interface PortfolioListProps {
	initialPortfolios: Portfolio[];
	userId: string;
}

export default function PortfolioList({ initialPortfolios, userId }: Readonly<PortfolioListProps>) {
	const [optimisticPortfolios, addOptimisticPortfolio] = useOptimistic<Portfolio[], Portfolio>(initialPortfolios, (state, newPortfolio) => [...state, newPortfolio]);
	const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
	const [coinsId, setCoinsId] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);

	const handlePortfolioSelection = (id: string) => {
		const portfolio = optimisticPortfolios.find((p) => p.id === id);
		if (!portfolio) {
			setError('Portfolio not found');
			return;
		}
		setError(null);
		setSelectedPortfolio(portfolio);
	};

	const fetchCoinsFromPortfolio = async () => {
		if (!selectedPortfolio) {
			return;
		}
		const data = await getCoinsByPortfolio(selectedPortfolio?.id);
		setCoinsId(data.map((coin: any) => coin.coinId));
	};

	useEffect(() => {
		fetchCoinsFromPortfolio();
	}, [selectedPortfolio]);

	const {
		data: coinsPortfolio,
		isError,
		isLoading
	} = useQuery({
		queryKey: ['coinsPortfolio', coinsId],
		queryFn: () => getCoinsWatchlist(coinsId)
	});

	console.log(coinsPortfolio);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Portfolio</CardTitle>
				<CardDescription>Manage your portfolios</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="mb-4">
					<PortfolioDialog userId={userId} onOptimisticAdd={addOptimisticPortfolio} />
				</div>
				<div className="flex space-x-4">
					<PortfolioSelect optimisticPortfolios={optimisticPortfolios} selectedPortfolio={selectedPortfolio} onSelect={handlePortfolioSelection} />
					<AssetDialog portfolioId={selectedPortfolio?.id} />
				</div>
				{error && <p className="text-red-500">{error}</p>}
			</CardContent>
			<div className="mt-8 text-center">{coinsPortfolio?.length ? <DataTable columns={columns} data={coinsPortfolio} isForPortfolio /> : <p className='mb-8'>No coins</p>}</div>
		</Card>
	);
}
