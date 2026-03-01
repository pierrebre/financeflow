'use client';

import { useState } from 'react';
import * as z from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/src/components/ui/sheet';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Plus, ArrowLeft } from 'lucide-react';
import { TransactionSchema } from '@/src/schemas/';
import { TransactionForm } from './transaction/transaction-form';
import CoinSearch, { CoinHit } from '@/src/components/coin-search';
import { useTransactions } from './transaction/transaction-provider';
import { useQuery } from '@tanstack/react-query';
import { getCoinData } from '@/src/actions/external/crypto';
import { Skeleton } from '@/src/components/ui/skeleton';
import Image from 'next/image';

interface AddTransactionSheetProps {
	portfolioId: string;
}

export function AddTransactionSheet({ portfolioId }: AddTransactionSheetProps) {
	const [open, setOpen] = useState(false);
	const [step, setStep] = useState<1 | 2>(1);
	const [selectedCoin, setSelectedCoin] = useState<CoinHit | null>(null);
	const { addNewTransaction, isPending } = useTransactions();

	const { data: coinData, isLoading: isLoadingCoin } = useQuery({
		queryKey: ['coin', selectedCoin?.id],
		queryFn: () => getCoinData(selectedCoin!.id),
		enabled: !!selectedCoin?.id && step === 2,
		staleTime: 5 * 60 * 1000
	});

	const handleCoinSelect = (coin: CoinHit) => {
		setSelectedCoin(coin);
		setStep(2);
	};

	const handleBack = () => {
		setStep(1);
		setSelectedCoin(null);
	};

	const handleSubmit = async (values: z.infer<typeof TransactionSchema>) => {
		if (!selectedCoin) return;
		await addNewTransaction(values, portfolioId, selectedCoin.id);
		setOpen(false);
		setStep(1);
		setSelectedCoin(null);
	};

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
		if (!isOpen) {
			setStep(1);
			setSelectedCoin(null);
		}
	};

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetTrigger asChild>
				<Button size="sm" className="gap-2">
					<Plus size={15} />
					Add Transaction
				</Button>
			</SheetTrigger>
			<SheetContent className="w-full sm:max-w-lg overflow-y-auto">
				<SheetHeader className="mb-4">
					<div className="flex items-center gap-2">
						{step === 2 && (
							<Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleBack}>
								<ArrowLeft size={16} />
							</Button>
						)}
						<div>
							<SheetTitle className="text-left">Add Transaction</SheetTitle>
							<p className="text-xs text-muted-foreground mt-0.5">Step {step} of 2 — {step === 1 ? 'Select a coin' : 'Fill transaction details'}</p>
						</div>
					</div>
				</SheetHeader>

				{step === 1 && (
					<div className="space-y-3">
						<p className="text-sm text-muted-foreground">Search and select the cryptocurrency for this transaction.</p>
						<CoinSearch portfolioId={portfolioId} onSelect={handleCoinSelect} />
					</div>
				)}

				{step === 2 && selectedCoin && (
					<div className="space-y-4">
						{/* Selected coin preview */}
						<div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
							<Image src={selectedCoin.image} alt={selectedCoin.name} width={32} height={32} className="rounded-full" />
							<div className="flex-1">
								<p className="font-medium text-sm">{selectedCoin.name}</p>
								<Badge variant="outline" className="text-xs uppercase mt-0.5">{selectedCoin.symbol}</Badge>
							</div>
						</div>

						{isLoadingCoin ? (
							<div className="space-y-3">
								<Skeleton className="h-10 w-full" />
								<div className="flex gap-4">
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full" />
								</div>
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
							</div>
						) : (
							<TransactionForm
								onSubmit={handleSubmit}
								coin={coinData}
								isPending={isPending}
								error={null}
								isEditMode={false}
							/>
						)}
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
