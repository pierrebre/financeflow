'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { PortfolioDialog } from './portfolio-dialog';
import { useEffect, useState } from 'react';
import PortfolioSelect from './portfolio-select';
import { Portfolio } from '@/src/schemas/';
import { deletePortfolio } from '@/src/actions/portfolio/portfolio';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/src/components/ui/button';
import { ConfirmationDialog } from '@/src/components/confirmation-dialog';
import { PortfolioUpdateDialog } from './portfolio-update-dialog';
import { TransactionProvider } from './transaction/transaction-provider';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash } from 'lucide-react';
import { PortfolioCoinProvider } from './asset/portfolio-coin-provider';
import { PortfolioOverview } from './portfolio-overview';

interface PortfolioListProps {
	initialPortfolios: Portfolio[];
	userId: string;
}

export default function PortfolioList({ initialPortfolios, userId }: Readonly<PortfolioListProps>) {
	const [optimisticPortfolios, setOptimisticPortfolios] = useState<Portfolio[]>(initialPortfolios);
	const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	useEffect(() => {
		if (initialPortfolios.length > 0) {
			setOptimisticPortfolios(initialPortfolios);
		}
	}, [initialPortfolios, selectedPortfolio]);

	const handlePortfolioSelection = (id: string) => {
		const portfolio = optimisticPortfolios.find((p) => p.id === id);
		if (portfolio) setSelectedPortfolio(portfolio);
	};

	const handleDeletePortfolio = async () => {
		if (!selectedPortfolio) return;
		try {
			await deletePortfolio(selectedPortfolio.id);
			const updated = optimisticPortfolios.filter((p) => p.id !== selectedPortfolio.id);
			setOptimisticPortfolios(updated);
			setSelectedPortfolio(updated[0] || null);
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

	const hasValidPortfolio = !!selectedPortfolio?.id;

	return (
		<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
			<Card className="w-full shadow-lg">
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle className="text-2xl font-bold mb-1">My Portfolios</CardTitle>
						<CardDescription>Track and manage your cryptocurrency investments</CardDescription>
					</div>
					<PortfolioDialog userId={userId} onOptimisticAdd={(p) => setOptimisticPortfolios([...optimisticPortfolios, p])} />
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
								<div className="mb-6 p-4 bg-muted/40 rounded-lg">
									<h2 className="text-lg font-semibold">{selectedPortfolio.name}</h2>
									{selectedPortfolio.description && (
										<p className="text-sm text-muted-foreground mt-1">{selectedPortfolio.description}</p>
									)}
								</div>

								<TransactionProvider portfolioId={selectedPortfolio.id}>
									<PortfolioCoinProvider portfolioId={selectedPortfolio.id}>
										<PortfolioOverview portfolioId={selectedPortfolio.id} />
									</PortfolioCoinProvider>
								</TransactionProvider>
							</motion.div>
						</AnimatePresence>
					) : (
						<div className="text-center py-10 bg-muted/40 rounded-lg">
							<h3 className="text-lg font-medium">No portfolio selected</h3>
							<p className="text-sm text-muted-foreground mb-4">
								{optimisticPortfolios.length > 0 ? 'Select a portfolio from the dropdown' : 'Create a portfolio to get started'}
							</p>
							{optimisticPortfolios.length === 0 && (
								<PortfolioDialog userId={userId} onOptimisticAdd={(p) => setOptimisticPortfolios([...optimisticPortfolios, p])} />
							)}
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
