'use client';

import { deleteTransaction, getTransactions, updateTransaction } from '@/actions/transaction';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/schemas';
import React, { useEffect, useState, useTransition } from 'react';
import { TransactionItem } from './transaction-item';


interface TransactionTableProps {
	portfolioId: string;
	coinId?: string;
}

export default function TransactionTable({ portfolioId, coinId }: TransactionTableProps) {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
	const [isPending, startTransition] = useTransition();
	const { toast } = useToast();

	const fetchTransactions = async () => {
		if (!portfolioId) return;

		try {
			const fetchedTransactions = await getTransactions(portfolioId);

			const filteredTransactions = coinId ? fetchedTransactions.filter((tx) => tx.portfolioCoinId.includes(coinId)) : fetchedTransactions;

			setTransactions(filteredTransactions);
		} catch (error) {
			console.error('Error fetching transactions:', error);
			toast({
				title: 'Error',
				description: 'Failed to load transactions',
				variant: 'destructive'
			});
		}
	};

	useEffect(() => {
		fetchTransactions();
	}, [portfolioId, coinId]);

	const handleDeleteTransaction = async () => {
		if (!selectedTransaction) return;

		startTransition(async () => {
			try {
				await deleteTransaction(selectedTransaction.id);

				setTransactions((prev) => prev.filter((t) => t.id !== selectedTransaction.id));

				toast({
					title: 'Transaction deleted',
					description: 'Transaction has been successfully removed',
					variant: 'default'
				});
			} catch (error) {
				console.error('Error deleting transaction:', error);
				toast({
					title: 'Error',
					description: 'Failed to delete transaction',
					variant: 'destructive'
				});
			} finally {
				setIsDeleteDialogOpen(false);
				setSelectedTransaction(null);
			}
		});
	};

	const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
		startTransition(async () => {
			try {
				await updateTransaction(updatedTransaction);

				setTransactions((prev) => prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)));

				toast({
					title: 'Transaction updated',
					description: 'Transaction has been successfully updated',
					variant: 'default'
				});
			} catch (error) {
				console.error('Error updating transaction:', error);
				toast({
					title: 'Error',
					description: 'Failed to update transaction',
					variant: 'destructive'
				});
			}
		});
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-medium">Transactions</h3>
				<p>{transactions.length} transactions</p>
			</div>
			<div className="border rounded-md overflow-hidden">
				<div className="grid grid-cols-6 gap-2 bg-gray-100 p-3 text-xs font-medium uppercase text-gray-500">
					<div>Type</div>
					<div>Quantity</div>
					<div>Amount</div>
					<div>Price</div>
					<div>Fees</div>
					<div>Date</div>
				</div>

				{transactions.map((transaction) => (
					<TransactionItem
						key={transaction.id}
						transaction={transaction}
						onUpdate={handleUpdateTransaction}
						onDelete={(tx) => {
							setSelectedTransaction(tx);
							setIsDeleteDialogOpen(true);
						}}
					/>
				))}
			</div>

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
