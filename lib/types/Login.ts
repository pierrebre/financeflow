import * as z from 'zod';

export const LoginSchema = z.object({
	email: z.string().email({
		message: 'Email is required'
	}),
	password: z.string().min(6, { message: 'Password is required' })
});

export const ResetPasswordSchema = z.object({
	email: z.string().email({
		message: 'Email is required'
	})
});

export const NewPasswordSchema = z.object({
	password: z.string().min(6, {
		message: 'Minimum 6 characters'
	})
});
