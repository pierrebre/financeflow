import prisma from '@/lib/prisma';

export const getUserPortfoliosWithUserId = async (userId: string) => {
  try {
    return await prisma.portfolio.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  } catch (error) {
    console.error('Error fetching user portfolios:', error);
    throw error;
  }
};