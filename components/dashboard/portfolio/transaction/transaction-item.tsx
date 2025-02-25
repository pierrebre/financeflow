'use client';

import { Transaction } from '@/schemas';
import { ActionButton } from '@/components/action-button';
import { Pencil, Trash } from 'lucide-react';
import { TransactionDialog } from './transaction-dialog';
import { formatTransactionForDisplay } from '@/lib/utils';

interface TransactionItemProps {
	transaction: Transaction;
	onUpdate: (transaction: Transaction) => void;
	onDelete: (transaction: Transaction) => void;
}

export function TransactionItem({ transaction, onUpdate, onDelete }: TransactionItemProps) {
	const displayTransaction = formatTransactionForDisplay(transaction);

	return (
		<div className="flex items-center justify-between p-3 border-b hover:bg-gray-50">
			<div className="grid grid-cols-6 gap-2 flex-1">
				<div className="font-medium text-sm">{transaction.type === 'ACHAT' ? 'Buy' : 'Sell'}</div>
				<div className="text-sm">{displayTransaction.formattedQuantity}</div>
				<div className="text-sm">{displayTransaction.formattedAmount}</div>
				<div className="text-sm">{displayTransaction.formattedPrice}</div>
				<div className="text-sm text-gray-500">{displayTransaction.formattedFees}</div>
				<div className="text-sm text-gray-500">{displayTransaction.formattedDate}</div>
			</div>

			{transaction.note && <div className="text-xs text-gray-500 italic ml-2 mr-4">{transaction.note}</div>}

			<div className="flex gap-2">
				<TransactionDialog coinId={transaction.portfolioCoinId} transaction={transaction} onSubmitTransaction={onUpdate} triggerIcon={<Pencil size={16} />} triggerLabel="Edit transaction" />
				<ActionButton icon={Trash} label="Remove transaction" onClick={() => onDelete(transaction)} />
			</div>
		</div>
	);
}
