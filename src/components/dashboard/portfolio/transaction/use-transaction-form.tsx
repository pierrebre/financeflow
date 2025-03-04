'use client';

import { useEffect, useState } from 'react';
import { Transaction, TransactionSchema, Coin } from '@/src/schemas/';
import { getCoinData } from '@/src/actions/external/crypto';
import * as z from 'zod';

export function useTransactionForm(coinId: string, transaction?: Transaction, onSubmitCallback?: (transaction: Transaction) => void) {
	const isEditMode = !!transaction;
	const [coin, setCoin] = useState<Coin | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [shouldFetchData, setShouldFetchData] = useState(false);

	const fetchCoinData = async () => {
		if (!coinId || !shouldFetchData) {
			return;
		}

		try {
			setIsLoading(true);
			const coinData = await getCoinData(coinId);
			setCoin(coinData);
		} catch (error) {
			console.error('Failed to fetch coin data:', error);
			setError('Failed to fetch coin data');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (shouldFetchData) {
			fetchCoinData();
		}
	}, [coinId, shouldFetchData]);

	useEffect(() => {
		if (isEditMode && !coin && coinId) {
			setShouldFetchData(true);
		}
	}, [isEditMode, coin, coinId]);

	const initializeForm = () => {
		setShouldFetchData(true);
	};

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
		handleSubmit,
		initializeForm
	};
}
