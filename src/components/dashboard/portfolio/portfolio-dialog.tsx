'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { createPortfolio } from '@/src/actions/portfolio/portfolio';
import { Portfolio, PortfolioSchema } from '@/src/schemas/';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form';
import * as z from 'zod';

interface PortfolioDialogProps {
	onOptimisticAdd: (portfolio: Portfolio) => void;
	userId: string;
}

export function PortfolioDialog({ onOptimisticAdd, userId }: PortfolioDialogProps) {
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	const form = useForm<z.infer<typeof PortfolioSchema>>({
		resolver: zodResolver(PortfolioSchema),
		defaultValues: {
			name: '',
			description: ''
		}
	});

	const onSubmit = async (values: z.infer<typeof PortfolioSchema>) => {
		setError('');
		startTransition(async () => {
			try {
				const newPortfolio = {
					id: crypto.randomUUID(),
					name: values.name,
					description: values.description || '',
					userId,
					createdAt: new Date(),
					updatedAt: new Date()
				};

				onOptimisticAdd(newPortfolio);

				await createPortfolio(values.name, values.description || '', userId);

				form.reset();
				setOpen(false);
			} catch (error) {
				if (error instanceof Error) {
					setError(error.message);
				} else {
					setError('Failed to create portfolio');
				}
				console.error('Failed to create portfolio:', error);
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Create Portfolio</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create new portfolio</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel htmlFor={field.name}>Portfolio name</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Portfolio name" disabled={isPending} required />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel htmlFor={field.name}>Portfolio description</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Portfolio description" disabled={isPending} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{error && <p className="text-sm text-red-500">{error}</p>}
						<Button type="submit" disabled={isPending || !form.formState.isValid} className="w-full">
							{isPending ? 'Creating...' : 'Create Portfolio'}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
