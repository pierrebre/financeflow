'use client';

import React, { createContext, useContext, useTransition, useOptimistic } from 'react';
import { Transaction, TransactionSchema } from '@/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addTransaction, deleteTransaction, getTransactions, updateTransaction } from '@/actions/transaction';
import { useToast } from '@/hooks/use-toast';
import * as z from 'zod';

type TransactionContextType = {
	transactions: Transaction[];
	isLoading: boolean;
	isPending: boolean;
	error: Error | null;
	addNewTransaction: (transaction: z.infer<typeof TransactionSchema>, portfolioId: string, coinId: string) => Promise<void>;
	updateExistingTransaction: (transaction: Transaction) => Promise<void>;
	removeTransaction: (transactionId: string) => Promise<void>;
	optimisticTransactions: Transaction[];
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
		queryKey: ['transactions', portfolioId, coinId],
		queryFn: async () => {
			if (!portfolioId) return [];
			const fetchedTransactions = await getTransactions(portfolioId);
			return coinId ? fetchedTransactions.filter((tx) => tx.portfolioCoin?.coinId === coinId) : fetchedTransactions;
		},
		enabled: !!portfolioId
	});

	const [optimisticTransactions, addOptimisticTransaction] = useOptimistic(transactions, (state, action: { type: 'add' | 'update' | 'delete'; transaction: Transaction }) => {
		if (action.type === 'add') {
			return [...state, action.transaction];
		} else if (action.type === 'update') {
			return state.map((t) => (t.id === action.transaction.id ? action.transaction : t));
		} else if (action.type === 'delete') {
			return state.filter((t) => t.id !== action.transaction.id);
		}
		return state;
	});

	const addMutation = useMutation({
		mutationFn: async (params: { transaction: z.infer<typeof TransactionSchema>; portfolioId: string; coinId: string }) => {
			return await addTransaction({
				portfolioId: params.portfolioId,
				coinId: params.coinId,
				quantityCrypto: params.transaction.quantityCrypto,
				amountUsd: params.transaction.amountUsd,
				type: params.transaction.type,
				pricePerCoin: params.transaction.pricePerCoin,
				fees: params.transaction.fees || 0,
				note: params.transaction.note || ''
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['transactions', portfolioId] });
			queryClient.invalidateQueries({ queryKey: ['portfolio-coins', portfolioId] });

			toast({
				title: 'Transaction added',
				description: 'Transaction added successfully',
				variant: 'default'
			});
		},
		onError: (error) => {
			console.error('Error adding transaction:', error);
			toast({
				title: 'Failed',
				description: 'Could not add transaction. Please try again.',
				variant: 'destructive'
			});
		}
	});

	const updateMutation = useMutation({
		mutationFn: (updatedTransaction: Transaction) => updateTransaction(updatedTransaction),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['transactions', portfolioId] });
			queryClient.invalidateQueries({ queryKey: ['portfolio-coins', portfolioId] });
			toast({
				title: 'Transaction updated',
				description: 'Transaction updated successfully',
				variant: 'default'
			});
		},
		onError: (error) => {
			console.error('Error updating transaction:', error);
			toast({
				title: 'Failed',
				description: 'Could not update transaction',
				variant: 'destructive'
			});
		}
	});

	const deleteMutation = useMutation({
		mutationFn: (transactionId: string) => deleteTransaction(transactionId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['transactions', portfolioId] });
			queryClient.invalidateQueries({ queryKey: ['portfolio-coins', portfolioId] });
			toast({
				title: 'Transaction deleted',
				description: 'Transaction deleted successfully',
				variant: 'default'
			});
		},
		onError: (error) => {
			console.error('Error deleting transaction:', error);
			toast({
				title: 'Failed',
				description: 'Could not delete transaction',
				variant: 'destructive'
			});
		}
	});

	const addNewTransaction = async (transaction: z.infer<typeof TransactionSchema>, portfolioId: string, coinId: string) => {
		const tempTransaction = {
			...transaction,
			id: `temp-${Date.now()}`,
			date: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
			portfolioCoin: {
				id: transaction.portfolioCoinId,
				coinId: coinId,
				portfolioId: portfolioId
			}
		} as Transaction;

		addOptimisticTransaction({ type: 'add', transaction: tempTransaction });

		startTransition(async () => {
			await addMutation.mutateAsync({ transaction, portfolioId, coinId });
		});
	};

	const updateExistingTransaction = async (transaction: Transaction) => {
		addOptimisticTransaction({ type: 'update', transaction });

		startTransition(async () => {
			await updateMutation.mutateAsync(transaction);
		});
	};

	const removeTransaction = async (transactionId: string) => {
		const transactionToDelete = transactions.find((t) => t.id === transactionId);

		if (!transactionToDelete) return;

		addOptimisticTransaction({ type: 'delete', transaction: transactionToDelete });

		startTransition(async () => {
			await deleteMutation.mutateAsync(transactionId);
		});
	};

	const value = {
		transactions,
		isLoading,
		isPending,
		error,
		addNewTransaction,
		updateExistingTransaction,
		removeTransaction,
		optimisticTransactions
	};

	return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

export const useTransactions = () => {
	const context = useContext(TransactionContext);
	if (context === undefined) {
		throw new Error('useTransactions must be used within a TransactionProvider');
	}
	return context;
};
