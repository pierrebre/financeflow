import prisma from '@/lib/prisma';

export const getPasswordResetTokenByToken = async (token: string) => {
	try {
		return await prisma.passwordResetToken.findUnique({
			where: {
				token
			}
		});
	} catch (error) {
		return null;
	}
};

export const getPasswordResetTokenByEmail = async (email: string) => {
	try {
		return await prisma.passwordResetToken.findFirst({
			where: {
				email
			}
		});
	} catch (error) {
		return null;
	}
};
