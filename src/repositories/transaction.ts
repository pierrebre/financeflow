import prisma from '@/src/lib/prisma';
import { Transaction } from '@/src/schemas/';

export const getTransactions = async (portfolioId: string): Promise<Transaction[]> => {
	return await prisma.transaction.findMany({
		where: { portfolioCoin: { portfolioId } },
		include: {
			portfolioCoin: { select: { id: true, coinId: true, portfolioId: true } }
		},
		orderBy: { date: 'desc' }
	});
};
