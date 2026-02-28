'use client';

import { PortfolioKpiCards } from './statistic/portfolio-kpi-cards';
import { PortfolioHistoryChart } from './statistic/portfolio-history-chart';
import { PortfolioAllocationChart } from './statistic/portfolio-allocation-chart';
import { AssetSummaryTable } from './asset/asset-summary-table';
import { useTransactions } from './transaction/transaction-provider';
import AssetDialog from './asset/asset-dialog';

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
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Holdings</h3>
					<AssetDialog portfolioId={portfolioId} />
				</div>
				<AssetSummaryTable portfolioId={portfolioId} />
			</div>
		</div>
	);
}
