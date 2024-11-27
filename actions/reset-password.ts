'use server';

import * as z from 'zod';

import { ResetPasswordSchema } from '@/schemas';
import { getUserByEmail } from '@/data/user';
import { generatePasswordResetToken } from '@/lib/token';
import { sendPasswordResetEmail } from '@/lib/mail';

export const resetPassword = async (data: z.infer<typeof ResetPasswordSchema>) => {
	const validatedFields = ResetPasswordSchema.safeParse(data);

	if (!validatedFields.success) {
		throw new Error('Invalid email');
	}

	const { email } = validatedFields.data;

	const user = await getUserByEmail(email);

	if (!user) {
		throw new Error('Email not found');
	}

	const passwordResetToken = await generatePasswordResetToken(email);

	await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

	return {
		success: 'Reset email sent'
	};
};
