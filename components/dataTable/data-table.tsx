'use client';
import { useMemo, useState } from 'react';
import { ColumnDef, flexRender, useReactTable, SortingState, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Star } from 'lucide-react';
import useFavoritesManager from '@/lib/hooks/use-favorites';

interface DataTableProps<TData, TValue> {
	readonly columns: ColumnDef<TData, TValue>[];
	readonly data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const { favorites, toggleFavorite } = useFavoritesManager();

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		state: { sorting }
	});

	const memoizedColumns = useMemo(() => columns, [columns]);

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel()?.rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
								{row.getVisibleCells().map((cell: any) => (
									<TableCell key={cell.id}>
										{cell.column.id === 'favorite' ? (
											<button onClick={() => toggleFavorite((row.original as any).id)} aria-label="Favorite">
												<Star className={`text-[#a6b1c2] h-5 w-5 ${favorites.includes((row.original as any).id as string) ? 'fill-[#f6b87e] text-[#f6b87e]' : ''}`} />
											</button>
										) : (
											<Link href={`/coin/${(row.original as any).id as string}`} key={row.id}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</Link>
										)}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={memoizedColumns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
