'use server';

import prisma from '@/src/lib/prisma';
import { Transaction, TransactionType } from '@/src/schemas/';
import { revalidatePath } from 'next/cache';
import { getTransactions as getTransactionsRepo } from '@/src/repositories/transaction';

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
	const { portfolioId, coinId, quantityCrypto, amountUsd, type, pricePerCoin, fees, note } = params;
	if (!portfolioId || !coinId || !quantityCrypto || !amountUsd || !type || !pricePerCoin) {
		throw new Error('Missing required transaction parameters');
	}

	const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } });
	if (!portfolio) throw new Error('Portfolio not found');

	let portfolioCoin = await prisma.portfolioCoin.findUnique({
		where: { portfolioId_coinId: { portfolioId, coinId } }
	});
	if (!portfolioCoin) {
		portfolioCoin = await prisma.portfolioCoin.create({ data: { portfolioId, coinId } });
	}

	const transaction = await prisma.transaction.create({
		data: {
			portfolioCoinId: portfolioCoin.id,
			quantityCrypto,
			amountUsd,
			type,
			pricePerCoin,
			fees: fees || 0,
			note,
			date: new Date()
		}
	});
	revalidatePath(`/portfolios/${portfolioId}`);
	return transaction;
}

export async function deleteTransaction(transactionId: string) {
	await prisma.transaction.delete({ where: { id: transactionId } });
}

export async function updateTransaction(transaction: Transaction) {
	await prisma.transaction.update({
		where: { id: transaction.id },
		data: {
			quantityCrypto: transaction.quantityCrypto,
			amountUsd: transaction.amountUsd,
			type: transaction.type,
			pricePerCoin: transaction.pricePerCoin,
			fees: transaction.fees,
			note: transaction.note
		}
	});
}

export async function getTransactions(portfolioId: string): Promise<Transaction[]> {
	if (!portfolioId) throw new Error('Portfolio ID is required');
	return await getTransactionsRepo(portfolioId);
}
