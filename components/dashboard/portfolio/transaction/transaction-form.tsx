'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coin, Transaction, TransactionSchema, TransactionType } from '@/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import * as z from 'zod';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface TransactionFormProps {
	onSubmit: (values: z.infer<typeof TransactionSchema>) => void;
	transaction?: Transaction;
	coin: Coin | null;
	isPending: boolean;
	error: string | null;
	isEditMode: boolean;
}

export function TransactionForm({ onSubmit, transaction, coin, isPending, error, isEditMode }: TransactionFormProps) {
	const form = useForm<z.infer<typeof TransactionSchema>>({
		resolver: zodResolver(TransactionSchema),
		defaultValues: {
			portfolioCoinId: transaction?.portfolioCoinId || '',
			quantityCrypto: transaction?.quantityCrypto || 0,
			amountUsd: transaction?.amountUsd || 0,
			type: transaction?.type || ('ACHAT' as TransactionType),
			pricePerCoin: transaction?.pricePerCoin || 0,
			fees: transaction?.fees || 0,
			note: transaction?.note || ''
		}
	});

	// Mettre à jour les valeurs du formulaire quand la transaction ou la pièce change
	useEffect(() => {
		if (transaction) {
			form.reset({
				portfolioCoinId: transaction.portfolioCoinId,
				quantityCrypto: transaction.quantityCrypto,
				amountUsd: transaction.amountUsd,
				type: transaction.type,
				pricePerCoin: transaction.pricePerCoin,
				fees: transaction.fees || 0,
				note: transaction.note || ''
			});
		} else if (coin?.id) {
			form.setValue('portfolioCoinId', coin.id);
			if (coin.current_price && !isEditMode) {
				form.setValue('pricePerCoin', coin.current_price);
			}
		}
	}, [transaction, coin, form, isEditMode]);

	// Observer les changements de quantity et pricePerCoin pour calculer amountUsd
	useEffect(() => {
		const subscription = form.watch((value, { name }) => {
			if ((name === 'quantityCrypto' || name === 'pricePerCoin') && value.quantityCrypto && value.pricePerCoin) {
				const quantity = Number(value.quantityCrypto) || 0;
				const price = Number(value.pricePerCoin) || 0;
				const calculatedAmount = quantity * price;
				form.setValue('amountUsd', calculatedAmount);
			}
		});
		return () => subscription.unsubscribe();
	}, [form]);

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<div className="flex flex-col gap-4">
					<FormField
						control={form.control}
						name="portfolioCoinId"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor={field.name}>Coin</FormLabel>
								<FormControl>
									<Input {...field} placeholder="Coin" disabled value={coin?.name || 'Loading...'} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex justify-between gap-4">
						<FormField
							control={form.control}
							name="quantityCrypto"
							render={({ field: { onChange, ...fieldProps } }) => (
								<FormItem className="flex-1">
									<FormLabel htmlFor={fieldProps.name}>Quantity</FormLabel>
									<FormControl>
										<Input
											{...fieldProps}
											type="number"
											step="any"
											placeholder="0.00"
											disabled={isPending}
											onChange={(e) => {
												const value = e.target.valueAsNumber || 0;
												onChange(value);
											}}
											value={fieldProps.value === 0 ? '' : fieldProps.value}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="amountUsd"
							render={({ field: { onChange, ...fieldProps } }) => (
								<FormItem className="flex-1">
									<FormLabel htmlFor={fieldProps.name}>Amount USD</FormLabel>
									<FormControl>
										<Input {...fieldProps} type="number" step="any" placeholder="0.00" disabled={isPending} onChange={(e) => onChange(e.target.valueAsNumber || 0)} value={fieldProps.value === 0 ? '' : fieldProps.value} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<FormField
						control={form.control}
						name="type"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor={field.name}>Type</FormLabel>
								<FormControl>
									<RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-6">
										<FormItem className="flex items-center space-x-2 space-y-0">
											<FormControl>
												<RadioGroupItem value="ACHAT" />
											</FormControl>
											<FormLabel className="font-normal">Buy</FormLabel>
										</FormItem>
										<FormItem className="flex items-center space-x-2 space-y-0">
											<FormControl>
												<RadioGroupItem value="VENTE" />
											</FormControl>
											<FormLabel className="font-normal">Sell</FormLabel>
										</FormItem>
									</RadioGroup>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="pricePerCoin"
						render={({ field: { onChange, ...fieldProps } }) => (
							<FormItem>
								<FormLabel htmlFor={fieldProps.name}>Price Per Coin (USD)</FormLabel>
								<FormControl>
									<Input
										{...fieldProps}
										type="number"
										step="any"
										placeholder="0.00"
										onChange={(e) => {
											const newPrice = e.target.valueAsNumber || 0;
											onChange(newPrice);
										}}
										value={fieldProps.value || ''}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex justify-between gap-4">
						<FormField
							control={form.control}
							name="fees"
							render={({ field: { onChange, ...fieldProps } }) => (
								<FormItem className="flex-1">
									<FormLabel htmlFor={fieldProps.name}>Fees (Optional)</FormLabel>
									<FormControl>
										<Input {...fieldProps} type="number" step="any" placeholder="0.00" disabled={isPending} onChange={(e) => onChange(e.target.valueAsNumber || 0)} value={fieldProps.value === 0 ? '' : fieldProps.value} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="note"
							render={({ field }) => (
								<FormItem className="flex-1">
									<FormLabel htmlFor={field.name}>Note (Optional)</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Ex: Buying the dip" disabled={isPending} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					{error && <p className="text-sm text-red-500">{error}</p>}
					<Button type="submit" disabled={isPending} className="w-full">
						{isPending ? (isEditMode ? 'Updating...' : 'Adding...') : isEditMode ? 'Update Transaction' : 'Add Transaction'}
					</Button>
				</div>
			</form>
		</Form>
	);
}
