'use client';

import { useMemo, useState } from 'react';
import { useTransactions } from './transaction-provider';
import { Skeleton } from '@/src/components/ui/skeleton';
import { NoTransactionsPlaceholder } from './no-transactions-placeholder';
import { DataTable } from '@/src/components/dataTable/data-table';
import { columnsTransaction } from '@/src/components/dataTable/columns-transaction';
import { PortfolioAllocationChart } from '../statistic/portfolio-allocation-chart';
import { PortfolioKpiCards } from '../statistic/portfolio-kpi-cards';
import { PortfolioHistoryChart } from '../statistic/portfolio-history-chart';
import { computeRealizedPnL } from '@/src/lib/portfolio-calculations';
import { Transaction } from '@/src/schemas/';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Download, Search, X } from 'lucide-react';

type TypeFilter = 'ALL' | 'ACHAT' | 'VENTE';

interface TransactionTableProps {
	portfolioId: string;
	coinId?: string;
}

function exportToCsv(transactions: Transaction[], pnlMap: Record<string, { pnl: number; pnlPct: number }>) {
	const header = ['Date', 'Type', 'Coin', 'Quantity', 'Price', 'Amount (USD)', 'Fees', 'P&L', 'Note'];
	const rows = transactions.map((tx) => {
		const date = tx.date ? new Date(tx.date).toLocaleDateString('en-US') : '';
		const coin = tx.portfolioCoin?.coinId ?? tx.portfolioCoinId;
		const pnl = tx.type === 'VENTE' ? (pnlMap[tx.id]?.pnl ?? 0).toFixed(2) : '';
		const note = tx.note ?? '';
		return [date, tx.type, coin, tx.quantityCrypto, tx.pricePerCoin, tx.amountUsd, tx.fees ?? 0, pnl, note];
	});

	const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
	const blob = new Blob([csv], { type: 'text/csv' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
	a.click();
	URL.revokeObjectURL(url);
}

export default function TransactionTable({ portfolioId, coinId }: TransactionTableProps) {
	const { optimisticTransactions, isLoading, error } = useTransactions();
	const [search, setSearch] = useState('');
	const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
	const [dateFrom, setDateFrom] = useState('');
	const [dateTo, setDateTo] = useState('');

	// Base filter: restrict to coinId if provided (for CoinDetailPanel)
	const coinFiltered = coinId
		? optimisticTransactions.filter((tx) => tx.portfolioCoin?.coinId === coinId)
		: optimisticTransactions;

	// Compute realized P&L for sell rows (over the full portfolio, so FIFO is correct)
	const { byTx: pnlByTx } = useMemo(() => computeRealizedPnL(optimisticTransactions), [optimisticTransactions]);

	// Apply toolbar filters
	const filtered = useMemo(() => {
		return coinFiltered.filter((tx) => {
			if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
			if (search) {
				const q = search.toLowerCase();
				const note = (tx.note ?? '').toLowerCase();
				const coin = (tx.portfolioCoin?.coinId ?? tx.portfolioCoinId ?? '').toLowerCase();
				if (!note.includes(q) && !coin.includes(q)) return false;
			}
			if (dateFrom) {
				const txDate = tx.date ? new Date(tx.date) : tx.createdAt ? new Date(tx.createdAt) : null;
				if (!txDate || txDate < new Date(dateFrom)) return false;
			}
			if (dateTo) {
				const txDate = tx.date ? new Date(tx.date) : tx.createdAt ? new Date(tx.createdAt) : null;
				if (!txDate || txDate > new Date(dateTo + 'T23:59:59')) return false;
			}
			return true;
		});
	}, [coinFiltered, typeFilter, search, dateFrom, dateTo]);

	const hasFilters = search || typeFilter !== 'ALL' || dateFrom || dateTo;

	function clearFilters() {
		setSearch('');
		setTypeFilter('ALL');
		setDateFrom('');
		setDateTo('');
	}

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-12 w-full" />
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-16 w-full" />
				))}
			</div>
		);
	}

	if (error) {
		return <div className="p-4 text-red-500 bg-red-50 rounded-md">Error loading transactions</div>;
	}

	// When used inside CoinDetailPanel (coinId provided), show only the table + toolbar
	if (coinId) {
		if (coinFiltered.length === 0) {
			return <NoTransactionsPlaceholder portfolioId={portfolioId} coinId={coinId} />;
		}

		return (
			<div className="space-y-3">
				<Toolbar
					search={search}
					setSearch={setSearch}
					typeFilter={typeFilter}
					setTypeFilter={setTypeFilter}
					dateFrom={dateFrom}
					setDateFrom={setDateFrom}
					dateTo={dateTo}
					setDateTo={setDateTo}
					hasFilters={!!hasFilters}
					onClear={clearFilters}
					onExport={() => exportToCsv(filtered, pnlByTx)}
				/>
				<DataTable
					columns={columnsTransaction}
					data={filtered}
					isForPortfolio={true}
					portfolioId={portfolioId}
					pnlByTx={pnlByTx}
				/>
			</div>
		);
	}

	// Full portfolio view (inside PortfolioOverview → only transactions)
	if (coinFiltered.length === 0) {
		return <NoTransactionsPlaceholder portfolioId={portfolioId} />;
	}

	return (
		<div className="space-y-4">
			<PortfolioKpiCards />
			<PortfolioHistoryChart />
			<PortfolioAllocationChart portfolioId={portfolioId} transactions={coinFiltered} />

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Transactions</h3>
				</div>
				<Toolbar
					search={search}
					setSearch={setSearch}
					typeFilter={typeFilter}
					setTypeFilter={setTypeFilter}
					dateFrom={dateFrom}
					setDateFrom={setDateFrom}
					dateTo={dateTo}
					setDateTo={setDateTo}
					hasFilters={!!hasFilters}
					onClear={clearFilters}
					onExport={() => exportToCsv(filtered, pnlByTx)}
				/>
				<DataTable
					columns={columnsTransaction}
					data={filtered}
					isForPortfolio={true}
					portfolioId={portfolioId}
					pnlByTx={pnlByTx}
				/>
			</div>
		</div>
	);
}

interface ToolbarProps {
	search: string;
	setSearch: (v: string) => void;
	typeFilter: TypeFilter;
	setTypeFilter: (v: TypeFilter) => void;
	dateFrom: string;
	setDateFrom: (v: string) => void;
	dateTo: string;
	setDateTo: (v: string) => void;
	hasFilters: boolean;
	onClear: () => void;
	onExport: () => void;
}

function Toolbar({ search, setSearch, typeFilter, setTypeFilter, dateFrom, setDateFrom, dateTo, setDateTo, hasFilters, onClear, onExport }: ToolbarProps) {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<div className="relative flex-1 min-w-[140px]">
				<Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search note or coin…"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-8 h-8 text-sm"
				/>
			</div>

			<Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
				<SelectTrigger className="w-[110px] h-8 text-sm">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="ALL">All types</SelectItem>
					<SelectItem value="ACHAT">Buy</SelectItem>
					<SelectItem value="VENTE">Sell</SelectItem>
				</SelectContent>
			</Select>

			<Input
				type="date"
				value={dateFrom}
				onChange={(e) => setDateFrom(e.target.value)}
				className="w-[130px] h-8 text-sm"
				title="From date"
			/>
			<Input
				type="date"
				value={dateTo}
				onChange={(e) => setDateTo(e.target.value)}
				className="w-[130px] h-8 text-sm"
				title="To date"
			/>

			{hasFilters && (
				<Button variant="ghost" size="sm" onClick={onClear} className="h-8 gap-1 text-muted-foreground">
					<X size={13} /> Clear
				</Button>
			)}

			<Button variant="outline" size="sm" onClick={onExport} className="h-8 gap-1.5 ml-auto">
				<Download size={13} /> Export CSV
			</Button>
		</div>
	);
}
