'use client';

import { useState } from 'react';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { Transaction } from '@/schemas';
import { TransactionItem } from './transaction-item';
import { PortfolioAllocationChart } from '../statistic/portfolio-allocation-chart';
import { useTransactions } from './transaction-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { NoTransactionsPlaceholder } from './no-transactions-placeholder';
import { motion, AnimatePresence } from 'framer-motion';

interface TransactionTableProps {
	portfolioId: string;
	coinId?: string;
}

export default function TransactionTable({ portfolioId, coinId }: TransactionTableProps) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

	const { optimisticTransactions, isLoading, error, removeTransaction } = useTransactions();

	const handleDeleteTransaction = async () => {
		if (!selectedTransaction) return;

		await removeTransaction(selectedTransaction.id);
		setIsDeleteDialogOpen(false);
		setSelectedTransaction(null);
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-64 w-full" />
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-16 w-full" />
				))}
			</div>
		);
	}

	if (error) {
		return <div className="p-4 text-red-500 bg-red-50 rounded-md">Error loading transactions</div>;
	}

	return (
		<div className="space-y-4">
			{optimisticTransactions.length > 0 ? (
				<>
					<PortfolioAllocationChart portfolioId={portfolioId} transactions={optimisticTransactions} />

					<div className="rounded-md border overflow-hidden">
						<div className="grid grid-cols-6 gap-2 p-3 bg-gray-50 font-medium text-sm">
							<div>Type</div>
							<div>Quantity</div>
							<div>Amount</div>
							<div>Price</div>
							<div>Fees</div>
							<div>Date</div>
						</div>

						<AnimatePresence initial={false}>
							{optimisticTransactions.map((transaction) => (
								<motion.div key={transaction.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
									<TransactionItem
										transaction={transaction}
										coinId={transaction.portfolioCoin?.coinId || coinId || ''}
										portfolioId={portfolioId}
										onDelete={(tx) => {
											setSelectedTransaction(tx);
											setIsDeleteDialogOpen(true);
										}}
									/>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				</>
			) : (
				<NoTransactionsPlaceholder portfolioId={portfolioId} coinId={coinId} />
			)}

			<ConfirmationDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => {
					setIsDeleteDialogOpen(false);
					setSelectedTransaction(null);
				}}
				onConfirm={handleDeleteTransaction}
				title="Delete transaction"
				description="Are you sure you want to delete this transaction? This action cannot be undone."
				confirmText="Delete"
				loadingText="Deleting..."
				successMessage="Transaction deleted successfully"
				errorMessage="Failed to delete transaction"
			/>
		</div>
	);
}
