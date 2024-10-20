'use server';

import * as z from 'zod';

import { LoginSchema } from '@/lib/types/Login';

export const login = async (values: z.infer<typeof LoginSchema>) => {
	const valitedFields = LoginSchema.safeParse(values);

	if (!valitedFields.success) {
		throw new Error('Invalid login');
	}

	return { success: 'Email and password are valid' };
};
