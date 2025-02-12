'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PortfolioDialog } from './portfolio-dialog';
import { useEffect, useState } from 'react';
import PortfolioSelect from './portfolio-select';
import { Coin, Portfolio } from '@/schemas';
import { DataTable } from '../../dataTable/data-table';
import { columnsPortfolio } from '../../dataTable/columns-portfolio';
import AssetDialog from './asset/asset-dialog';
import { deletePortfolio, getCoinsByPortfolio, updatePortfolio } from '@/actions/portfolio';
import { useQuery } from '@tanstack/react-query';
import { getCoinsWatchlist } from '@/data/coin';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { PortfolioUpdateDialog } from './portoflio-update-dialog';

interface PortfolioListProps {
	initialPortfolios: Portfolio[];
	userId: string;
}

export default function PortfolioList({ initialPortfolios, userId }: Readonly<PortfolioListProps>) {
	const [optimisticPortfolios, setOptimisticPortfolios] = useState<Portfolio[]>(initialPortfolios);
	const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
	const [coinsId, setCoinsId] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
		if (!selectedPortfolio) return;
		try {
			const data = await getCoinsByPortfolio(selectedPortfolio.id);
			setCoinsId(data.map((coin: any) => coin.coinId));
		} catch (error) {
			console.error('Error fetching coins:', error);
		}
	};

	const handleDeletePortfolio = async () => {
		if (!selectedPortfolio) return;
		try {
			const result = await deletePortfolio(selectedPortfolio.id);
			if (result) {
				setSelectedPortfolio(null);
				setCoinsId([]);
				setOptimisticPortfolios(optimisticPortfolios.filter((p) => p.id !== selectedPortfolio.id));
			}
		} catch (error) {
			console.error('Error deleting portfolio:', error);
		}
	};

	const handleUpdatePortfolio = (updatedPortfolio: Portfolio) => {
		setOptimisticPortfolios(optimisticPortfolios.map((p) => (p.id === updatedPortfolio.id ? updatedPortfolio : p)));
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
		queryFn: () => getCoinsWatchlist(coinsId),
		enabled: !!selectedPortfolio
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Portfolio</CardTitle>
				<CardDescription>Manage your portfolios</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex space-x-4">
					<PortfolioSelect optimisticPortfolios={optimisticPortfolios} selectedPortfolio={selectedPortfolio} onSelect={handlePortfolioSelection} />
					<PortfolioDialog userId={userId} onOptimisticAdd={(newPortfolio) => setOptimisticPortfolios([...optimisticPortfolios, newPortfolio])} />
				</div>
				<div className="flex lg:space-x-4 lg:flex-row flex-col lg:items-center mt-8">
					<div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4">
						<p className="text-center lg:text-left my-4 lg:my-0">{selectedPortfolio?.name}</p>
						<p className="text-gray-500">{selectedPortfolio?.description}</p>
					</div>
					<div className="flex space-x-4">
						<Button variant="outline" className="ml-auto" disabled={!selectedPortfolio} onClick={() => setIsDeleteDialogOpen(true)}>
							Delete portfolio
						</Button>
						{selectedPortfolio && <PortfolioUpdateDialog portfolio={selectedPortfolio} onUpdate={handleUpdatePortfolio} />}
						<AssetDialog portfolioId={selectedPortfolio?.id} />
					</div>
				</div>

				<ConfirmationDialog
					isOpen={isDeleteDialogOpen}
					onClose={() => setIsDeleteDialogOpen(false)}
					onConfirm={handleDeletePortfolio}
					title={`Delete ${selectedPortfolio?.name}`}
					description="Are you sure you want to delete this portfolio? This action cannot be undone and will remove all coins associated with this portfolio."
					confirmText="Delete Portfolio"
					loadingText="Deleting..."
					successMessage="Portfolio deleted successfully"
					errorMessage="Failed to delete portfolio"
				/>

				{error && <p className="text-red-500">{error}</p>}
			</CardContent>
			<div className="mt-8 text-center">{coinsPortfolio?.length ? <DataTable columns={columnsPortfolio} data={coinsPortfolio} portoflioId={selectedPortfolio?.id} isForPortfolio /> : <p className="mb-8">No coins</p>}</div>
		</Card>
	);
}
