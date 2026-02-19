'use client';

import { useState } from 'react';
import { ActionButton } from '@/src/components/action-button';
import { ConfirmationDialog } from '@/src/components/confirmation-dialog';
import { useToast } from '@/src/hooks/use-toast';
import { Transaction } from '@/src/schemas/';
import { TransactionDialog } from './transaction/transaction-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCoinFromPortfolio } from '@/src/actions/portfolio/portfolioCoin';
import { TrashIcon } from 'lucide-react';

export type PortfolioTableActionsRowType = {
	original: {
		id: string;
		coinId: string;
		name: string;
		symbol: string;
		transactions?: Transaction[];
	};
};

interface PortfolioTableActionsProps {
	row: PortfolioTableActionsRowType;
	portfolioId: string;
}

export const PortfolioTableActions = ({ row, portfolioId }: PortfolioTableActionsProps) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const deleteCoinMutation = useMutation({
		mutationFn: async () => {
			if (!row.original.id || !portfolioId) {
				throw new Error('Missing required IDs for deletion');
			}
			return await deleteCoinFromPortfolio(row.original.id, portfolioId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['portfolio-coins', portfolioId] });
			queryClient.invalidateQueries({ queryKey: ['portfolio-statistics', portfolioId] });
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

	return (
		<div className="flex">
			<TransactionDialog portfolioId={portfolioId} coinId={row.original.id} />
			<ActionButton icon={<TrashIcon className="h-4 w-4 text-gray-600" />} label="Remove coin" onClick={() => setIsDeleteDialogOpen(true)} />
			<ConfirmationDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onConfirm={async () => { deleteCoinMutation.mutate(); }}
				title={`Remove ${row.original.name} (${row.original.symbol.toUpperCase()})`}
				description={`Are you sure you want to remove ${row.original.name} from your portfolio? All transaction history will be deleted. This action cannot be undone.`}
				confirmText="Remove Coin"
				loadingText="Removing..."
			/>
		</div>
	);
};
