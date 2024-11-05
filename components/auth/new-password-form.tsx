'use client';

import * as z from 'zod';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';

import { newPassword } from '@/actions/new-password';

import { NewPasswordSchema } from '@/schemas';

import { Form, FormControl, FormLabel, FormItem, FormMessage, FormField } from '@/components/ui/form';
import { CardWrapper } from './card-wrapper';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { FormError } from '../form-error';
import { FormSucess } from '../form-sucess';

export const NewPasswordForm = () => {
	const searchParams = useSearchParams();
	const token = searchParams.get('token');

	const [error, setError] = useState<string | undefined>('');
	const [success, setSuccess] = useState<string | undefined>('');
	const [isPending, startTransition] = useTransition();

	const form = useForm<z.infer<typeof NewPasswordSchema>>({
		resolver: zodResolver(NewPasswordSchema),
		defaultValues: {
			password: ''
		}
	});

	const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
		setError('');
		setSuccess('');

		startTransition(() => {
			newPassword(values, token)
				.then((data) => {
					setSuccess(data?.success);
				})
				.catch((error) => {
					setError(error.message);
				});
		});
	};

	return (
		<CardWrapper headerLabel="Enter a new password" backButtonLabel="Back to login" backButtonHref="/auth/login">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel htmlFor={field.name}>Password</FormLabel>
									<FormControl>
										<Input {...field} type="password" placeholder="********" disabled={isPending} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<FormError message={error} />
					<FormSucess message={success} />
					<Button type="submit" className="w-full" disabled={isPending}>
						Reset password
					</Button>
				</form>
			</Form>
		</CardWrapper>
	);
};
