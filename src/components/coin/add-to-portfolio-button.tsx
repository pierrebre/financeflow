'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { getMyPortfolios } from '@/src/actions/portfolio/portfolio';
import { addCoinToPortfolio } from '@/src/actions/portfolio/portfolioCoin';
import { useToast } from '@/src/hooks/use-toast';
import { Portfolio } from '@/src/schemas/';
import Link from 'next/link';

interface AddToPortfolioButtonProps {
	coinId: string;
	coinName: string;
}

export function AddToPortfolioButton({ coinId, coinName }: AddToPortfolioButtonProps) {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<Portfolio | null>(null);
	const [adding, setAdding] = useState(false);
	const { toast } = useToast();

	const { data: portfolios = [], isLoading } = useQuery({
		queryKey: ['my-portfolios'],
		queryFn: () => getMyPortfolios(),
		enabled: open,
		staleTime: 60_000
	});

	async function handleAdd() {
		if (!selected) return;
		setAdding(true);
		try {
			await addCoinToPortfolio(selected.id, coinId);
			toast({
				title: 'Added to portfolio',
				description: `${coinName} was added to "${selected.name}"`
			});
			setOpen(false);
			setSelected(null);
		} catch {
			toast({ title: 'Error', description: 'Failed to add coin to portfolio', variant: 'destructive' });
		} finally {
			setAdding(false);
		}
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2 h-8">
					<PlusCircle size={14} />
					Add to Portfolio
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-60 p-3" align="end">
				<p className="text-sm font-semibold mb-2">Select portfolio</p>

				{isLoading ? (
					<div className="flex justify-center py-4">
						<Loader2 size={16} className="animate-spin text-muted-foreground" />
					</div>
				) : portfolios.length === 0 ? (
					<p className="text-xs text-muted-foreground py-2">
						No portfolios yet.{' '}
						<Link href="/dashboard" className="text-primary hover:underline" onClick={() => setOpen(false)}>
							Create one
						</Link>
					</p>
				) : (
					<div className="space-y-1 mb-3 max-h-48 overflow-y-auto">
						{portfolios.map((p) => (
							<button
								key={p.id}
								onClick={() => setSelected(p)}
								className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between hover:bg-muted transition-colors ${
									selected?.id === p.id ? 'bg-muted font-medium' : ''
								}`}
							>
								<span className="truncate">{p.name}</span>
								{selected?.id === p.id && <Check size={13} className="text-primary shrink-0 ml-1" />}
							</button>
						))}
					</div>
				)}

				{portfolios.length > 0 && (
					<Button size="sm" className="w-full mt-1" disabled={!selected || adding} onClick={handleAdd}>
						{adding ? (
							<>
								<Loader2 size={13} className="animate-spin mr-1.5" />
								Adding…
							</>
						) : (
							'Confirm'
						)}
					</Button>
				)}
			</PopoverContent>
		</Popover>
	);
}
