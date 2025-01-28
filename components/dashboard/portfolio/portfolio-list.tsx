'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PortfolioDialog } from './portfolio-dialog';
import { useOptimistic, useState } from 'react';
import PortfolioSelect from './portfolio-select';
import { Portfolio } from '@/schemas';
import { DataTable } from '../../dataTable/data-table';
import { columns } from '../../dataTable/columns';
import AssetDialog from './asset/asset-dialog';

interface PortfolioListProps {
	initialPortfolios: Portfolio[];
	userId: string;
}

export default function PortfolioList({ initialPortfolios, userId }: Readonly<PortfolioListProps>) {
	const [optimisticPortfolios, addOptimisticPortfolio] = useOptimistic<Portfolio[], Portfolio>(initialPortfolios, (state, newPortfolio) => [...state, newPortfolio]);
	const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
	const [error, setError] = useState<string | null>(null);

	function handlePortfolioSelection(id: string) {
		const portfolio = optimisticPortfolios.find((p) => p.id === id);
		if (!portfolio) {
			setError('Portfolio not found');
			return;
		}
		setError(null);
		setSelectedPortfolio(portfolio);
	}

	console.log(selectedPortfolio);
	const data: any = [];

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
			<div className="my-8 text-center">{data.length !== 0 ? <DataTable columns={columns} data={data} isForPortfolio /> : <p>No assets</p>}</div>
		</Card>
	);
}
