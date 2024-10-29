import prisma from '@/lib/prisma';

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
