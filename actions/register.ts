'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';

import prisma from '@/lib/prisma';
import { RegisterSchema } from '@/lib/types/Register';
import { getUserByEmail } from '@/data/user';

export const register = async (values: z.infer<typeof RegisterSchema>) => {
	const valitedFields = RegisterSchema.safeParse(values);

	if (!valitedFields.success) {
		throw new Error('Invalid login');
	}

	const { email, password, name } = valitedFields.data;
	const hashedPassword = await bcrypt.hash(password, 10);

	const existingUser = await getUserByEmail(email);

	if (existingUser) {
		throw new Error('Email already exists');
	}

	await prisma.user.create({
		data: {
			email,
			name,
			password: hashedPassword
		}
	});

	return { success: 'User created' };
};
