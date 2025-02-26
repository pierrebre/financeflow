'use client';

import { useOptimistic, useState } from 'react';
import { ActionButton } from '@/components/action-button';
import { Plus, Trash } from 'lucide-react';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/schemas';
import { TransactionDialog } from './transaction/transaction-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTransaction } from '@/actions/transaction';
import { deleteCoinFromPortfolio } from '@/actions/portfolio';

interface PortfolioTableActionsProps {
	row: {
		original: {
			id: string;
			coinId: string;
			name: string;
			transactions?: Transaction[];
		};
	};
	portfolioId: string;
}

export const PortfolioTableActions = ({ row, portfolioId }: PortfolioTableActionsProps) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const transactions = row.original.transactions || [];

	const [optimisticTransactions, addOptimisticTransaction] = useOptimistic(transactions, (state, action: { type: 'add'; transaction: Transaction }) => {
		if (action.type === 'add') {
			return [...state, action.transaction];
		}
		return state;
	});

	const addTransactionMutation = useMutation({
		mutationFn: async (newTransaction: Transaction) => {
			return await addTransaction({
				portfolioId: portfolioId,
				coinId: row.original.id,
				quantityCrypto: newTransaction.quantityCrypto,
				amountUsd: newTransaction.amountUsd,
				type: newTransaction.type,
				pricePerCoin: newTransaction.pricePerCoin,
				fees: newTransaction.fees || 0,
				note: newTransaction.note || ''
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['transactions', portfolioId] });
			queryClient.invalidateQueries({ queryKey: ['portfolio-coins', portfolioId] });

			toast({
				title: 'Transaction added',
				description: 'Transaction has been successfully added',
				variant: 'default'
			});
		},
		onError: (error) => {
			console.error('Error adding transaction:', error);
			toast({
				title: 'Transaction failed',
				description: 'Failed to add transaction. Please try again.',
				variant: 'destructive'
			});
		}
	});

	const deleteCoinMutation = useMutation({
		mutationFn: async () => {
			if (!row.original.id || !portfolioId) {
				throw new Error('Missing required IDs for deletion');
			}
			return await deleteCoinFromPortfolio(row.original.id, portfolioId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['portfolio-coins', portfolioId] });
			setIsDeleteDialogOpen(false);

			toast({
				title: 'Coin removed',
				description: `${row.original.name} has been removed from your portfolio`,
				variant: 'default'
			});
		},
		onError: (error) => {
			console.error('Error removing coin:', error);
			toast({
				title: 'Error',
				description: 'Failed to remove coin from portfolio',
				variant: 'destructive'
			});
		}
	});

	const handleAddTransaction = async (newTransaction: Transaction) => {
		const transactionWithDetails = {
			...newTransaction,
			id: `temp-${Date.now()}`,
			portfolioCoinId: row.original.id,
			portfolioCoin: {
				id: row.original.id,
				coinId: row.original.coinId,
				name: row.original.name,
				portfolioId: portfolioId
			},
			fees: newTransaction.fees === null ? 0 : newTransaction.fees,
			date: new Date()
		};

		addOptimisticTransaction({ type: 'add', transaction: transactionWithDetails });

		addTransactionMutation.mutate(transactionWithDetails);
	};

	return (
		<div className="flex space-x-2 justify-end">
			<TransactionDialog coinId={row.original.coinId} triggerIcon={<Plus size={16} />} triggerLabel="Add transaction" onSubmitTransaction={handleAddTransaction} />

			<ActionButton icon={Trash} label={`Remove ${row.original.name}`} onClick={() => setIsDeleteDialogOpen(true)} />

			<ConfirmationDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onConfirm={() => deleteCoinMutation.mutate()}
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
