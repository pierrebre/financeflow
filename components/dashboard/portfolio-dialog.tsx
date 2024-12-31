import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createPortfolio } from '@/actions/portfolio';

interface Portfolio {
	id: string;
	name: string;
	description: string | null;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
}

interface PortfolioDialogProps {
	onOptimisticAdd: (portfolio: Portfolio) => void;
	userId: string;
}

export function PortfolioDialog({ onOptimisticAdd, userId }: PortfolioDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [isPending, startTransition] = useTransition();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		const optimisticPortfolio: Portfolio = {
			id: crypto.randomUUID(),
			name,
			description,
			userId,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		startTransition(() => {
			onOptimisticAdd(optimisticPortfolio);
		});

		try {
			await createPortfolio(name, description, userId);
			setName('');
			setDescription('');
			setOpen(false);
		} catch (error) {
			console.error('Failed to create portfolio:', error);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Add Portfolio</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create new portfolio</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<Input placeholder="Portfolio name" value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} />
					<Input placeholder="Portfolio description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isPending} />
					<Button type="submit" disabled={isPending || !name.trim()}>
						{isPending ? 'Creating...' : 'Create Portfolio'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
