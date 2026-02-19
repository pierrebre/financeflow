'use client';

import { useEffect, useMemo } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Transaction, TransactionSchema, TransactionType, Coin } from '@/src/schemas/';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form';
import * as z from 'zod';
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip';
import { Info, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/src/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { cn } from '@/src/lib/utils';
import Image from 'next/image';

interface TransactionFormProps {
	onSubmit: (values: z.infer<typeof TransactionSchema>) => void;
	transaction?: Transaction;
	coin?: Coin | null;
	isPending: boolean;
	error: string | null;
	isEditMode?: boolean;
}

export function TransactionForm({ onSubmit, transaction, coin, isPending, error, isEditMode = false }: TransactionFormProps) {
	const extendedSchema = TransactionSchema.extend({
		transactionDate: z.date().optional()
	});

	const form = useForm<z.infer<typeof extendedSchema>>({
		resolver: zodResolver(extendedSchema),
		defaultValues: {
			portfolioCoinId: transaction?.portfolioCoinId ?? '',
			quantityCrypto: transaction?.quantityCrypto ?? 0,
			amountUsd: transaction?.amountUsd ?? 0,
			type: transaction?.type ?? ('ACHAT' as TransactionType),
			pricePerCoin: transaction?.pricePerCoin ?? coin?.current_price ?? 0,
			fees: transaction?.fees ?? 0,
			note: transaction?.note ?? '',
			transactionDate: transaction?.date ?? new Date()
		}
	});

	const quantityValue = form.watch('quantityCrypto');
	const priceValue = form.watch('pricePerCoin');

	const calculatedTotal = useMemo(() => {
		return (quantityValue || 0) * (priceValue || 0);
	}, [quantityValue, priceValue]);

	useEffect(() => {
		if (calculatedTotal !== form.getValues('amountUsd')) {
			form.setValue('amountUsd', calculatedTotal);
		}
	}, [calculatedTotal, form]);

	const handleFormSubmit = (values: z.infer<typeof extendedSchema>) => {
		const { transactionDate, ...transactionValues } = values;
		onSubmit({
			...transactionValues,
			date: transactionDate ?? new Date()
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
				{coin && (
					<div className="flex items-center gap-3 p-3 mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
						{coin.image && <Image src={coin.image} alt={coin.name || 'Coin'} width={32} height={32} className="rounded-full" />}
						<div>
							<h3 className="font-medium">{coin.name}</h3>
							<p className="text-xs text-gray-500">{coin.symbol?.toUpperCase()}</p>
						</div>
						{coin.current_price && (
							<div className="ml-auto text-right">
								<span className="text-sm font-semibold">${coin.current_price.toLocaleString()}</span>
								<div className={cn('text-xs', coin.price_change_percentage_24h && coin.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500')}>{coin.price_change_percentage_24h?.toFixed(2)}%</div>
							</div>
						)}
					</div>
				)}

				<div className="space-y-4">
					<FormField
						control={form.control}
						name="type"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<RadioGroup defaultValue={field.value} onValueChange={field.onChange} value={field.value} className="flex gap-4 mb-4">
										<div className={cn('flex-1 flex items-center justify-center gap-2 p-3 rounded-md border cursor-pointer transition-colors', field.value === 'ACHAT' ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800')}>
											<FormItem>
												<FormControl>
													<RadioGroupItem value="ACHAT" className="sr-only" />
												</FormControl>
												<FormLabel className="cursor-pointer m-0 font-medium">Buy</FormLabel>
											</FormItem>
										</div>
										<div className={cn('flex-1 flex items-center justify-center gap-2 p-3 rounded-md border cursor-pointer transition-colors', field.value === 'VENTE' ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800')}>
											<FormItem>
												<FormControl>
													<RadioGroupItem value="VENTE" className="sr-only" />
												</FormControl>
												<FormLabel className="cursor-pointer m-0 font-medium">Sell</FormLabel>
											</FormItem>
										</div>
									</RadioGroup>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="hidden">
						<FormField
							control={form.control}
							name="portfolioCoinId"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input {...field} type="hidden" />
									</FormControl>
								</FormItem>
							)}
						/>
					</div>

					<div className="flex flex-col sm:flex-row gap-4">
						<FormField
							control={form.control}
							name="quantityCrypto"
							render={({ field: { onChange, ...fieldProps } }) => (
								<FormItem className="flex-1">
									<FormLabel htmlFor={fieldProps.name} className="flex gap-1 items-center">
										Quantity
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Info size={14} className="text-gray-400" />
												</TooltipTrigger>
												<TooltipContent side="top">
													<p className="max-w-xs text-sm">Amount of cryptocurrency</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</FormLabel>
									<FormControl>
										<Input {...fieldProps} type="number" step="any" placeholder="0.00" disabled={isPending} onChange={(e) => onChange(e.target.valueAsNumber || 0)} value={fieldProps.value === 0 ? '' : fieldProps.value} className="text-right" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="pricePerCoin"
							render={({ field: { onChange, ...fieldProps } }) => (
								<FormItem className="flex-1">
									<FormLabel htmlFor={fieldProps.name} className="flex gap-1 items-center">
										Price per coin
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Info size={14} className="text-gray-400" />
												</TooltipTrigger>
												<TooltipContent side="top">
													<p className="max-w-xs text-sm">Price in USD per unit</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</FormLabel>
									<FormControl>
										<div className="relative">
											<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
											<Input {...fieldProps} type="number" step="any" placeholder="0.00" onChange={(e) => onChange(e.target.valueAsNumber || 0)} value={fieldProps.value === 0 ? '' : fieldProps.value} className="pl-7 text-right" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="flex flex-col sm:flex-row gap-4">
						<FormField
							control={form.control}
							name="amountUsd"
							render={({ field: { onChange, ...fieldProps } }) => (
								<FormItem className="flex-1">
									<div className="flex items-center justify-between">
										<FormLabel htmlFor={fieldProps.name} className="flex gap-1 items-center">
											Total amount
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<Info size={14} className="text-gray-400" />
													</TooltipTrigger>
													<TooltipContent side="top">
														<p className="max-w-xs text-sm">Total cost or proceeds in USD</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</FormLabel>
										<span className="text-xs text-gray-500 flex items-center gap-1">
											<Calculator size={12} /> {calculatedTotal ? `$${calculatedTotal.toFixed(2)}` : '--'}
										</span>
									</div>
									<FormControl>
										<div className="relative">
											<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
											<Input {...fieldProps} type="number" step="any" placeholder="0.00" disabled={isPending} onChange={(e) => onChange(e.target.valueAsNumber || 0)} value={fieldProps.value === 0 ? '' : fieldProps.value} className="pl-7 text-right" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="fees"
							render={({ field: { onChange, ...fieldProps } }) => (
								<FormItem className="flex-1">
									<FormLabel htmlFor={fieldProps.name} className="flex gap-1 items-center">
										Fees (Optional)
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Info size={14} className="text-gray-400" />
												</TooltipTrigger>
												<TooltipContent side="top">
													<p className="max-w-xs text-sm">Any transaction fees paid</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</FormLabel>
									<FormControl>
										<div className="relative">
											<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
											<Input {...fieldProps} type="number" step="any" placeholder="0.00" disabled={isPending} onChange={(e) => onChange(e.target.valueAsNumber || 0)} value={fieldProps.value === 0 ? '' : fieldProps.value} className="pl-7 text-right" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="transactionDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Transaction Date</FormLabel>
									<FormControl>
										<Popover>
											<PopoverTrigger asChild>
												<Button variant="outline" className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
													{field.value ? format(field.value, 'PPP') : <span>Select date</span>}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0">
												<Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date('1900-01-01')} initialFocus />
											</PopoverContent>
										</Popover>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="note"
							render={({ field }) => (
								<FormItem>
									<FormLabel htmlFor={field.name}>Note (Optional)</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Ex: Buying the dip" disabled={isPending} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{error && <p className="text-sm text-red-500 p-2 bg-red-50 rounded-md">{error}</p>}

					<Button type="submit" disabled={isPending} className="w-full">
						{isPending ? (isEditMode ? 'Updating...' : 'Adding...') : isEditMode ? 'Update Transaction' : 'Add Transaction'}
					</Button>
				</div>
			</form>
		</Form>
	);
}
