import prisma from '@/src/lib/prisma';

export const getVerificationTokenByEmail = async (email: string) => {
	return await prisma.verificationToken.findFirst({ where: { email } });
};

export const getVerificationTokenByToken = async (token: string) => {
	return await prisma.verificationToken.findUnique({ where: { token } });
};
