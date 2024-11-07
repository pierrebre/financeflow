'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signIn } from '@/auth';
import { LoginSchema } from '@/schemas';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { AuthError } from 'next-auth';
import { getUserByEmail } from '@/data/user';
import { generateTwoFactorToken, generateVerificationToken } from '@/lib/token';
import { sendTwoFactorEmail, sendVerificationEmail } from '@/lib/mail';
import { getTwoFactorTokenbyToken } from '@/data/two-factor-token';
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation';

export const login = async (values: z.infer<typeof LoginSchema>) => {
	const valitedFields = LoginSchema.safeParse(values);

	if (!valitedFields.success) {
		throw new Error('Invalid login');
	}

	const { email, password, code } = valitedFields.data;

	const existingUser = await getUserByEmail(email);

	if (!existingUser || !existingUser.password || !existingUser.email) {
		throw new Error('Email does not exist');
	}

	if (!existingUser.emailVerified) {
		const verificationToken = await generateVerificationToken(existingUser.email);

		await sendVerificationEmail(verificationToken.email, verificationToken.token);

		return { success: 'Confirmation email sent' };
	}

	if (existingUser.isTwoFactorAuthenticated && existingUser.email) {
		if (code) {
			const twoFactorToken = await getTwoFactorTokenbyToken(code);
			if (!twoFactorToken || twoFactorToken.token !== code) {
				throw new Error('Invalid code');
			}

			const hasExpired = new Date(twoFactorToken.expires) < new Date();

			if (hasExpired) {
				throw new Error('Code expired');
			}

			await prisma.twoFactorToken.delete({
				where: {
					id: twoFactorToken.id
				}
			});

			const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

			if (existingConfirmation) {
				await prisma.twoFactorConfirmation.delete({
					where: {
						id: existingConfirmation.id
					}
				});
			}

			await prisma.twoFactorConfirmation.create({
				data: {
					userId: existingUser.id
				}
			});
		} else {
			const passwordsMatch = await bcrypt.compare(password, existingUser.password);

			if (!passwordsMatch) {
				throw new Error('Invalid password');
			}

			const twoFactorToken = await generateTwoFactorToken(existingUser.email);
			await sendTwoFactorEmail(twoFactorToken.email, twoFactorToken.token);

			return { twoFactor: true };
		}
	}

	try {
		await signIn('credentials', { email, password, redirectTo: DEFAULT_LOGIN_REDIRECT });
	} catch (error) {
		if (error instanceof AuthError) {
			if (error.type == 'CallbackRouteError') {
				throw new Error('Invalid credentials');
			} else {
				throw new Error('Something went wrong');
			}
		}
		throw error;
	}
};
