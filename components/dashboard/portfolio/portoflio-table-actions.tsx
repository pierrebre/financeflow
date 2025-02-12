import { useState } from 'react';
import { deleteCoinFromPortfolio } from '@/actions/portfolio';
import { ActionButton } from '@/components/action-button';
import { Plus, X } from 'lucide-react';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useToast } from '@/hooks/use-toast';

interface PortfolioTableActionsProps {
	row: {
		original: {
			id: string;
			name: string;
		};
	};
	portfolioId: string;
}

export const PortfolioTableActions = ({ row, portfolioId }: PortfolioTableActionsProps) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const { toast } = useToast();

	const handleAdd = () => {
		console.log('Add transaction');
		toast({
			description: 'Add transaction feature coming soon'
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
			<ActionButton icon={Plus} label="Add transaction" onClick={handleAdd} />
			<ActionButton icon={X} label="Remove coin" onClick={() => setIsDeleteDialogOpen(true)} />
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
