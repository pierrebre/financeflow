'use server';

import prisma from '@/src/lib/prisma';
import { PortfolioCoin } from '@/src/schemas';
import { revalidatePath } from 'next/cache';

class PortfolioError extends Error {
	constructor(
		message: string,
		public code: string
	) {
		super(message);
		this.name = 'PortfolioError';
	}
}

export async function addCoinToPortfolio(portfolioId: string, coinId: string): Promise<PortfolioCoin> {
	if (!portfolioId || !coinId) {
		throw new PortfolioError('Portfolio ID and Coin ID are required', 'VALIDATION_ERROR');
	}

	const portfolio = await prisma.portfolio.findUnique({
		where: { id: portfolioId }
	});

	if (!portfolio) {
		throw new PortfolioError('Portfolio not found', 'NOT_FOUND');
	}

	let coin = await prisma.coin.findUnique({
		where: { CoinId: coinId }
	});

	if (!coin) {
		await prisma.coin.create({
			data: { CoinId: coinId }
		});
	}

	const existingPortfolioCoin = await prisma.portfolioCoin.findUnique({
		where: {
			portfolioId_coinId: {
				portfolioId,
				coinId
			}
		}
	});

	if (existingPortfolioCoin) {
		return existingPortfolioCoin;
	}

	const portfolioCoin = await prisma.portfolioCoin.create({
		data: {
			portfolioId,
			coinId
		}
	});

	revalidatePath(`/portfolio/${portfolioId}`);
	return portfolioCoin;
}

export async function deleteCoinFromPortfolio(coinId: string, portfolioId: string): Promise<PortfolioCoin> {
	if (!coinId || !portfolioId) throw new PortfolioError('Coin ID and Portfolio ID are required', 'VALIDATION_ERROR');

	const result = await prisma.portfolioCoin.delete({
		where: { portfolioId_coinId: { coinId, portfolioId } }
	});

	revalidatePath(`/portfolio/${portfolioId}`);
	return result;
}
