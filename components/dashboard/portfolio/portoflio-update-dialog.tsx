'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updatePortfolio } from '@/actions/portfolio';
import { Portfolio, PortfolioSchema } from '@/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import * as z from 'zod';

interface PortfolioUpdateDialogProps {
	portfolio: Portfolio;
	onUpdate: (updatedPortfolio: Portfolio) => void;
}

export function PortfolioUpdateDialog({ portfolio, onUpdate }: PortfolioUpdateDialogProps) {
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	const form = useForm<z.infer<typeof PortfolioSchema>>({
		resolver: zodResolver(PortfolioSchema),
		defaultValues: {
			name: portfolio.name,
			description: portfolio.description || ''
		}
	});

	const onSubmit = async (values: z.infer<typeof PortfolioSchema>) => {
		setError('');
		startTransition(async () => {
			try {
				const updatedPortfolio = {
					...portfolio,
					name: values.name,
					description: values.description || '',
					updatedAt: new Date()
				};

				onUpdate(updatedPortfolio);

				await updatePortfolio(portfolio.id, values.name, values.description || '');

				setOpen(false);
			} catch (error) {
				if (error instanceof Error) {
					setError(error.message);
				} else {
					setError('Failed to update portfolio');
				}
				console.error('Failed to update portfolio:', error);
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Edit Portfolio</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Portfolio</DialogTitle>
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
							{isPending ? 'Updating...' : 'Update Portfolio'}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
