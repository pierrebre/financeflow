'use client';

import { useState, useRef, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormLabel, FormItem, FormMessage, FormField, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import * as z from 'zod';
import { SettingsSchema } from '@/schemas';
import { settings } from '@/actions/settings';
import { FormError } from '@/components/form-error';
import { FormSucess } from '@/components/form-sucess';
import { Switch } from '@/components/ui/switch';
import { uploadImage } from '@/lib/utils';
import Link from 'next/link';

export default function Dashboard() {
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

	if (status === 'loading') {
		return <div>Loading...</div>;
	}

	return (
		<div className="flex min-h-screen w-full flex-col">
			<Tabs defaultValue="profile" className="">
				<TabsList className="">
					<TabsTrigger value="profile">Profile</TabsTrigger>
					<TabsTrigger value="portfolio">Portfolio</TabsTrigger>
				</TabsList>
				<TabsContent value="profile">
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
				</TabsContent>
			</Tabs>
		</div>
	);
}
