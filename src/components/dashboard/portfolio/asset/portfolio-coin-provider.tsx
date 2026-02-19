'use client';

import React, { createContext, useCallback, useContext, useMemo, useTransition } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useOptimistic } from 'react';
import { PortfolioCoin } from '@/src/schemas/'; // Assurez-vous que ce schéma est bien typé
import { useToast } from '@/src/hooks/use-toast';
import { useTransactions } from '../transaction/transaction-provider';
import { getCoinsByPortfolio } from '@/src/repositories/portfolio';
import { addCoinToPortfolio, deleteCoinFromPortfolio } from '@/src/actions/portfolio/portfolioCoin';

type PortfolioCoinContextType = {
	portfolioCoins: PortfolioCoin[];
	isLoading: boolean;
	isPending: boolean;
	error: Error | null;
	addCoin: (coinId: string, portfolioId: string) => Promise<void>;
	removeCoin: (coinId: string, portfolioId: string) => Promise<void>;
	optimisticPortfolioCoins: PortfolioCoin[];
};

const PortfolioCoinContext = createContext<PortfolioCoinContextType | undefined>(undefined);

type PortfolioCoinProviderProps = {
	children: React.ReactNode;
	portfolioId: string;
};

export function PortfolioCoinProvider({ children, portfolioId }: PortfolioCoinProviderProps) {
	const [isPending, startTransition] = useTransition();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const { optimisticTransactions, removeTransaction } = useTransactions();

	const {
		data: portfolioCoins = [],
		isLoading,
		error
	} = useQuery({
		queryKey: ['portfolio-coins', portfolioId],
		queryFn: async () => {
			if (!portfolioId) return [];
			return await getCoinsByPortfolio(portfolioId);
		},
		enabled: !!portfolioId
	});

	const [optimisticPortfolioCoins, updateOptimisticCoins] = useOptimistic<PortfolioCoin[], { type: 'add' | 'remove'; coin: PortfolioCoin }>(portfolioCoins, (state, action) => {
		switch (action.type) {
			case 'add':
				return [...state, action.coin];
			case 'remove':
				return state.filter((c) => c.coinId !== action.coin.coinId);
			default:
				return state;
		}
	});

	const addMutation = useMutation({
		mutationFn: ({ coinId, portfolioId }: { coinId: string; portfolioId: string }) => addCoinToPortfolio(portfolioId, coinId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['portfolio-coins', portfolioId] });
			toast({
				title: 'Asset added',
				description: 'Asset added successfully to your portfolio'
			});
		},
		onError: (error: Error) => {
			toast({
				title: 'Failed',
				description: 'Could not add asset to your portfolio',
				variant: 'destructive'
			});
			console.error('Error adding coin to portfolio:', error);
		}
	});

	// Mutation pour supprimer un coin
	const deleteMutation = useMutation({
		mutationFn: ({ coinId, portfolioId }: { coinId: string; portfolioId: string }) => deleteCoinFromPortfolio(coinId, portfolioId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['portfolio-coins', portfolioId] });
			toast({
				title: 'Asset removed',
				description: 'Asset removed successfully from your portfolio'
			});
		},
		onError: (error: Error) => {
			toast({
				title: 'Failed',
				description: 'Could not remove asset from your portfolio',
				variant: 'destructive'
			});
			console.error('Error removing coin from portfolio:', error);
		}
	});

	const addCoin = useCallback(async (coinId: string, portfolioId: string) => {
		const tempCoin: PortfolioCoin = {
			id: `temp-${Date.now()}`,
			portfolioId,
			coinId,
			coin: { id: coinId, name: coinId }
		};

		startTransition(() => {
			updateOptimisticCoins({ type: 'add', coin: tempCoin });
			addMutation.mutate({ coinId, portfolioId });
		});
	}, [addMutation, updateOptimisticCoins, startTransition]);

	const removeCoin = useCallback(async (coinId: string, portfolioId: string) => {
		const coinToRemove = portfolioCoins.find((c) => c.coinId === coinId);
		if (!coinToRemove) return;

		const relatedTransactions = optimisticTransactions.filter((tx) => tx.portfolioCoin?.coinId === coinId);

		startTransition(async () => {
			updateOptimisticCoins({ type: 'remove', coin: coinToRemove });

			if (relatedTransactions.length > 0) {
				await Promise.all(relatedTransactions.map((tx) => removeTransaction(tx.id)));
			}

			await deleteMutation.mutateAsync({ coinId, portfolioId });
		});
	}, [portfolioCoins, optimisticTransactions, deleteMutation, updateOptimisticCoins, removeTransaction, startTransition]);

	const contextValue: PortfolioCoinContextType = useMemo(
		() => ({
			portfolioCoins,
			isLoading,
			isPending,
			error,
			addCoin,
			removeCoin,
			optimisticPortfolioCoins
		}),
		[portfolioCoins, isLoading, isPending, error, addCoin, removeCoin, optimisticPortfolioCoins]
	);

	return <PortfolioCoinContext.Provider value={contextValue}>{children}</PortfolioCoinContext.Provider>;
}

export function usePortfolioCoins() {
	const context = useContext(PortfolioCoinContext);
	if (!context) {
		throw new Error('usePortfolioCoins must be used within a PortfolioCoinProvider');
	}
	return context;
}
