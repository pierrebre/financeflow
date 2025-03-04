'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';
import { NewPasswordSchema } from '@/src/schemas/';
import { getPasswordResetTokenByToken } from '@/src/repositories/auth/passwordResetToken';
import { getUserByEmail } from '@/src/repositories/user';
import prisma from '@/src/lib/prisma';

export const newPassword = async (values: z.infer<typeof NewPasswordSchema>, token: string | null) => {
	if (!token) throw new Error('Token is missing');

	const validatedFields = NewPasswordSchema.safeParse(values);
	if (!validatedFields.success) throw new Error('Invalid password');

	const { password } = validatedFields.data;

	const existingToken = await getPasswordResetTokenByToken(token);
	if (!existingToken) throw new Error('Invalid token');

	const hasExpired = existingToken.expires < new Date();
	if (hasExpired) throw new Error('Token has expired');

	const existingUser = await getUserByEmail(existingToken.email);
	if (!existingUser) throw new Error('Email does not exist');

	const hashedPassword = await bcrypt.hash(password, 10);

	await prisma.user.update({
		where: { id: existingUser.id },
		data: { password: hashedPassword }
	});

	await prisma.passwordResetToken.delete({ where: { id: existingToken.id } });

	return { success: 'Password updated' };
};
