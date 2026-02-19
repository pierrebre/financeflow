'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/src/lib/prisma';
import { RegisterSchema } from '@/src/schemas/';
import { generateVerificationToken } from '@/src/lib/token';
import { sendVerificationEmail } from '@/src/lib/mail';
import { getUserByEmail } from '@/src/repositories/user';

export const register = async (values: z.infer<typeof RegisterSchema>) => {
	const validatedFields = RegisterSchema.safeParse(values);
	if (!validatedFields.success) throw new Error('Invalid login');

	const { email, password, name } = validatedFields.data;
	const hashedPassword = await bcrypt.hash(password, 10);

	const existingUser = await getUserByEmail(email);
	if (existingUser) throw new Error('Email already exists');

	await prisma.user.create({
		data: { email, name, password: hashedPassword }
	});

	const verificationToken = await generateVerificationToken(email);
	await sendVerificationEmail(verificationToken.email, verificationToken.token);

	return { success: 'Confirmation email sent' };
};
