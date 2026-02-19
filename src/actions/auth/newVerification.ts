'use server';

import { getVerificationTokenByToken } from '@/src/repositories/auth/verificationToken';
import { getUserByEmail } from '@/src/repositories/user';
import prisma from '@/src/lib/prisma';

export const newVerification = async (token: string) => {
	const verificationToken = await getVerificationTokenByToken(token);
	if (!verificationToken) throw new Error('Token does not exist');

	const hasExpired = new Date(verificationToken.expires) < new Date();
	if (hasExpired) throw new Error('Token has expired');

	const user = await getUserByEmail(verificationToken.email);
	if (!user) throw new Error('User does not exist');

	await prisma.user.update({
		where: { id: user.id },
		data: { emailVerified: new Date(), email: verificationToken.email }
	});

	await prisma.verificationToken.delete({ where: { id: verificationToken.id } });

	return { success: 'Email verified' };
};
