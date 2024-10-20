'use server';

import * as z from 'zod';

import { RegisterSchema } from '@/lib/types/Register';

export const register = async (values: z.infer<typeof RegisterSchema>) => {
	const valitedFields = RegisterSchema.safeParse(values);

	if (!valitedFields.success) {
		throw new Error('Invalid login');
	}

	return { success: 'Email and password are vvalid' };
};
