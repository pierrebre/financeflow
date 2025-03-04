'use client';

import * as z from 'zod';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';

import { resetPassword } from '@/src/actions/auth/resetPassword';

import { ResetPasswordSchema } from '@/src/schemas/';

import { Form, FormControl, FormLabel, FormItem, FormMessage, FormField } from '@/src/components/ui/form';
import { CardWrapper } from './card-wrapper';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { FormError } from '../form-error';
import { FormSucess } from '../form-sucess';

export const ResetPasswordForm = () => {
	const [error, setError] = useState<string | undefined>('');
	const [success, setSuccess] = useState<string | undefined>('');
	const [isPending, startTransition] = useTransition();

	const form = useForm<z.infer<typeof ResetPasswordSchema>>({
		resolver: zodResolver(ResetPasswordSchema),
		defaultValues: {
			email: ''
		}
	});

	const onSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
		setError('');
		setSuccess('');

		startTransition(() => {
			resetPassword(values)
				.then((data) => {
					setSuccess(data?.success);
				})
				.catch((error) => {
					setError(error.message);
				});
		});
	};

	return (
		<CardWrapper headerLabel="Forgot your password?" backButtonLabel="Back to login" backButtonHref="/auth/login">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel htmlFor={field.name}>Email</FormLabel>
									<FormControl>
										<Input {...field} type="email" placeholder="Email" disabled={isPending} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<FormError message={error} />
					<FormSucess message={success} />
					<Button type="submit" className="w-full" disabled={isPending}>
						Send reset link
					</Button>
				</form>
			</Form>
		</CardWrapper>
	);
};
