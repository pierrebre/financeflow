import prisma from '@/src/lib/prisma';

export const getUserById = async (id: string) => {
	try {
		return await prisma.user.findUnique({
			where: {
				id
			}
		});
	} catch (error) {
		return null;
	}
};

export const getUserByEmail = async (email: string) => {
	try {
		return await prisma.user.findUnique({
			where: {
				email
			}
		});
	} catch (error) {
		return null;
	}
};

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
