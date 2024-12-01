'use client';

import * as z from 'zod';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { login } from '@/actions/login';

import { LoginSchema } from '@/schemas';

import { Form, FormControl, FormLabel, FormItem, FormMessage, FormField } from '@/components/ui/form';
import { CardWrapper } from './card-wrapper';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { FormError } from '../form-error';
import { FormSucess } from '../form-sucess';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export const LoginForm = () => {
	const searchParams = useSearchParams();
	const urlError = searchParams?.get('error') === 'OAuthAccountNotLinked' ? 'Email already used in different provider' : '';

	const [showTwoFactor, setShowTwoFactor] = useState(false);
	const [error, setError] = useState<string | undefined>('');
	const [success, setSuccess] = useState<string | undefined>('');
	const [isPending, startTransition] = useTransition();

	const form = useForm<z.infer<typeof LoginSchema>>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: '',
			password: ''
		}
	});

	const onSubmit = (values: z.infer<typeof LoginSchema>) => {
		setError('');
		setSuccess('');

		startTransition(() => {
			login(values)
				.then((data) => {
					if (data?.twoFactor) {
						setShowTwoFactor(true);
						return;
					}
					form.reset();
					setSuccess(data?.success);
				})
				.catch((error) => {
					if (error.message === 'Invalid code' || error.message === 'Code expired') {
						setError(error.message);
						form.setError('code', { message: error.message });
						return;
					}
					setError(error.message);
					form.reset();
				});
		});
	};

	return (
		<CardWrapper headerLabel="Welcome back" backButtonLabel="Don't have an account" backButtonHref="/auth/register" showSocial>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-4">
						{showTwoFactor && (
							<FormField
								control={form.control}
								name="code"
								render={({ field }) => (
									<FormItem className="flex flex-col items-center">
										<FormLabel className="mb-2" htmlFor={field.name}>
											2FA Code
										</FormLabel>
										<FormControl>
											<InputOTP maxLength={5} {...field}>
												<InputOTPGroup>
													<InputOTPSlot index={0} />
													<InputOTPSlot index={1} />
													<InputOTPSlot index={2} />
													<InputOTPSlot index={3} />
													<InputOTPSlot index={4} />
												</InputOTPGroup>
											</InputOTP>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
						{!showTwoFactor && (
							<>
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
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel htmlFor={field.name}>Password</FormLabel>
											<FormControl>
												<Input {...field} type="password" placeholder="Password" disabled={isPending} />
											</FormControl>
											<Button className="px-0 font-normal" size="sm" variant="link" asChild>
												<Link href="/auth/reset-password">Forgot password?</Link>
											</Button>
											<FormMessage />
										</FormItem>
									)}
								/>
							</>
						)}
					</div>
					<FormError message={error || urlError} />
					<FormSucess message={success} />
					<Button type="submit" className="w-full" disabled={isPending}>
						{showTwoFactor ? 'Confirm' : 'Login'}
					</Button>
				</form>
			</Form>
		</CardWrapper>
	);
};
