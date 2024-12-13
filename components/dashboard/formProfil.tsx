'use client';

import { useSession } from 'next-auth/react';
import * as z from 'zod';
import { SettingsSchema } from '@/schemas';
import { settings } from '@/actions/settings';
import { FormError } from '@/components/form-error';
import { FormSucess } from '@/components/form-sucess';
import { Switch } from '@/components/ui/switch';
import { uploadImage } from '@/lib/utils';
import { FaUser } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormItem, FormMessage, FormField, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useRef, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FormProfil() {
	const { data: session, update, status } = useSession();
	const user = session?.user;

	const [error, setError] = useState<string | undefined>('');
	const [success, setSuccess] = useState<string | undefined>('');
	const [isPending, startTransition] = useTransition();
	const inputFileRef = useRef<HTMLInputElement>(null);

	const form = useForm<z.infer<typeof SettingsSchema>>({
		resolver: zodResolver(SettingsSchema),
		defaultValues: {
			name: user?.name ?? undefined,
			email: user?.email ?? undefined,
			isTwoFactorAuthenticated: user?.isTwoFactorAuthenticated ?? undefined,
			image: user?.image ?? undefined
		}
	});

	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name ?? '',
				email: user.email ?? undefined,
				isTwoFactorAuthenticated: user.isTwoFactorAuthenticated,
				image: user.image
			});
		}
	}, [user, form]);

	if (status === 'loading') {
		return <div>Loading...</div>;
	}

	const onSubmit = async (values: z.infer<typeof SettingsSchema>) => {
		if (inputFileRef.current && inputFileRef.current.files && inputFileRef.current.files.length > 0) {
			const file = inputFileRef.current.files[0];
			values.image = await uploadImage(file);
		}

		startTransition(() => {
			settings(values)
				.then((data) => {
					setSuccess(data.success);
					update();
				})
				.catch((err) => {
					setError(err.message);
				});
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>About Me</CardTitle>
				<CardDescription>Tell us about yourself.</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<div className="space-y-4">
							<FormField
								control={form.control}
								name="image"
								render={({ field }) => (
									<FormItem className="flex">
										<FormControl>
											<Avatar className="mt-2">
												<AvatarImage src={user?.image ?? ''} alt={user?.name ?? ''} />
												<AvatarFallback>
													<FaUser className="h-5 w-5" />
												</AvatarFallback>
											</Avatar>
										</FormControl>
										<Input type="file" ref={inputFileRef} accept="image/*" className="ml-4	" onChange={(e) => field.onChange(e.target.files)} />
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input placeholder="Name" disabled={isPending} className="mt-2" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{!user?.isOAuth && (
								<>
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input placeholder="Email" type="email" disabled={isPending} className="mt-2" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="isTwoFactorAuthenticated"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm ">
												<div className="space-y-0 5">
													<FormDescription>Enable two-factor authentication</FormDescription>
												</div>
												<FormControl>
													<Switch disabled={isPending} checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</>
							)}
						</div>
						<FormError message={error} />
						<FormSucess message={success} />
						<Button type="submit" className="mt-4" disabled={isPending}>
							Save
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
