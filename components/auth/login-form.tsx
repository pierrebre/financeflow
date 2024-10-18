'use client';

import * as z from 'zod';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoginSchema } from '@/lib/types/Login';
import { Form, FormControl, FormLabel, FormItem, FormMessage, FormField } from '@/components/ui/form';

import { CardWrapper } from './card-wrapper';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export const LoginForm = () => {
	const form = useForm<z.infer<typeof LoginSchema>>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: '',
			password: ''
		}
	});

	return (
		<CardWrapper headerLabel="Welcome back" backButtonLabel="Don't have an account" backButtonHref="/auth/register" showSocial>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(() => {})} className="space-y-6">
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel htmlFor={field.name}>Email</FormLabel>
									<FormControl>
										<Input {...field} type="email" placeholder="Email" />
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
										<Input {...field} type="password" placeholder="Password" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<Button type='submit' className='w-full'>Login</Button>
				</form>
			</Form>
		</CardWrapper>
	);
};
