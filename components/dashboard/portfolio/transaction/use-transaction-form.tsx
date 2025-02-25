'use client';

import { useEffect, useState } from 'react';
import { Transaction, TransactionSchema } from '@/schemas';
import { Coin } from '@/schemas';
import { getCoinData } from '@/data/coin';
import * as z from 'zod';

export function useTransactionForm(coinId: string, transaction?: Transaction, onSubmitCallback?: (transaction: Transaction) => void) {
	const isEditMode = !!transaction;
	const [coin, setCoin] = useState<Coin | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (coinId) {
			setIsLoading(true);
			getCoinData(coinId)
				.then((data) => {
					setCoin(data);
					setIsLoading(false);
				})
				.catch((err) => {
					console.error('Failed to fetch coin data:', err);
					setError('Failed to fetch coin data');
					setIsLoading(false);
				});
		}
	}, [coinId]);

	const handleSubmit = (values: z.infer<typeof TransactionSchema>) => {
		setError(null);
		setIsLoading(true);

		try {
			const submittedTransaction: Transaction = {
				id: transaction?.id || crypto.randomUUID(),
				portfolioCoinId: values.portfolioCoinId,
				quantityCrypto: Number(values.quantityCrypto),
				amountUsd: Number(values.amountUsd),
				type: values.type,
				pricePerCoin: Number(values.pricePerCoin),
				fees: values.fees !== undefined ? Number(values.fees) : 0,
				note: values.note || '',
				date: transaction?.date || new Date(),
				createdAt: transaction?.createdAt || new Date(),
				updatedAt: new Date()
			};

			if (onSubmitCallback) {
				onSubmitCallback(submittedTransaction);
			}

			setIsLoading(false);
			return true;
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError('Failed to process transaction');
			}
			console.error('Transaction error:', error);
			setIsLoading(false);
			return false;
		}
	};

	return {
		coin,
		error,
		isLoading,
		isEditMode,
		handleSubmit
	};
}
