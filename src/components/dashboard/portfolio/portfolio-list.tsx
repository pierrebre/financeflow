'use client';

import { useEffect, useState } from 'react';
import { PortfolioDialog } from './portfolio-dialog';
import PortfolioSelect from './portfolio-select';
import { Portfolio } from '@/src/schemas/';
import { deletePortfolio } from '@/src/actions/portfolio/portfolio';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/src/components/ui/button';
import { ConfirmationDialog } from '@/src/components/confirmation-dialog';
import { PortfolioUpdateDialog } from './portfolio-update-dialog';
import { TransactionProvider } from './transaction/transaction-provider';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash, Briefcase } from 'lucide-react';
import { PortfolioCoinProvider } from './asset/portfolio-coin-provider';
import { PortfolioOverview } from './portfolio-overview';
import { Tabs, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { AddTransactionSheet } from './add-transaction-sheet';

interface PortfolioListProps {
	initialPortfolios: Portfolio[];
	userId: string;
}

const MAX_TABS = 4;

export default function PortfolioList({ initialPortfolios, userId }: Readonly<PortfolioListProps>) {
	const [optimisticPortfolios, setOptimisticPortfolios] = useState<Portfolio[]>(initialPortfolios);
	const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(initialPortfolios[0] ?? null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	useEffect(() => {
		if (initialPortfolios.length > 0) {
			setOptimisticPortfolios(initialPortfolios);
		}
	}, [initialPortfolios]);

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

	const useTabs = optimisticPortfolios.length <= MAX_TABS;
	const hasValidPortfolio = !!selectedPortfolio?.id;

	return (
		<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">

			{/* Page header */}
			<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">My Portfolios</h1>
					<p className="text-sm text-muted-foreground mt-0.5">Track and manage your cryptocurrency investments</p>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					<PortfolioDialog
						userId={userId}
						onOptimisticAdd={(p) => {
							setOptimisticPortfolios((prev) => [...prev, p]);
							setSelectedPortfolio(p);
						}}
					/>
				</div>
			</div>

			{/* Portfolio switcher */}
			{optimisticPortfolios.length > 0 && (
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					{useTabs ? (
						<Tabs value={selectedPortfolio?.id ?? ''} onValueChange={handlePortfolioSelection}>
							<TabsList>
								{optimisticPortfolios.map((p) => (
									<TabsTrigger key={p.id} value={p.id} className="text-sm">
										{p.name}
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					) : (
						<PortfolioSelect
							optimisticPortfolios={optimisticPortfolios}
							selectedPortfolio={selectedPortfolio}
							onSelect={handlePortfolioSelection}
						/>
					)}

					{selectedPortfolio && (
						<div className="flex items-center gap-2">
							<PortfolioUpdateDialog portfolio={selectedPortfolio} onUpdate={handleUpdatePortfolio} />
							<Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)} className="gap-1.5">
								<Trash size={14} /> Delete
							</Button>
						</div>
					)}
				</div>
			)}

			{/* Portfolio content */}
			<AnimatePresence mode="wait">
				{hasValidPortfolio ? (
					<motion.div key={selectedPortfolio.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
						<TransactionProvider portfolioId={selectedPortfolio.id}>
							<PortfolioCoinProvider portfolioId={selectedPortfolio.id}>
								{/* Portfolio-level action bar */}
								<div className="flex items-center justify-between mb-2">
									{selectedPortfolio.description ? (
										<p className="text-sm text-muted-foreground">{selectedPortfolio.description}</p>
									) : (
										<span />
									)}
									<AddTransactionSheet portfolioId={selectedPortfolio.id} />
								</div>
								<PortfolioOverview portfolioId={selectedPortfolio.id} />
							</PortfolioCoinProvider>
						</TransactionProvider>
					</motion.div>
				) : (
					<motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
						<div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
							<Briefcase size={40} className="mx-auto text-muted-foreground mb-3" />
							<h3 className="text-lg font-medium mb-1">No portfolio yet</h3>
							<p className="text-sm text-muted-foreground mb-4">Create your first portfolio to start tracking your crypto investments</p>
							<PortfolioDialog
								userId={userId}
								onOptimisticAdd={(p) => {
									setOptimisticPortfolios((prev) => [...prev, p]);
									setSelectedPortfolio(p);
								}}
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

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
