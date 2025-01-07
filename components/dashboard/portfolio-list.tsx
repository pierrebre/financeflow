'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PortfolioDialog } from './portfolio-dialog';
import { useOptimistic, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import PortfolioSelect from './portfolio-select';

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
	const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
	const [error, setError] = useState<string | null>(null);

	function handlePortfolioSelection(id: string) {
		const portfolio = optimisticPortfolios.find((p) => p.id === id);
		if (!portfolio) {
			setError('Portfolio not found');
			return;
		}
		setError(null);
		setSelectedPortfolio(portfolio);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Portfolio</CardTitle>
				<CardDescription>Manage your portfolios</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="mb-4">
					<PortfolioDialog userId={userId} onOptimisticAdd={addOptimisticPortfolio} />
				</div>
				<div className="flex space-x-4">
					<PortfolioSelect optimisticPortfolios={optimisticPortfolios} selectedPortfolio={selectedPortfolio} onSelect={handlePortfolioSelection} />
					<Button variant="outline" className="ml-auto" disabled={!selectedPortfolio}>
						<Plus />
					</Button>
				</div>
				{error && <p className="text-red-500">{error}</p>}
				{selectedPortfolio ? <p>Selected Portfolio: {selectedPortfolio.name}</p> : <p>No portfolio selected</p>}
			</CardContent>
		</Card>
	);
}
