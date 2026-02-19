'use client';

import { PortfolioAllocationChart } from '../statistic/portfolio-allocation-chart';
import { useTransactions } from './transaction-provider';
import { Skeleton } from '@/src/components/ui/skeleton';
import { NoTransactionsPlaceholder } from './no-transactions-placeholder';
import { DataTable } from '@/src/components/dataTable/data-table';
import { columnsTransaction } from '@/src/components/dataTable/columns-transaction';

interface TransactionTableProps {
	portfolioId: string;
	coinId?: string;
}

export default function TransactionTable({ portfolioId, coinId }: TransactionTableProps) {
	const { optimisticTransactions, isLoading, error } = useTransactions();

	const filteredTransactions = coinId ? optimisticTransactions.filter((tx) => tx.portfolioCoin?.coinId === coinId) : optimisticTransactions;

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-64 w-full" />
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-16 w-full" />
				))}
			</div>
		);
	}

	if (error) {
		return <div className="p-4 text-red-500 bg-red-50 rounded-md">Error loading transactions</div>;
	}

	return (
		<div className="space-y-4">
			{filteredTransactions.length > 0 ? (
				<>
					<PortfolioAllocationChart portfolioId={portfolioId} transactions={filteredTransactions} />
					<DataTable columns={columnsTransaction} data={filteredTransactions} isForPortfolio={true} portfolioId={portfolioId} />
				</>
			) : (
				<NoTransactionsPlaceholder portfolioId={portfolioId} coinId={coinId} />
			)}
		</div>
	);
}
