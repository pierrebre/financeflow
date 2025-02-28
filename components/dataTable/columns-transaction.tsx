'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CoinTable, Transaction } from '@/schemas';
import { formatTransactionForDisplay } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Info } from 'lucide-react';

export const columnsTransaction: ColumnDef<Transaction>[] = [
	{
		accessorKey: 'type',
		header: 'Type',
		cell: ({ row }) => <div className={`font-medium ${row.original.type === 'ACHAT' ? 'text-green-600' : 'text-red-600'}`}>{row.original.type === 'ACHAT' ? 'Achat' : 'Vente'}</div>
	},
	{
		accessorKey: 'quantity',
		header: 'Quantity',
		cell: ({ row }) => {
			const { formattedQuantity } = formatTransactionForDisplay(row.original);
			return <div>{formattedQuantity}</div>;
		}
	},
	{
		accessorKey: 'amount',
		header: 'Amount',
		cell: ({ row }) => {
			const { formattedAmount } = formatTransactionForDisplay(row.original);
			return <div>{formattedAmount}</div>;
		}
	},
	{
		accessorKey: 'price',
		header: 'Price',
		cell: ({ row }) => {
			const { formattedPrice } = formatTransactionForDisplay(row.original);
			return <div>{formattedPrice}</div>;
		}
	},
	{
		accessorKey: 'fees',
		header: 'Fees',
		cell: ({ row }) => {
			const { formattedFees } = formatTransactionForDisplay(row.original);
			return <div className="text-gray-500">{formattedFees}</div>;
		}
	},
	{
		accessorKey: 'date',
		header: 'Date',
		cell: ({ row }) => {
			const { formattedDate } = formatTransactionForDisplay(row.original);
			return <div className="text-gray-500">{formattedDate}</div>;
		}
	},
	{
		accessorKey: 'transaction-actions',
		header: 'Actions'
	},
	{
		accessorKey: 'note',
		header: 'Note',
		cell: ({ row }) => {
			if (!row.original.note) {
				return null;
			}

			return (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Info size={16} className="mr-2 text-gray-400" />
						</TooltipTrigger>
						<TooltipContent side="top">
							<p className="max-w-xs text-sm">{row.original.note}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
		}
	}
];
