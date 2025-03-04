import { z } from 'zod';

export const TransactionTypeSchema = z.enum(['ACHAT', 'VENTE']);

export const TransactionSchema = z.object({
	portfolioCoinId: z.string(),
	quantityCrypto: z.number().positive('Quantity must be greater than zero'),
	amountUsd: z.number().min(0, 'Amount must be a positive number'),
	type: z.enum(['ACHAT', 'VENTE']),
	pricePerCoin: z.number().min(0, 'Price must be a positive number'),
	fees: z.number().min(0, 'Fees must be a positive number').optional(),
	note: z.string().optional(),
	date: z.date().optional()
});

export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export type Transaction = {
	id: string;
	portfolioCoinId: string;
	portfolioCoin?: any;
	quantityCrypto: number;
	amountUsd: number;
	type: TransactionType;
	pricePerCoin: number;
	fees?: number | null;
	note?: string | null;
	date?: Date;
	createdAt?: Date;
	updatedAt?: Date;
};
