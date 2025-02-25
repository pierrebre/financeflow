'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Transaction, TransactionSchema } from '@/schemas';
import { ActionButton } from '@/components/action-button';
import { Plus, Pencil, LucideIcon } from 'lucide-react';
import { TransactionForm } from './transaction-form';
import { useTransactionForm } from './use-transaction-form';
import * as z from 'zod';

interface TransactionDialogProps {
	onSubmitTransaction: (transaction: Transaction) => void;
	userId?: string;
	coinId: string;
	transaction?: Transaction;
	triggerIcon?: React.ReactNode;
	triggerLabel?: string;
}

export function TransactionDialog({ onSubmitTransaction, coinId, transaction, triggerIcon, triggerLabel }: TransactionDialogProps) {
	const [open, setOpen] = useState(false);

	const { coin, error, isLoading, isEditMode, handleSubmit } = useTransactionForm(coinId, transaction, (newTransaction) => {
		onSubmitTransaction(newTransaction);
		setOpen(false);
	});

	const icon = (isEditMode ? Pencil : Plus) as LucideIcon;
	const label = triggerLabel || (isEditMode ? 'Edit transaction' : 'Add transaction');

	const onSubmitForm = (values: z.infer<typeof TransactionSchema>) => {
		const success = handleSubmit(values);
		if (success) {
			setOpen(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<ActionButton icon={icon} label={label} onClick={() => setOpen(true)} />
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{isEditMode ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
				</DialogHeader>
				<TransactionForm onSubmit={onSubmitForm} transaction={transaction} coin={coin} isPending={isLoading} error={error} isEditMode={isEditMode} />
			</DialogContent>
		</Dialog>
	);
}
