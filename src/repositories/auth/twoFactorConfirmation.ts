import prisma from '@/src/lib/prisma';

export const getTwoFactorConfirmationByUserId = async (userId: string) => {
	return await prisma.twoFactorConfirmation.findUnique({ where: { userId } });
};
