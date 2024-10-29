'use server';

import * as z from 'zod';

import { signIn } from '@/auth';
import { LoginSchema } from '@/lib/types/Login';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { AuthError } from 'next-auth';

export const login = async (values: z.infer<typeof LoginSchema>) => {
	const valitedFields = LoginSchema.safeParse(values);

	if (!valitedFields.success) {
		throw new Error('Invalid login');
	}

	const { email, password } = valitedFields.data;

	try {
		await signIn('credentials', { email, password, redirectTo: DEFAULT_LOGIN_REDIRECT });
	} catch (error) {
		if (error instanceof AuthError) {
			console.log(error);
			if (error.type == 'CallbackRouteError') {
				throw new Error('Invalid credentials');
			} else {
				throw new Error('Something went wrong');
			}
		}
		throw error;
	}
};
