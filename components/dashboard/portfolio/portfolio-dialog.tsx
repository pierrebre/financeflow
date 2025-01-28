'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createPortfolio } from '@/actions/portfolio';
import { Portfolio } from '@/schemas';

interface PortfolioDialogProps {
	onOptimisticAdd: (portfolio: Portfolio) => void;
	userId: string;
}

export function PortfolioDialog({ onOptimisticAdd, userId }: PortfolioDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);

		if (!name.trim()) {
			setError('Portfolio name is required');
			return;
		}

		const optimisticPortfolio: Portfolio = {
			id: crypto.randomUUID(),
			name,
			description,
			userId,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		startTransition(async () => {
			try {
				onOptimisticAdd(optimisticPortfolio);

				await createPortfolio(name, description, userId);

				setName('');
				setDescription('');
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
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Create Portfolio</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create new portfolio</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<Input placeholder="Portfolio name" value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} required />
					<Input placeholder="Portfolio description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isPending} />
					{error && <p className="text-sm text-red-500">{error}</p>}
					<Button type="submit" disabled={isPending || !name.trim()} className="w-full">
						{isPending ? 'Creating...' : 'Create Portfolio'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
