'use client';

import { ColumnDef, flexRender, getCoreRowModel, useReactTable, SortingState, getSortedRowModel } from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { set } from 'date-fns';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting
		}
	});

	const handleFavorite = (coinId: string) => {
		console.log(coinId);
	};

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>;
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{cell.column.columnDef.accessorKey === 'favorite' ? (
											<button onClick={() => handleFavorite(row.original.id)}>
												<Star className="text-gray-400 h-5 w-5" />
											</button>
										) : (
											<Link className="" href={`/coin/${row.original.id}`} key={row.id}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</Link>
										)}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
