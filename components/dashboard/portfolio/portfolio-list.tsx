'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PortfolioDialog } from './portfolio-dialog';
import { useEffect, useState, useMemo } from 'react';
import PortfolioSelect from './portfolio-select';
import { Portfolio } from '@/schemas';
import { DataTable } from '../../dataTable/data-table';
import { columnsPortfolio } from '../../dataTable/columns-portfolio';
import AssetDialog from './asset/asset-dialog';
import { deletePortfolio, getCoinsByPortfolio } from '@/actions/portfolio';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCoinsWatchlist } from '@/data/coin';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { PortfolioUpdateDialog } from './portoflio-update-dialog';
import TransactionTable from './transaction/transaction-table';
import { TransactionProvider } from './transaction/transaction-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash, PieChart, LineChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PortfolioListProps {
	initialPortfolios: Portfolio[];
	userId: string;
}

export default function PortfolioList({ initialPortfolios, userId }: Readonly<PortfolioListProps>) {
	const [optimisticPortfolios, setOptimisticPortfolios] = useState<Portfolio[]>(initialPortfolios);
	const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [activeTab, setActiveTab] = useState('overview');
	const queryClient = useQueryClient();

	useEffect(() => {
		if (initialPortfolios.length > 0) {
			setOptimisticPortfolios(initialPortfolios);

			if (!selectedPortfolio) {
				setSelectedPortfolio(initialPortfolios[0]);
			}
		}
	}, [initialPortfolios, selectedPortfolio]);

	const handlePortfolioSelection = (id: string) => {
		const portfolio = optimisticPortfolios.find((p) => p.id === id);
		if (portfolio) {
			setSelectedPortfolio(portfolio);
		}
	};

	const { data: portfolioCoins = [], isLoading: isLoadingCoins } = useQuery({
		queryKey: ['portfolio-coins', selectedPortfolio?.id],
		queryFn: () => (selectedPortfolio?.id ? getCoinsByPortfolio(selectedPortfolio.id) : Promise.resolve([])),
		enabled: !!selectedPortfolio?.id
	});

	const coinIds = useMemo(() => {
		return portfolioCoins.map((coin: any) => coin.coinId);
	}, [portfolioCoins]);

	const {
		data: coinsData = [],
		isLoading: isLoadingCoinData,
		isError
	} = useQuery({
		queryKey: ['coins-data', coinIds],
		queryFn: () => (coinIds.length > 0 ? getCoinsWatchlist(coinIds) : Promise.resolve([])),
		enabled: coinIds.length > 0
	});

	const handleDeletePortfolio = async () => {
		if (!selectedPortfolio) return;

		try {
			await deletePortfolio(selectedPortfolio.id);

			const updatedPortfolios = optimisticPortfolios.filter((p) => p.id !== selectedPortfolio.id);
			setOptimisticPortfolios(updatedPortfolios);
			setSelectedPortfolio(updatedPortfolios[0] || null);

			queryClient.invalidateQueries({ queryKey: ['portfolio-coins'] });

			setIsDeleteDialogOpen(false);
		} catch (error) {
			console.error('Error deleting portfolio:', error);
		}
	};

	const handleUpdatePortfolio = (updatedPortfolio: Portfolio) => {
		setOptimisticPortfolios(optimisticPortfolios.map((p) => (p.id === updatedPortfolio.id ? updatedPortfolio : p)));
		setSelectedPortfolio(updatedPortfolio);
	};

	const isLoading = isLoadingCoins || isLoadingCoinData;
	const hasValidPortfolio = !!selectedPortfolio?.id;

	return (
		<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
			<Card className="w-full shadow-lg">
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle className="text-2xl font-bold mb-1">My Portfolios</CardTitle>
						<CardDescription>Track and manage your cryptocurrency investments</CardDescription>
					</div>
					<PortfolioDialog userId={userId} onOptimisticAdd={(newPortfolio) => setOptimisticPortfolios([...optimisticPortfolios, newPortfolio])} />
				</CardHeader>

				<CardContent>
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
						<div className="w-full md:w-auto">
							<PortfolioSelect optimisticPortfolios={optimisticPortfolios} selectedPortfolio={selectedPortfolio} onSelect={handlePortfolioSelection} />
						</div>

						{selectedPortfolio && (
							<div className="flex gap-2 self-end md:self-center">
								<PortfolioUpdateDialog portfolio={selectedPortfolio} onUpdate={handleUpdatePortfolio} />
								<Button variant="outline" onClick={() => setIsDeleteDialogOpen(true)} className="gap-2">
									<Trash size={15} /> Delete
								</Button>
							</div>
						)}
					</div>

					{hasValidPortfolio ? (
						<AnimatePresence mode="wait">
							<motion.div key={selectedPortfolio.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
								<div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
									<h2 className="text-lg font-semibold">{selectedPortfolio.name}</h2>
									{selectedPortfolio.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedPortfolio.description}</p>}
								</div>

								<Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
									<TabsList className="grid grid-cols-2 mb-6">
										<TabsTrigger value="overview" className="gap-2">
											<PieChart size={16} /> Overview
										</TabsTrigger>
										<TabsTrigger value="assets" className="gap-2">
											<LineChart size={16} /> Assets
										</TabsTrigger>
									</TabsList>

									<TabsContent value="overview">
										<div className="gap-4 md:grid-cols-2">
											<TransactionProvider portfolioId={selectedPortfolio.id}>
												<TransactionTable portfolioId={selectedPortfolio.id} />
											</TransactionProvider>
										</div>
									</TabsContent>

									<TabsContent value="assets">
										<div className="flex justify-end mb-4">
											<AssetDialog portfolioId={selectedPortfolio.id} />
										</div>
										{isLoading ? (
											<div className="space-y-2">
												{[1, 2, 3].map((i) => (
													<Skeleton key={i} className="w-full h-16" />
												))}
											</div>
										) : coinsData.length > 0 ? (
											<DataTable columns={columnsPortfolio} data={coinsData} isForPortfolio={true} portoflioId={selectedPortfolio.id} />
										) : (
											<div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
												<h3 className="text-lg font-medium mb-2">No assets in this portfolio</h3>
												<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Start by adding cryptocurrencies to your portfolio</p>
												<AssetDialog portfolioId={selectedPortfolio.id} />
											</div>
										)}
									</TabsContent>
								</Tabs>
							</motion.div>
						</AnimatePresence>
					) : (
						<div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
							<h3 className="text-lg font-medium">No portfolio selected</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{optimisticPortfolios.length > 0 ? 'Select a portfolio from the dropdown' : 'Create a portfolio to get started'}</p>
							{optimisticPortfolios.length === 0 && <PortfolioDialog userId={userId} onOptimisticAdd={(newPortfolio) => setOptimisticPortfolios([...optimisticPortfolios, newPortfolio])} />}
						</div>
					)}
				</CardContent>
			</Card>

			<ConfirmationDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleDeletePortfolio}
				title={`Delete ${selectedPortfolio?.name}`}
				description="Are you sure you want to delete this portfolio? This action cannot be undone and will remove all associated assets and transactions."
				confirmText="Delete Portfolio"
				loadingText="Deleting..."
				successMessage="Portfolio deleted successfully"
				errorMessage="Failed to delete portfolio"
			/>
		</motion.div>
	);
}
