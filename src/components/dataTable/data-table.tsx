'use client';

import { useMemo, useState } from 'react';
import { flexRender, useReactTable, SortingState, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import useFavoritesManager from '@/src/hooks/use-favorites';
import { DataTableProps } from '@/src/schemas/';
import { ErrorState } from './error-state';
import { CustomTableCell } from './table-cell';
import { LoadingSkeleton } from './loading-skeleton';
import { cn } from '@/src/lib/utils';

export function DataTable<TData, TValue>({ columns, data, isLoading = false, isError = false, isForPortfolio = false, portoflioId }: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const { favorites, toggleFavorite } = useFavoritesManager();
	const memoizedColumns = useMemo(() => columns, [columns]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		state: { sorting }
	});

	if (isLoading) {
		return (
			<div className="rounded-md border">
				<LoadingSkeleton columnCount={memoizedColumns.length} />
			</div>
		);
	}

	if (isError && data.length === 0) {
		return <ErrorState />;
	}

	return (
		<div className={cn(isForPortfolio ? 'border-t' : 'rounded-md border mb-8')}>
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
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										<CustomTableCell cell={cell} row={row} toggleFavorite={toggleFavorite} favorites={favorites} portoflioId={portoflioId ?? ''} />
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
