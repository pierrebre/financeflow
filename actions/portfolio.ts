'use server';

import prisma from '@/lib/prisma';
import { Portfolio, PortfolioCoin } from '@/schemas';
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

const handleDatabaseError = (error: unknown, operation: string): never => {
	console.error(`Error during ${operation}:`, error);
	if (error instanceof Error) {
		throw new PortfolioError(error.message, 'DATABASE_ERROR');
	}
	throw new PortfolioError('An unexpected error occurred', 'UNKNOWN_ERROR');
};

export async function createPortfolio(name: string, description: string, userId: string): Promise<Portfolio> {
	if (!name?.trim()) {
		throw new PortfolioError('Portfolio name is required', 'VALIDATION_ERROR');
	}
	if (!userId) {
		throw new PortfolioError('User ID is required', 'VALIDATION_ERROR');
	}

	try {
		const portfolio = await prisma.portfolio.create({
			data: { name: name.trim(), description, userId }
		});

		revalidatePath('/dashboard');
		return portfolio;
	} catch (error) {
		return handleDatabaseError(error, 'portfolio creation');
	}
}

export async function addCoinToPortfolio(portfolioId: string, coinId: string): Promise<PortfolioCoin> {
	if (!portfolioId || !coinId) {
		throw new PortfolioError('Portfolio ID and Coin ID are required', 'VALIDATION_ERROR');
	}

	try {
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
	} catch (error) {
		return handleDatabaseError(error, 'adding coin to portfolio');
	}
}

export async function deleteCoinFromPortfolio(coinId: string, portfolioId: string): Promise<PortfolioCoin> {
	if (!coinId || !portfolioId) {
		throw new PortfolioError('Coin ID and Portfolio ID are required', 'VALIDATION_ERROR');
	}

	try {
		const result = await prisma.portfolioCoin.delete({
			where: {
				portfolioId_coinId: {
					coinId,
					portfolioId
				}
			}
		});

		revalidatePath(`/portfolio/${portfolioId}`);
		return result;
	} catch (error) {
		console.error('Delete error:', error);
		return handleDatabaseError(error, 'deleting coin from portfolio');
	}
}

export async function getCoinsByPortfolio(portfolioId: string): Promise<PortfolioCoin[]> {
	if (!portfolioId) {
		throw new PortfolioError('Portfolio ID is required', 'VALIDATION_ERROR');
	}

	try {
		const result = await prisma.portfolioCoin.findMany({
			where: { portfolioId },
			include: {
				coin: true
			}
		});

		return result.map((item) => ({
			id: item.id,
			portfolioId: item.portfolioId,
			coinId: item.coinId,
			coin: item.coin
				? {
						id: item.coin.CoinId,
						name: item.coin.CoinId
					}
				: undefined
		}));
	} catch (error) {
		return handleDatabaseError(error, 'fetching portfolio coins');
	}
}

export async function deletePortfolio(portfolioId: string): Promise<Portfolio | null> {
	if (!portfolioId) {
		throw new PortfolioError('Portfolio ID is required', 'VALIDATION_ERROR');
	}

	try {
		const result = await prisma.portfolio.delete({
			where: {
				id: portfolioId
			}
		});

		revalidatePath('/dashboard');
		return result;
	} catch (error) {
		return handleDatabaseError(error, 'deleting portfolio');
	}
}

export async function updatePortfolio(portfolioId: string, name: string, description: string): Promise<Portfolio> {
	if (!portfolioId) {
		throw new PortfolioError('Portfolio ID is required', 'VALIDATION_ERROR');
	}
	if (!name?.trim()) {
		throw new PortfolioError('Portfolio name is required', 'VALIDATION_ERROR');
	}

	try {
		const existingPortfolio = await prisma.portfolio.findUnique({
			where: { id: portfolioId }
		});

		if (!existingPortfolio) {
			throw new PortfolioError('Portfolio not found', 'NOT_FOUND');
		}

		const portfolio = await prisma.portfolio.update({
			where: { id: portfolioId },
			data: { name: name.trim(), description }
		});

		revalidatePath(`/portfolio/${portfolioId}`);
		return portfolio;
	} catch (error) {
		return handleDatabaseError(error, 'updating portfolio');
	}
}
