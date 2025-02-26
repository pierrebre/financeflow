'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Transaction, TransactionSchema, Coin } from '@/schemas';
import { ActionButton } from '@/components/action-button';
import { Plus, Pencil } from 'lucide-react';
import { TransactionForm } from './transaction-form';
import { getCoinData } from '@/data/coin';
import { useTransactions } from './transaction-provider';
import * as z from 'zod';
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
	const [coin, setCoin] = useState<Coin | null>(null);
	const [isLoadingCoin, setIsLoadingCoin] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { addNewTransaction, updateExistingTransaction, isPending } = useTransactions();

	const isEditMode = !!transaction;
	const icon = triggerIcon ?? (isEditMode ? <Pencil /> : <Plus />);
	const label = triggerLabel || (isEditMode ? 'Modifier transaction' : 'Ajouter transaction');

	useEffect(() => {
		if (open && coinId) {
			const fetchCoin = async () => {
				setIsLoadingCoin(true);
				try {
					const data = await getCoinData(coinId);
					setCoin(data);
				} catch (error) {
					console.error('Erreur lors de la récupération des données de la crypto:', error);
					setError('Impossible de récupérer les données de la crypto');
				} finally {
					setIsLoadingCoin(false);
				}
			};

			fetchCoin();
		}
	}, [open, coinId]);

	const handleOpenDialog = () => {
		setError(null);
		setOpen(true);
	};

	const handleSubmit = async (values: z.infer<typeof TransactionSchema>) => {
		try {
			if (isEditMode && transaction) {
				await updateExistingTransaction({
					...transaction,
					quantityCrypto: Number(values.quantityCrypto),
					amountUsd: Number(values.amountUsd),
					type: values.type,
					pricePerCoin: Number(values.pricePerCoin),
					fees: values.fees !== undefined ? Number(values.fees) : 0,
					note: values.note || '',
					updatedAt: new Date()
				});
			} else {
				await addNewTransaction(values, portfolioId, coinId);
			}
			setOpen(false);
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError('Une erreur est survenue lors du traitement de la transaction');
			}
			console.error('Erreur de transaction:', error);
			return false;
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<ActionButton icon={isEditMode ? Pencil : Plus} label={isEditMode ? 'Modifier la transaction' : 'Ajouter une transaction'} />
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
						<Skeleton className="h-10 w-full" />
						<div className="flex gap-4">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</div>
					</div>
				) : (
					<TransactionForm onSubmit={handleSubmit} transaction={transaction} coin={coin} isPending={isPending} error={error} isEditMode={isEditMode} />
				)}
			</DialogContent>
		</Dialog>
	);
}
