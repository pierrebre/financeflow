'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';
import { signIn } from '@/auth';
import { LoginSchema } from '@/src/schemas/';
import { AuthError } from 'next-auth';
import { generateTwoFactorToken, generateVerificationToken } from '@/src/lib/token';
import { sendTwoFactorEmail, sendVerificationEmail } from '@/src/lib/mail';
import { getUserByEmail } from '@/src/repositories/user';
import { getTwoFactorTokenByToken } from '@/src/repositories/auth/twoFactorToken';
import { getTwoFactorConfirmationByUserId } from '@/src/repositories/auth/twoFactorConfirmation';
import prisma from '@/src/lib/prisma';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';

export const login = async (values: z.infer<typeof LoginSchema>) => {
	const validatedFields = LoginSchema.safeParse(values);
	if (!validatedFields.success) throw new Error('Invalid login');

	const { email, password, code } = validatedFields.data;
	const existingUser = await getUserByEmail(email);
	if (!existingUser?.password || !existingUser?.email) {
		throw new Error('Invalid credentials');
	}

	if (!existingUser.emailVerified) {
		const verificationToken = await generateVerificationToken(existingUser.email);
		await sendVerificationEmail(verificationToken.email, verificationToken.token);
		return { success: 'Confirmation email sent' };
	}

	if (existingUser.isTwoFactorAuthenticated && existingUser.email) {
		if (code) {
			const twoFactorToken = await getTwoFactorTokenByToken(code);
			if (!twoFactorToken || twoFactorToken.token !== code) {
				throw new Error('Invalid code');
			}
			if (new Date(twoFactorToken.expires) < new Date()) {
				throw new Error('Code expired');
			}

			await prisma.twoFactorToken.delete({ where: { id: twoFactorToken.id } });
			const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
			if (existingConfirmation) {
				await prisma.twoFactorConfirmation.delete({ where: { id: existingConfirmation.id } });
			}
			await prisma.twoFactorConfirmation.create({ data: { userId: existingUser.id } });
		} else {
			const passwordsMatch = await bcrypt.compare(password, existingUser.password);
			if (!passwordsMatch) throw new Error('Invalid password');

			const twoFactorToken = await generateTwoFactorToken(existingUser.email);
			await sendTwoFactorEmail(twoFactorToken.email, twoFactorToken.token);
			return { twoFactor: true };
		}
	}

	try {
		await signIn('credentials', { email, password, redirectTo: DEFAULT_LOGIN_REDIRECT });
	} catch (error) {
		if (error instanceof AuthError) {
			throw new Error(error.type === 'CallbackRouteError' ? 'Invalid credentials' : 'Something went wrong');
		}
		throw error;
	}
};
