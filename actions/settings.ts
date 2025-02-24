'use server';

import * as z from 'zod';
import prisma from '@/lib/prisma';
import { SettingsSchema } from '@/schemas';
import { currentUser } from '@/lib/utils';
import { getUserByEmail, getUserById } from '@/data/user';
import { generateVerificationToken } from '@/lib/token';
import { sendVerificationEmail } from '@/lib/mail';

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
	const user = await currentUser();

	if (!user) {
		throw new Error('Unauthorized');
	}

	const dbUser = await getUserById(user.id as string);

	if (!dbUser) {
		throw new Error('Unauthorized');
	}

	if (user.isOAuth) {
		values.email = undefined;
		values.isTwoFactorAuthenticated = undefined;
	}

	if (values.email && values.email != dbUser.email) {
		const existingUser = await getUserByEmail(values.email);

		if (existingUser && existingUser.id !== dbUser.id) {
			throw new Error('Email already exists');
		}

		await prisma.user.update({
			where: { id: dbUser.id },
			data: {
				email: values.email
			}
		});

		const verificationToken = await generateVerificationToken(values.email);

		await sendVerificationEmail(verificationToken.email, verificationToken.token);

		return { success: 'Verification email sent' };
	}

	await prisma.user.update({
		where: { id: dbUser.id },
		data: {
			...values
		}
	});

	return { success: 'Settings updated' };
};
