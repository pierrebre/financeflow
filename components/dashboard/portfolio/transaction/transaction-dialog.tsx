'use client';
import * as z from 'zod';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Transaction, TransactionSchema } from '@/schemas';
import { ActionButton } from '@/components/action-button'; // Vérifiez cet import
import { Plus, Pencil } from 'lucide-react';
import { TransactionForm } from './transaction-form';
import { useTransactions } from './transaction-provider';
import { useQuery } from '@tanstack/react-query';
import { getCoinData } from '@/data/coin';
import { Skeleton } from '@/components/ui/skeleton';

interface TransactionDialogProps {
	portfolioId: string;
	coinId: string;
	transaction?: Transaction;
	triggerIcon?: React.ReactNode;
	triggerLabel?: string;
}

export function TransactionDialog({ portfolioId, coinId, transaction, triggerIcon, triggerLabel }: TransactionDialogProps) {
	const [open, setOpen] = useState(false);
	const { addNewTransaction, updateExistingTransaction, isPending } = useTransactions();
	const isEditMode = !!transaction;

	const {
		data: coin,
		isLoading: isLoadingCoin,
		error: coinError
	} = useQuery({
		queryKey: ['coin', coinId],
		queryFn: () => getCoinData(coinId),
		enabled: !!coinId && open,
		staleTime: 5 * 60 * 1000
	});

	const handleSubmit = async (values: z.infer<typeof TransactionSchema>) => {
		if (isEditMode && transaction) {
			await updateExistingTransaction({
				...transaction,
				...values,
				quantityCrypto: Number(values.quantityCrypto),
				amountUsd: Number(values.amountUsd),
				pricePerCoin: Number(values.pricePerCoin),
				fees: values.fees ?? 0,
				note: values.note ?? '',
				updatedAt: new Date()
			});
		} else {
			await addNewTransaction(values, portfolioId, coinId);
		}
		setOpen(false);
	};

	const errorMessage = useMemo(() => (coinError ? 'Failed to load coin data' : null), [coinError]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<ActionButton icon={triggerIcon ?? (isEditMode ? <Pencil /> : <Plus />)} label={triggerLabel ?? (isEditMode ? 'Modifier la transaction' : 'Ajouter une transaction')} />
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{isEditMode ? 'Modifier la transaction' : 'Ajouter une transaction'}</DialogTitle>
				</DialogHeader>
				{isLoadingCoin ? (
					<div className="space-y-4">
						<Skeleton className="h-10 w-full" />
						<div className="flex gap-4">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</div>
						<Skeleton className="h-10 w-full" />
					</div>
				) : (
					<TransactionForm onSubmit={handleSubmit} transaction={transaction} coin={coin} isPending={isPending} error={errorMessage} isEditMode={isEditMode} />
				)}
			</DialogContent>
		</Dialog>
	);
}
