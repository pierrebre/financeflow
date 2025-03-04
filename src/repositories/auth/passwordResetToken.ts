import prisma from '@/src/lib/prisma';

export const getPasswordResetTokenByToken = async (token: string) => {
	return await prisma.passwordResetToken.findUnique({ where: { token } });
};

export const getPasswordResetTokenByEmail = async (email: string) => {
	return await prisma.passwordResetToken.findFirst({ where: { email } });
};
