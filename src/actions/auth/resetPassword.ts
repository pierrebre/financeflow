'use server';

import * as z from 'zod';
import { ResetPasswordSchema } from '@/src/schemas/';
import { generatePasswordResetToken } from '@/src/lib/token';
import { sendPasswordResetEmail } from '@/src/lib/mail';
import { getUserByEmail } from '@/src/repositories/user';

export const resetPassword = async (data: z.infer<typeof ResetPasswordSchema>) => {
	const validatedFields = ResetPasswordSchema.safeParse(data);
	if (!validatedFields.success) throw new Error('Invalid email');

	const { email } = validatedFields.data;

	const user = await getUserByEmail(email);
	if (!user) throw new Error('Email not found');

	const passwordResetToken = await generatePasswordResetToken(email);
	await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

	return { success: 'Reset email sent' };
};
