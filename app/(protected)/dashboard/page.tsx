'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormLabel, FormItem, FormMessage, FormField, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useTransition } from 'react';
import * as z from 'zod';
import { SettingsSchema } from '@/schemas';
import { settings } from '@/actions/settings';
import { FormError } from '@/components/form-error';
import { FormSucess } from '@/components/form-sucess';
import { useSession } from 'next-auth/react';
import { Switch } from '@/components/ui/switch';

export default function Dashboard() {
	const { data: session, update, status } = useSession();
	const user = session?.user;

	const [error, setError] = useState<string | undefined>('');
	const [success, setSuccess] = useState<string | undefined>('');
	const [isPending, startTransition] = useTransition();

	const form = useForm<z.infer<typeof SettingsSchema>>({
		resolver: zodResolver(SettingsSchema),
		defaultValues: {
			name: user?.name ?? undefined,
			email: user?.email ?? undefined,
			password: undefined,
			newPassword: undefined,
			isTwoFactorAuthenticated: user?.isTwoFactorAuthenticated ?? undefined
		}
	});

	const onSubmit = async (values: z.infer<typeof SettingsSchema>) => {
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
										{/* 										<FormField
											control={form.control}
											name="image"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Avatar className="mt-2">
															<AvatarImage src={user?.image ?? ''} alt={user?.name ?? ''} />
															<AvatarFallback>{user?.name?.[0] ?? 'A'}</AvatarFallback>
														</Avatar>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/> */}
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
													name="password"
													render={({ field }) => (
														<FormItem>
															<FormControl>
																<Input placeholder="******" type="password" disabled={isPending} className="mt-2" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="newPassword"
													render={({ field }) => (
														<FormItem>
															<FormControl>
																<Input placeholder="******" type="password" disabled={isPending} className="mt-2" {...field} />
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
																<FormDescription>Enabled two factor authentication</FormDescription>
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
				{/* Portfolio tab omitted for brevity */}
			</Tabs>
		</div>
	);
}
