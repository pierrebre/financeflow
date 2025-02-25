'use server';

import prisma from '@/lib/prisma';
import { Transaction, TransactionType } from '@/schemas';
import { revalidatePath } from 'next/cache';

interface AddTransactionParams {
	portfolioId: string;
	coinId: string;
	quantityCrypto: number;
	amountUsd: number;
	type: TransactionType;
	pricePerCoin: number;
	fees?: number;
	note?: string;
}

export async function addTransaction(params: AddTransactionParams) {
	const { portfolioId, coinId, quantityCrypto, amountUsd, type, pricePerCoin, fees = 0, note = '' } = params;

	try {
		const portfolioCoin = await prisma.portfolioCoin.findUnique({
			where: {
				portfolioId_coinId: {
					portfolioId,
					coinId
				}
			},
			include: {
				portfolio: true
			}
		});

		if (!portfolioCoin) {
			console.error('Portfolio coin not found for portfolioId and coinId:', { portfolioId, coinId });
			throw new Error('Portfolio coin not found');
		}

		const transaction = await prisma.transaction.create({
			data: {
				portfolioCoinId: portfolioCoin.id,
				quantityCrypto,
				amountUsd,
				type,
				pricePerCoin,
				fees,
				note
			}
		});

		revalidatePath(`/dashboard/portfolio/${portfolioCoin.portfolio.id}`);

		return { success: true, transaction };
	} catch (error) {
		console.error('Error adding transaction:', error);
		throw error;
	}
}

export async function deleteTransaction(transactionId: string) {
	try {
		await prisma.transaction.delete({
			where: {
				id: transactionId
			}
		});
	} catch (error) {
		console.error('Error deleting transaction:', error);
		throw error;
	}
}

export const updateTransaction = async (transaction: Transaction) => {
	try {
		await prisma.transaction.update({
			where: {
				id: transaction.id
			},
			data: {
				quantityCrypto: transaction.quantityCrypto,
				amountUsd: transaction.amountUsd,
				type: transaction.type,
				pricePerCoin: transaction.pricePerCoin,
				fees: transaction.fees,
				note: transaction.note
			}
		});
	} catch (error) {
		console.error('Error updating transaction:', error);
		throw error;
	}
};

export async function getTransactions(portfolioId: string): Promise<Transaction[]> {
	if (!portfolioId) {
		throw new Error('Portfolio ID is required');
	}

	try {
		const transactions = await prisma.transaction.findMany({
			where: {
				portfolioCoin: {
					portfolioId
				}
			},
			include: {
				portfolioCoin: true
			}
		});

		return transactions;
	} catch (error) {
		console.error('Error fetching transactions:', error);
		throw error;
	}
}
