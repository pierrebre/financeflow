import { ActionButton } from '@/src/components/action-button';
import { TransactionDialog } from './transaction-dialog';
import { Pencil, Trash } from 'lucide-react';
import { ConfirmationDialog } from '@/src/components/confirmation-dialog';
import { useState } from 'react';
import { useTransactions } from './transaction-provider';
import { Transaction } from '@/src/schemas/';

interface TransactionTableActionsProps {
	portfolioId: string;
	coinId: string;
	transaction: Transaction;
}

export const TransactionTableActions = ({ portfolioId, coinId, transaction }: TransactionTableActionsProps) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(transaction);

	const { removeTransaction } = useTransactions();

	const handleDeleteTransaction = async () => {
		if (!selectedTransaction) return;
		await removeTransaction(selectedTransaction.id);
		setIsDeleteDialogOpen(false);
		setSelectedTransaction(null);
	};

	return (
		<div className="flex items-center">
			<div className={`flex gap-2 transition-opacity duration-200 `}>
				<TransactionDialog
					portfolioId={portfolioId}
					coinId={coinId}
					transaction={{
						...transaction,
						portfolioCoin: transaction.portfolioCoin || { coinId, id: transaction.portfolioCoinId, portfolioId }
					}}
					triggerIcon={<Pencil className="h-4 w-4 text-gray-600" />}
					triggerLabel="Edit transaction"
				/>
				<ActionButton icon={<Trash className="h-4 w-4 text-gray-600" />} label="Delete transaction" onClick={() => setIsDeleteDialogOpen(true)} />
			</div>
			<ConfirmationDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => {
					setIsDeleteDialogOpen(false);
					setSelectedTransaction(null);
				}}
				onConfirm={handleDeleteTransaction}
				title="Delete transaction"
				description="Are you sure you want to delete this transaction? This action cannot be undone."
				confirmText="Delete"
				loadingText="Deleting..."
				successMessage="Transaction deleted successfully"
				errorMessage="Failed to delete transaction"
			/>
		</div>
	);
};
