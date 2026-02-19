'use server';

import * as z from 'zod';
import prisma from '@/src/lib/prisma';
import { SettingsSchema } from '@/src/schemas/';
import { currentUser } from '@/src/lib/utils';
import { generateVerificationToken } from '@/src/lib/token';
import { sendVerificationEmail } from '@/src/lib/mail';
import { getUserByEmail, getUserById } from '@/src/repositories/user';

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
	const user = await currentUser();
	if (!user) throw new Error('Unauthorized');

	const dbUser = await getUserById(user.id as string);
	if (!dbUser) throw new Error('Unauthorized');

	if (user.isOAuth) {
		values.email = undefined;
		values.isTwoFactorAuthenticated = undefined;
	}

	if (values.email && values.email !== dbUser.email) {
		const existingUser = await getUserByEmail(values.email);
		if (existingUser && existingUser.id !== dbUser.id) {
			throw new Error('Email already exists');
		}

		await prisma.user.update({
			where: { id: dbUser.id },
			data: { email: values.email }
		});

		const verificationToken = await generateVerificationToken(values.email);
		await sendVerificationEmail(verificationToken.email, verificationToken.token);

		return { success: 'Verification email sent' };
	}

	await prisma.user.update({
		where: { id: dbUser.id },
		data: { ...values }
	});

	return { success: 'Settings updated' };
};
