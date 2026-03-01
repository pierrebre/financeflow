import React, { useState } from 'react';
import { InstantSearch, SearchBox, Hits, Configure } from 'react-instantsearch';
import { searchClient } from '@/src/lib/algolia/client';
import Link from 'next/link';
import { Plus, Check } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';
import { useToast } from '@/src/hooks/use-toast';
import { usePortfolioCoins } from './dashboard/portfolio/asset/portfolio-coin-provider';

export interface CoinHit {
	name: string;
	symbol: string;
	id: string;
	image: string;
}

interface CoinSearchProps {
	readonly portfolioId: string;
	readonly onSelect?: (coin: CoinHit) => void;
}

export default function CoinSearch({ portfolioId, onSelect }: CoinSearchProps) {
	const { addCoin, optimisticPortfolioCoins } = usePortfolioCoins();
	const { toast } = useToast();
	const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});

	const handleAddCoin = async (hit: CoinHit) => {
		const coinExists = optimisticPortfolioCoins.some((coin) => coin.coinId === hit.id);

		if (coinExists) {
			toast({
				title: 'Coin already exists',
				description: `${hit.name} is already in your portfolio`,
				variant: 'destructive'
			});
			return;
		}

		setIsAdding((prev) => ({ ...prev, [hit.id]: true }));

		try {
			await addCoin(hit.id, portfolioId);
		} catch (error) {
			console.error('Error adding coin:', error);
		} finally {
			setIsAdding((prev) => ({ ...prev, [hit.id]: false }));
		}
	};

	const HitComponent = ({ hit }: { hit: CoinHit }) => {
		const isInPortfolio = optimisticPortfolioCoins.some((coin) => coin.coinId === hit.id);

		if (onSelect) {
			return (
				<div
					className="p-3 hover:bg-muted/50 flex justify-between items-center cursor-pointer rounded-md transition-colors"
					onClick={() => onSelect(hit)}
				>
					<div className="flex items-center gap-3">
						<Image src={hit.image} alt={hit.name} width={28} height={28} className="rounded-full" />
						<div>
							<p className="font-medium text-sm">{hit.name}</p>
							<p className="text-xs text-muted-foreground uppercase">{hit.symbol}</p>
						</div>
					</div>
					{isInPortfolio && (
						<span className="text-xs text-emerald-500 flex items-center gap-1">
							<Check size={12} /> In portfolio
						</span>
					)}
				</div>
			);
		}

		return (
			<div className="p-4 hover:bg-gray-50 flex justify-between items-center">
				<Link href={`/coin/${hit.id}`} className="flex items-center gap-4">
					<Image src={hit.image} alt={hit.name} width={30} height={30} />
					<div className="ml-2">
						<p className="font-bold text-gray-900">{hit.name}</p>
						<p className="text-sm text-gray-600 uppercase">{hit.symbol}</p>
					</div>
				</Link>
				<Button variant="ghost" size="sm" className="gap-1" disabled={isInPortfolio || isAdding[hit.id]} onClick={() => handleAddCoin(hit)}>
					{isInPortfolio ? (
						'Added'
					) : (
						<>
							<Plus size={16} />
							{isAdding[hit.id] ? 'Adding...' : 'Add'}
						</>
					)}
				</Button>
			</div>
		);
	};

	return (
		<div className="w-full max-w-2xl mx-auto bg-white shadow-sm border rounded-lg p-4">
			<InstantSearch indexName="coins" searchClient={searchClient}>
				<SearchBox
					placeholder="Search for a coin"
					classNames={{
						root: 'relative w-full',
						input: 'w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
						submit: 'hidden',
						reset: 'hidden'
					}}
				/>
				<Configure hitsPerPage={5} />
				<Hits hitComponent={HitComponent} />
			</InstantSearch>
		</div>
	);
}
