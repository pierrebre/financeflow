import prisma from '@/lib/prisma';

export const getAccountByUserId = async (userId: string) => {
	try {
		return await prisma.account.findFirst({
			where: {
				userId
			}
		});
	} catch (error) {
		throw error;
	}
};
