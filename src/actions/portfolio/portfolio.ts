'use server';

import prisma from '@/src/lib/prisma';
import { Portfolio } from '@/src/schemas';
import { revalidatePath } from 'next/cache';
import { getUserPortfoliosWithUserId } from '@/src/repositories/portfolio';

class PortfolioError extends Error {
	constructor(
		message: string,
		public code: string
	) {
		super(message);
		this.name = 'PortfolioError';
	}
}

export async function createPortfolio(name: string, description: string, userId: string): Promise<Portfolio> {
	if (!name?.trim() || !userId) throw new PortfolioError('Required fields missing', 'VALIDATION_ERROR');

	const portfolio = await prisma.portfolio.create({
		data: { name: name.trim(), description, userId }
	});
	revalidatePath('/dashboard');
	return portfolio;
}

export async function updatePortfolio(portfolioId: string, name: string, description: string): Promise<Portfolio> {
	if (!portfolioId || !name?.trim()) throw new PortfolioError('Required fields missing', 'VALIDATION_ERROR');

	const portfolio = await prisma.portfolio.update({
		where: { id: portfolioId },
		data: { name: name.trim(), description }
	});
	revalidatePath(`/portfolio/${portfolioId}`);
	return portfolio;
}

export async function deletePortfolio(portfolioId: string): Promise<Portfolio> {
	if (!portfolioId) throw new PortfolioError('Portfolio ID is required', 'VALIDATION_ERROR');

	const result = await prisma.portfolio.delete({ where: { id: portfolioId } });
	revalidatePath('/dashboard');
	return result;
}

export async function getUserPortfolios(userId: string): Promise<Portfolio[]> {
	return await getUserPortfoliosWithUserId(userId);
}

export async function getMyPortfolios(): Promise<Portfolio[]> {
	const { auth } = await import('@/auth');
	const session = await auth();
	if (!session?.user?.id) return [];
	return await getUserPortfoliosWithUserId(session.user.id);
}
