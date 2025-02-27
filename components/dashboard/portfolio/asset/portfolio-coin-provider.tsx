'use client';

import React, { createContext, useContext, useTransition, useOptimistic } from 'react';
import { PortfolioCoin } from '@/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addCoinToPortfolio, deleteCoinFromPortfolio, getCoinsByPortfolio } from '@/actions/portfolio';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '../transaction/transaction-provider';

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

export function PortfolioCoinProvider({ children, portfolioId }: { children: React.ReactNode; portfolioId: string }) {
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
		queryFn: () => (portfolioId ? getCoinsByPortfolio(portfolioId) : Promise.resolve([])),
		enabled: !!portfolioId
	});

	const [optimisticPortfolioCoins, updateOptimisticCoins] = useOptimistic(portfolioCoins, (state, action: { type: 'add' | 'remove'; coin: PortfolioCoin }) => {
		if (action.type === 'add') {
			return [...state, action.coin];
		} else if (action.type === 'remove') {
			return state.filter((c) => c.coinId !== action.coin.coinId);
		}
		return state;
	});

	const addMutation = useMutation({
		mutationFn: async (params: { coinId: string; portfolioId: string }) => {
			return await addCoinToPortfolio(params.portfolioId, params.coinId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['portfolio-coins', portfolioId] });
			toast({
				title: 'Asset added',
				description: 'Asset added successfully to your portfolio',
				variant: 'default'
			});
		},
		onError: (error) => {
			console.error('Error adding coin to portfolio:', error);
			toast({
				title: 'Failed',
				description: 'Could not add asset to your portfolio',
				variant: 'destructive'
			});
		}
	});

	const deleteMutation = useMutation({
		mutationFn: async (params: { coinId: string; portfolioId: string }) => {
			return await deleteCoinFromPortfolio(params.coinId, params.portfolioId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['portfolio-coins', portfolioId] });
			toast({
				title: 'Asset removed',
				description: 'Asset removed successfully from your portfolio',
				variant: 'default'
			});
		},
		onError: (error) => {
			console.error('Error removing coin from portfolio:', error);
			toast({
				title: 'Failed',
				description: 'Could not remove asset from your portfolio',
				variant: 'destructive'
			});
		}
	});

	const addCoin = async (coinId: string, portfolioId: string) => {
		const tempCoin: PortfolioCoin = {
			id: `temp-${Date.now()}`,
			portfolioId,
			coinId,
			coin: {
				id: coinId,
				name: coinId
			}
		};

		updateOptimisticCoins({ type: 'add', coin: tempCoin });

		startTransition(async () => {
			await addMutation.mutateAsync({ coinId, portfolioId });
		});
	};

	const removeCoin = async (coinId: string, portfolioId: string) => {
		const coinToRemove = portfolioCoins.find((c) => c.coinId === coinId);

		if (!coinToRemove) return;

		// Find all transactions associated with this coin
		const relatedTransactions = optimisticTransactions.filter((tx) => tx.portfolioCoin?.coinId === coinId);

		// Optimistically update UI by removing the coin
		updateOptimisticCoins({ type: 'remove', coin: coinToRemove });

		startTransition(async () => {
			// First remove related transactions (if any)
			const transactionPromises = relatedTransactions.map((tx) => removeTransaction(tx.id));

			// Wait for all transaction deletions to complete
			if (transactionPromises.length > 0) {
				await Promise.all(transactionPromises);
			}

			// Then remove the coin itself
			await deleteMutation.mutateAsync({ coinId, portfolioId });
		});
	};

	const value = {
		portfolioCoins,
		isLoading,
		isPending,
		error,
		addCoin,
		removeCoin,
		optimisticPortfolioCoins
	};

	return <PortfolioCoinContext.Provider value={value}>{children}</PortfolioCoinContext.Provider>;
}

export const usePortfolioCoins = () => {
	const context = useContext(PortfolioCoinContext);
	if (context === undefined) {
		throw new Error('usePortfolioCoins must be used within a PortfolioCoinProvider');
	}
	return context;
};
