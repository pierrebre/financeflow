import { z } from 'zod';

export const LoginSchema = z.object({
	email: z.string().email({ message: 'Email is required' }),
	password: z.string().min(6, { message: 'Password is required' }),
	code: z.optional(z.string().length(5), { message: 'Your one-time password must be 5 characters.' })
});

export const ResetPasswordSchema = z.object({
	email: z.string().email({ message: 'Email is required' })
});

export const NewPasswordSchema = z.object({
	password: z.string().min(6, { message: 'Minimum 6 characters' })
});

export const RegisterSchema = z.object({
	email: z.string().email({ message: 'Email is required' }),
	password: z.string().min(6, { message: 'Minimum 6 characters required' }),
	name: z.string().min(2, { message: 'Minimum is required' })
});
