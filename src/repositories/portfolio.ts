import prisma from '@/src/lib/prisma';

export const getUserPortfoliosWithUserId = async (userId: string) => {
	try {
		return await prisma.portfolio.findMany({
			where: {
				userId
			},
			orderBy: {
				createdAt: 'desc'
			}
		});
	} catch (error) {
		throw new Error('Error fetching portfolios');
	}
};

export const getCoinsByPortfolio = async (portfolioId: string) => {
	if (!portfolioId) {
		throw new Error('Portfolio ID is required');
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
		throw new Error('Error fetching coins by portfolio');
	}
};
