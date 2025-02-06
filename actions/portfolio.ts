'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createPortfolio(name: string, description: string, userId: string) {
	if (!name || !userId) {
		throw new Error('Name and userId are required');
	}

	try {
		const portfolio = await prisma.portfolio.create({
			data: {
				name,
				description,
				userId
			}
		});

		revalidatePath('/dashboard');
		return portfolio;
	} catch (error) {
		console.error('Error creating portfolio:', error);
		throw error;
	}
}

export const addCoinToPortfolio = async (portfolioId: string, coinId: string) => {
	const result = await prisma.portfolioCoin.create({
		data: {
			portfolioId,
			coinId
		}
	});

	return result;
};

export async function getCoinsByPortfolio(portfolioId: string): Promise<any> {
	const coins = await prisma.portfolioCoin.findMany({
		where: {
			portfolioId
		}
	});

	return coins;
}
