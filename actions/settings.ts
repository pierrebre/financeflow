'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';
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
		values.password = undefined;
		values.newPassword = undefined;
		values.isTwoFactorAuthenticated = undefined;
	}

	if (values.email && values.email != dbUser.email) {
		const existingUser = await getUserByEmail(values.email);

		if (existingUser && existingUser.id !== dbUser.id) {
			throw new Error('Email already exists');
		}

		const verificationToken = await generateVerificationToken(values.email);
		await sendVerificationEmail(verificationToken.email, verificationToken.token);

		return { success: 'Email sent' };
	}

	if (values.password && values.newPassword && dbUser.password) {
		const passwordsMatch = await bcrypt.compare(values.password, dbUser.password);

		if (!passwordsMatch) {
			throw new Error('Invalid password');
		}

		const hashedPassword = await bcrypt.hash(values.newPassword, 10);

		values.password = hashedPassword;
		values.newPassword = undefined;
	}
	await prisma.user.update({
		where: { id: dbUser.id },
		data: {
			...values
		}
	});

	return { success: 'Settings updated' };
};
