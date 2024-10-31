'use server';

import * as z from 'zod';

import { signIn } from '@/auth';
import { LoginSchema } from '@/lib/types/Login';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { AuthError } from 'next-auth';
import { getUserByEmail } from '@/data/user';
import { generateVerificationToken } from '@/lib/token';

export const login = async (values: z.infer<typeof LoginSchema>) => {
	const valitedFields = LoginSchema.safeParse(values);

	if (!valitedFields.success) {
		throw new Error('Invalid login');
	}

	const { email, password } = valitedFields.data;

	const existingUser = await getUserByEmail(email);

	if (!existingUser || !existingUser.password || !existingUser.email) {
		throw new Error('Email does not exist');
	}

	if (!existingUser.emailVerified) {
		const verificationToken = await generateVerificationToken(existingUser.email);

		return { success: 'Confirmation email sent' };
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
