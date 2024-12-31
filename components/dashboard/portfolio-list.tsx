'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PortfolioDialog } from './portfolio-dialog';
import { useOptimistic } from 'react';

interface Portfolio {
	id: string;
	name: string;
	description: string | null;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
}

interface PortfolioListProps {
	initialPortfolios: Portfolio[];
	userId: string;
}

export default function PortfolioList({ initialPortfolios, userId }: Readonly<PortfolioListProps>) {
	const [optimisticPortfolios, addOptimisticPortfolio] = useOptimistic<Portfolio[], Portfolio>(initialPortfolios, (state, newPortfolio) => [...state, newPortfolio]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Portfolio</CardTitle>
				<CardDescription>Manage your portfolios</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex space-x-4">
					{optimisticPortfolios.length > 0 ? (
						optimisticPortfolios.map((portfolio) => (
							<span key={portfolio.id} className="">
								{portfolio.name}
							</span>
						))
					) : (
						<div className="text-center py-4 text-muted-foreground">No portfolios yet</div>
					)}
				</div>
				<div className="mt-4">
					<PortfolioDialog userId={userId} onOptimisticAdd={addOptimisticPortfolio} />
				</div>
			</CardContent>
		</Card>
	);
}
