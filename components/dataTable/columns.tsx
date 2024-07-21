'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CoinTable } from '@/types/Coin';
import { ArrowUpDown, MoreHorizontal, Star } from 'lucide-react';
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

			return value ? value < 0 ? <span className="text-[#ea3943]">{value.toFixed(2) + '%'}</span> : <span className="text-[#3aa655]">{value.toFixed(2) + '%'}</span> : '-';
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
