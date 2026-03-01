'use client';

import { PortfolioKpiCards } from './statistic/portfolio-kpi-cards';
import { PortfolioHistoryChart } from './statistic/portfolio-history-chart';
import { PortfolioAllocationChart } from './statistic/portfolio-allocation-chart';
import { AssetSummaryTable } from './asset/asset-summary-table';
import { useTransactions } from './transaction/transaction-provider';

interface PortfolioOverviewProps {
	portfolioId: string;
}

export function PortfolioOverview({ portfolioId }: PortfolioOverviewProps) {
	const { optimisticTransactions } = useTransactions();

	return (
		<div className="space-y-6">
			{/* KPI Cards */}
			<PortfolioKpiCards />

			{/* Charts row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<PortfolioHistoryChart />
				<PortfolioAllocationChart portfolioId={portfolioId} transactions={optimisticTransactions} />
			</div>

			{/* Asset table with coin-level drill-down */}
			<div>
				<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Holdings</h3>
				<AssetSummaryTable portfolioId={portfolioId} />
			</div>
		</div>
	);
}
