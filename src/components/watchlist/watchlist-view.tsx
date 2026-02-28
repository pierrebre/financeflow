'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
	flexRender,
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	SortingState,
	ColumnFiltersState,
	VisibilityState,
	ColumnDef
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Star, Download, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent } from '@/src/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/src/components/ui/dropdown-menu';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Coin } from '@/src/schemas/';

interface WatchlistViewProps {
	coins: Coin[];
	favorites: string[];
	toggleFavorite: (coinId: string) => void;
	isLoading: boolean;
	isError: boolean;
}

function PctBadge({ value }: { value: number | null | undefined }) {
	if (value == null) return <span className="text-muted-foreground">-</span>;
	const positive = value >= 0;
	return (
		<span className={`inline-flex items-center gap-0.5 font-medium tabular-nums ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
			{positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
			{Math.abs(value).toFixed(2)}%
		</span>
	);
}

function formatLargeNumber(n: number | null | undefined): string {
	if (n == null) return '-';
	if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
	if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
	if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
	return `$${n.toFixed(2)}`;
}

function WatchlistStats({ coins }: { coins: Coin[] }) {
	const stats = useMemo(() => {
		if (!coins.length) return null;
		const sorted24h = [...coins].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0));
		const best = sorted24h[0];
		const worst = sorted24h[sorted24h.length - 1];
		return { total: coins.length, best, worst };
	}, [coins]);

	if (!stats) return null;

	return (
		<div className="grid grid-cols-3 gap-4 mb-6">
			<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
				<Card>
					<CardContent className="pt-4 pb-3 px-4">
						<p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Tracked Assets</p>
						<p className="text-2xl font-bold text-primary">{stats.total}</p>
					</CardContent>
				</Card>
			</motion.div>
			<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
				<Card>
					<CardContent className="pt-4 pb-3 px-4">
						<p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Best 24h</p>
						<p className="text-lg font-bold text-emerald-500 truncate">{stats.best.name}</p>
						<PctBadge value={stats.best.price_change_percentage_24h} />
					</CardContent>
				</Card>
			</motion.div>
			<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
				<Card>
					<CardContent className="pt-4 pb-3 px-4">
						<p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Worst 24h</p>
						<p className="text-lg font-bold text-red-500 truncate">{stats.worst.name}</p>
						<PctBadge value={stats.worst.price_change_percentage_24h} />
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}

export function WatchlistView({ coins, favorites, toggleFavorite, isLoading, isError }: WatchlistViewProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [globalFilter, setGlobalFilter] = useState('');

	const exportCsv = useCallback(() => {
		const headers = ['Rank', 'Name', 'Symbol', 'Price (USD)', '1h %', '24h %', '7d %', 'Market Cap', 'Volume 24h'];
		const rows = coins.map((c) => [
			c.market_cap_rank,
			c.name,
			c.symbol.toUpperCase(),
			c.current_price,
			(c.price_change_percentage_1h_in_currency ?? 0).toFixed(2),
			(c.price_change_percentage_24h ?? 0).toFixed(2),
			(c.price_change_percentage_7d ?? 0).toFixed(2),
			c.market_cap,
			c.total_volume
		]);
		const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `watchlist-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}, [coins]);

	const columns: ColumnDef<Coin>[] = useMemo(
		() => [
			{
				id: 'favorite',
				header: '',
				size: 40,
				cell: ({ row }) => {
					const isFav = favorites.includes(row.original.id);
					return (
						<button onClick={() => toggleFavorite(row.original.id)} className="p-1 hover:scale-110 transition-transform">
							<Star size={16} className={isFav ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'} />
						</button>
					);
				}
			},
			{
				accessorKey: 'market_cap_rank',
				header: ({ column }) => (
					<Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
						# <ArrowUpDown size={12} className="ml-1" />
					</Button>
				),
				size: 60
			},
			{
				accessorKey: 'name',
				header: 'Name',
				cell: ({ row }) => (
					<Link href={`/coin/${row.original.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
						<Image src={row.original.image} alt={row.original.name} width={24} height={24} className="rounded-full" />
						<span className="font-medium">{row.original.name}</span>
						<span className="text-muted-foreground text-xs">{row.original.symbol.toUpperCase()}</span>
					</Link>
				),
				filterFn: (row, _id, value: string) => row.original.name.toLowerCase().includes(value.toLowerCase()) || row.original.symbol.toLowerCase().includes(value.toLowerCase())
			},
			{
				accessorKey: 'current_price',
				header: ({ column }) => (
					<Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
						Price <ArrowUpDown size={12} className="ml-1" />
					</Button>
				),
				cell: ({ getValue }) => {
					const v = getValue() as number;
					return <span className="tabular-nums font-medium">${v?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }) ?? '-'}</span>;
				}
			},
			{
				accessorKey: 'price_change_percentage_1h_in_currency',
				header: ({ column }) => (
					<Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
						1h <ArrowUpDown size={12} className="ml-1" />
					</Button>
				),
				cell: ({ getValue }) => <PctBadge value={getValue() as number} />
			},
			{
				accessorKey: 'price_change_percentage_24h',
				header: ({ column }) => (
					<Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
						24h <ArrowUpDown size={12} className="ml-1" />
					</Button>
				),
				cell: ({ getValue }) => <PctBadge value={getValue() as number} />
			},
			{
				accessorKey: 'price_change_percentage_7d',
				header: ({ column }) => (
					<Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
						7d <ArrowUpDown size={12} className="ml-1" />
					</Button>
				),
				cell: ({ getValue }) => <PctBadge value={getValue() as number} />
			},
			{
				accessorKey: 'market_cap',
				header: ({ column }) => (
					<Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
						Market Cap <ArrowUpDown size={12} className="ml-1" />
					</Button>
				),
				cell: ({ getValue }) => <span className="tabular-nums">{formatLargeNumber(getValue() as number)}</span>
			},
			{
				accessorKey: 'total_volume',
				header: ({ column }) => (
					<Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
						Volume 24h <ArrowUpDown size={12} className="ml-1" />
					</Button>
				),
				cell: ({ getValue }) => <span className="tabular-nums text-muted-foreground">{formatLargeNumber(getValue() as number)}</span>
			}
		],
		[favorites, toggleFavorite]
	);

	const table = useReactTable({
		data: coins,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: (row, _id, value: string) => row.original.name.toLowerCase().includes(value.toLowerCase()) || row.original.symbol.toLowerCase().includes(value.toLowerCase()),
		state: { sorting, columnFilters, columnVisibility, globalFilter }
	});

	if (isLoading) {
		return (
			<div className="space-y-3">
				<div className="grid grid-cols-3 gap-4 mb-6">
					{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
				</div>
				{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
			</div>
		);
	}

	if (isError) {
		return <div className="p-6 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">Failed to load watchlist data.</div>;
	}

	if (favorites.length === 0) {
		return (
			<div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
				<Star size={36} className="mx-auto text-muted-foreground mb-3" />
				<h3 className="font-semibold text-lg mb-1">Your watchlist is empty</h3>
				<p className="text-muted-foreground text-sm">Star any cryptocurrency on the home page to track it here.</p>
			</div>
		);
	}

	const visibleColumnNames: Record<string, string> = {
		price_change_percentage_1h_in_currency: '1h %',
		price_change_percentage_24h: '24h %',
		price_change_percentage_7d: '7d %',
		market_cap: 'Market Cap',
		total_volume: 'Volume 24h'
	};

	return (
		<div>
			<WatchlistStats coins={coins} />

			{/* Toolbar */}
			<div className="flex flex-col sm:flex-row gap-3 mb-4">
				<div className="relative flex-1">
					<Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search coins..."
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="pl-9"
					/>
				</div>
				<div className="flex gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="gap-2">
								<SlidersHorizontal size={14} /> Columns
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-44">
							<DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{table.getAllColumns().filter((col) => col.id in visibleColumnNames).map((col) => (
								<DropdownMenuCheckboxItem key={col.id} checked={col.getIsVisible()} onCheckedChange={(val) => col.toggleVisibility(val)}>
									{visibleColumnNames[col.id]}
								</DropdownMenuCheckboxItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					<Button variant="outline" size="sm" className="gap-2" onClick={exportCsv}>
						<Download size={14} /> Export CSV
					</Button>
				</div>
			</div>

			{/* Table */}
			<div className="rounded-md border overflow-hidden">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((hg) => (
							<TableRow key={hg.id}>
								{hg.headers.map((h) => (
									<TableHead key={h.id} style={{ width: h.column.getSize() }}>
										{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						<AnimatePresence>
							{table.getRowModel().rows.length ? (
								table.getRowModel().rows.map((row, i) => (
									<motion.tr
										key={row.id}
										initial={{ opacity: 0, x: -8 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: i * 0.03 }}
										className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}
									</motion.tr>
								))
							) : (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
										No coins match your search.
									</TableCell>
								</TableRow>
							)}
						</AnimatePresence>
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
