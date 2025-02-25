'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { ActionButton } from '@/components/action-button';
import { Trash} from 'lucide-react';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/schemas';
import { TransactionDialog } from './transaction/transaction-dialog';
import { addTransaction } from '@/actions/transaction';
import { deleteCoinFromPortfolio } from '@/actions/portfolio';

interface PortfolioTableActionsProps {
	row: {
		original: {
			id: string;
			name: string;
			transactions?: Transaction[];
		};
	};
	portfolioId: string;
}

export const PortfolioTableActions = ({ row, portfolioId }: PortfolioTableActionsProps) => {
	const initialTransactions = row.original.transactions || [];
	const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const { toast } = useToast();
	const [isPending, startTransition] = useTransition();

	const [optimisticTransactions, addOptimisticTransaction] = useOptimistic(transactions, (state, newTransaction: Transaction) => [...state, newTransaction]);

	const handleOptimisticAdd = async (newTransaction: Transaction) => {
		const transactionWithFees = {
			...newTransaction,
			fees: newTransaction.fees === null ? undefined : newTransaction.fees
		};

		addOptimisticTransaction(transactionWithFees);

		startTransition(async () => {
			try {
				await addTransaction({
					portfolioId: portfolioId,
					coinId: newTransaction.portfolioCoinId,
					quantityCrypto: newTransaction.quantityCrypto,
					amountUsd: newTransaction.amountUsd,
					type: newTransaction.type,
					pricePerCoin: newTransaction.pricePerCoin,
					fees: newTransaction.fees || 0,
					note: newTransaction.note || ''
				});

				setTransactions((current) => [...current, transactionWithFees]);

				toast({
					title: 'Transaction added',
					description: `Successfully added ${transactionWithFees.type.toLowerCase()} transaction`,
					variant: 'default'
				});
			} catch (error) {
				console.error('Error adding transaction:', error);

				setTransactions(transactions);

				toast({
					title: 'Transaction failed',
					description: 'Failed to add transaction. Please try again.',
					variant: 'destructive'
				});
			}
		});
	};

	const handleDelete = async () => {
		if (!row.original.id || !portfolioId) {
			console.error('Missing required IDs for deletion');
			return;
		}

		try {
			const result = await deleteCoinFromPortfolio(row.original.id, portfolioId);
			return result;
		} catch (error) {
			console.error('Error in handleDelete:', error);
			throw error;
		}
	};

	return (
		<div className="flex items-center gap-1">
			<TransactionDialog coinId={row.original.id} onSubmitTransaction={handleOptimisticAdd} />
			<ActionButton icon={Trash} label="Remove coin" onClick={() => setIsDeleteDialogOpen(true)} />
			<ConfirmationDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleDelete}
				title={`Remove ${row.original.name}`}
				description="Are you sure you want to remove this coin from your portfolio? This action cannot be undone."
				confirmText="Remove Coin"
				loadingText="Removing..."
				successMessage="Coin removed successfully"
				errorMessage="Failed to remove coin"
			/>
		</div>
	);
};
