'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CoinTable } from '@/lib/types/Coin';
import { Button } from '@/components/ui/button';

export const columns: ColumnDef<CoinTable>[] = [
	{
		accessorKey: 'favorite',
		header: ''
	},
	{
		accessorKey: 'market_cap_rank',
		header: ({ column }) => {
			return (
				<Button variant="ghost" className="gap-1 p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					#
				</Button>
			);
		}
	},
	{
		accessorKey: 'name',
		header: 'Name',
		cell: ({ getValue }) => {
			const value = getValue() as string;
			return value;
		}
	},
	{
		accessorKey: 'symbol',
		header: 'Symbol',
		cell: ({ getValue }) => {
			const value = getValue() as string;
			return value.toUpperCase();
		}
	},
	{
		accessorKey: 'current_price',
		header: ({ column }) => {
			return (
				<Button variant="ghost" className="gap-1 p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					Price
				</Button>
			);
		},
		cell: ({ getValue }) => {
			const value = getValue() as number | null;
			return value ? value.toFixed(2) + '$' : '-';
		}
	},
	{
		accessorKey: 'market_cap',
		header: ({ column }) => {
			return (
				<Button variant="ghost" className="gap-1 p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					Market Cap
				</Button>
			);
		},
		cell: ({ getValue }) => {
			const value = getValue() as number | null;
			return value ? value.toFixed(0) + ' $' : '-';
		}
	},
	{
		accessorKey: 'market_cap_change_percentage_24h',
		header: ({ column }) => {
			return (
				<Button variant="ghost" className="gap-1 p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					24h Change
				</Button>
			);
		},
		cell: ({ getValue }) => {
			const value = getValue() as number | null;

			if (value === null) {
				return '-';
			}

			const formattedValue = value.toFixed(2) + '%';
			return value < 0 ? <span className="text-[#db121c]">{formattedValue}</span> : <span className="text-[#1d5a2e]">{formattedValue}</span>;
		}
	},
	{
		accessorKey: 'circulating_supply',
		header: ({ column }) => {
			return (
				<Button variant="ghost" className="gap-1 p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					Circulating Supply
				</Button>
			);
		},
		cell: ({ getValue, row }) => {
			const symbol = row.original.symbol;
			const value = getValue() as number | null;
			return value ? value.toFixed(0) + ' ' + symbol.toUpperCase() : '-';
		}
	}
];
