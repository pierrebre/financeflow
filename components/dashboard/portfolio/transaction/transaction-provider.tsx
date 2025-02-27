'use client';

import React, { createContext, useContext, useTransition, useOptimistic } from 'react';
import { Transaction, TransactionSchema } from '@/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addTransaction, deleteTransaction, getTransactions, updateTransaction } from '@/actions/transaction';
import { useToast } from '@/hooks/use-toast';
import * as z from 'zod';

type TransactionContextType = {
	transactions: Transaction[];
	optimisticTransactions: Transaction[];
	isLoading: boolean;
	isPending: boolean;
	error: Error | null;
	addNewTransaction: (transaction: z.infer<typeof TransactionSchema>, portfolioId: string, coinId: string) => Promise<void>;
	updateExistingTransaction: (transaction: Transaction) => Promise<void>;
	removeTransaction: (transactionId: string) => Promise<void>;
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children, portfolioId, coinId }: { children: React.ReactNode; portfolioId: string; coinId?: string }) {
	const [isPending, startTransition] = useTransition();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const {
		data: transactions = [],
		isLoading,
		error
	} = useQuery({
		queryKey: ['transactions', portfolioId],
		queryFn: () => getTransactions(portfolioId),
		enabled: !!portfolioId
	});

	const [optimisticTransactions, updateOptimistic] = useOptimistic(transactions, (state, action: { type: 'add' | 'update' | 'delete'; transaction: Transaction }) => {
		switch (action.type) {
			case 'add':
				return [...state, action.transaction];
			case 'update':
				return state.map((t) => (t.id === action.transaction.id ? action.transaction : t));
			case 'delete':
				return state.filter((t) => t.id !== action.transaction.id);
			default:
				return state;
		}
	});

	const addMutation = useMutation({
		mutationFn: ({ transaction, portfolioId, coinId }: { transaction: z.infer<typeof TransactionSchema>; portfolioId: string; coinId: string }) =>
			addTransaction({
				portfolioId,
				coinId,
				quantityCrypto: transaction.quantityCrypto,
				amountUsd: transaction.amountUsd,
				type: transaction.type,
				pricePerCoin: transaction.pricePerCoin,
				fees: transaction.fees ?? 0,
				note: transaction.note ?? ''
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['transactions', portfolioId] });
			toast({ title: 'Transaction added', description: 'Transaction added successfully', variant: 'default' });
		},
		onError: (error) => {
			console.error('Error adding transaction:', error);
			toast({ title: 'Failed', description: 'Could not add transaction', variant: 'destructive' });
		}
	});

	const updateMutation = useMutation({
		mutationFn: (updatedTransaction: Transaction) => updateTransaction(updatedTransaction),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['transactions', portfolioId] });
			toast({ title: 'Transaction updated', description: 'Transaction updated successfully', variant: 'default' });
		},
		onError: (error) => {
			console.error('Error updating transaction:', error);
			toast({ title: 'Failed', description: 'Could not update transaction', variant: 'destructive' });
		}
	});

	const deleteMutation = useMutation({
		mutationFn: (transactionId: string) => deleteTransaction(transactionId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['transactions', portfolioId] });
			toast({ title: 'Transaction deleted', description: 'Transaction deleted successfully', variant: 'default' });
		},
		onError: (error) => {
			console.error('Error deleting transaction:', error);
			toast({ title: 'Failed', description: 'Could not delete transaction', variant: 'destructive' });
		}
	});

	const addNewTransaction = async (transaction: z.infer<typeof TransactionSchema>, portfolioId: string, coinId: string) => {
		const tempTransaction: Transaction = {
			...transaction,
			id: `temp-${Date.now()}`,
			date: transaction.date ?? new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
			portfolioCoin: { id: transaction.portfolioCoinId, coinId, portfolioId }
		};
		updateOptimistic({ type: 'add', transaction: tempTransaction });
		startTransition(() => addMutation.mutate({ transaction, portfolioId, coinId }));
	};

	const updateExistingTransaction = async (transaction: Transaction) => {
		updateOptimistic({ type: 'update', transaction });
		startTransition(() => updateMutation.mutate(transaction));
	};

	const removeTransaction = async (transactionId: string) => {
		const transactionToDelete = optimisticTransactions.find((t) => t.id === transactionId);
		if (transactionToDelete) {
			updateOptimistic({ type: 'delete', transaction: transactionToDelete });
			startTransition(() => deleteMutation.mutate(transactionId));
		}
	};

	return (
		<TransactionContext.Provider
			value={{
				transactions,
				optimisticTransactions,
				isLoading,
				isPending,
				error,
				addNewTransaction,
				updateExistingTransaction,
				removeTransaction
			}}
		>
			{children}
		</TransactionContext.Provider>
	);
}

export const useTransactions = () => {
	const context = useContext(TransactionContext);
	if (context === undefined) throw new Error('useTransactions must be used within a TransactionProvider');
	return context;
};
