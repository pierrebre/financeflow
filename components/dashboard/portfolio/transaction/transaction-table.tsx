'use client';

import { deleteTransaction, getTransactions, updateTransaction } from '@/actions/transaction';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/schemas';
import React, { useEffect, useState, useOptimistic, useTransition } from 'react';
import { TransactionItem } from './transaction-item';
import { PortfolioAllocationChart } from '../statistic/portfolio-allocation-chart';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface TransactionTableProps {
	portfolioId: string;
	coinId?: string;
}

export default function TransactionTable({ portfolioId, coinId }: TransactionTableProps) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
	const [isPending, startTransition] = useTransition();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const {
		data: transactions = [],
		isLoading,
		error
	} = useQuery({
		queryKey: ['transactions', portfolioId, coinId],
		queryFn: async () => {
			if (!portfolioId) return [];
			const fetchedTransactions = await getTransactions(portfolioId);
			return coinId ? fetchedTransactions.filter((tx) => tx.portfolioCoin?.coinId === coinId) : fetchedTransactions;
		},
		enabled: !!portfolioId
	});

	const [optimisticTransactions, addOptimisticTransaction] = useOptimistic(transactions, (state, action: { type: 'update' | 'delete'; transaction: Transaction }) => {
		if (action.type === 'update') {
			return state.map((t) => (t.id === action.transaction.id ? action.transaction : t));
		} else if (action.type === 'delete') {
			return state.filter((t) => t.id !== action.transaction.id);
		}
		return state;
	});

	const deleteMutation = useMutation({
		mutationFn: (transactionId: string) => deleteTransaction(transactionId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['transactions', portfolioId] });
			toast({
				title: 'Transaction deleted',
				description: 'Transaction has been successfully removed',
				variant: 'default'
			});
			setIsDeleteDialogOpen(false);
			setSelectedTransaction(null);
		},
		onError: (error) => {
			console.error('Error deleting transaction:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete transaction',
				variant: 'destructive'
			});
		}
	});

	const updateMutation = useMutation({
		mutationFn: (updatedTransaction: Transaction) => updateTransaction(updatedTransaction),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['transactions', portfolioId] });
			toast({
				title: 'Transaction updated',
				description: 'Transaction has been successfully updated',
				variant: 'default'
			});
		},
		onError: (error) => {
			console.error('Error updating transaction:', error);
			toast({
				title: 'Error',
				description: 'Failed to update transaction',
				variant: 'destructive'
			});
		}
	});

	const handleDeleteTransaction = async () => {
		if (!selectedTransaction) return;

		addOptimisticTransaction({ type: 'delete', transaction: selectedTransaction });

		deleteMutation.mutate(selectedTransaction.id);
	};

	const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
		addOptimisticTransaction({ type: 'update', transaction: updatedTransaction });

		updateMutation.mutate(updatedTransaction);
	};

	if (isLoading) {
		return <div className="p-4">Loading transactions...</div>;
	}

	if (error) {
		return <div className="p-4 text-red-500">Error loading transactions</div>;
	}

	return (
		<div className="space-y-4">
			{portfolioId && optimisticTransactions.length > 0 ? (
				<>
					<h3 className="text-lg font-medium">Transactions</h3>
					<PortfolioAllocationChart portfolioId={portfolioId} transactions={optimisticTransactions} />
				</>
			) : (
				<div className="py-4 text-center text-gray-500">No transactions found</div>
			)}
			{optimisticTransactions.map((transaction) => (
				<TransactionItem
					key={transaction.id}
					coinId={transaction.portfolioCoin?.coinId || ''}
					transaction={transaction}
					onUpdate={handleUpdateTransaction}
					onDelete={(tx) => {
						setSelectedTransaction(tx);
						setIsDeleteDialogOpen(true);
					}}
				/>
			))}

			<ConfirmationDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => {
					setIsDeleteDialogOpen(false);
					setSelectedTransaction(null);
				}}
				onConfirm={handleDeleteTransaction}
				title="Remove transaction"
				description="Are you sure you want to remove this transaction? This action cannot be undone."
				confirmText="Remove Transaction"
				loadingText="Removing..."
				successMessage="Transaction removed successfully"
				errorMessage="Failed to remove transaction"
			/>
		</div>
	);
}
