import React from 'react';
import { InstantSearch, SearchBox, Hits, Configure } from 'react-instantsearch';
import { searchClient } from '@/lib/algolia/client';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { addCoinToPortfolio } from '@/actions/portfolio';
import Image from 'next/image';

interface Hit {
	name: string;
	symbol: string;
	id: string;
	image: string;
}

export default function CoinSearch({ portfolioId }: { readonly portfolioId: string | undefined }) {
	const addCoin = async (hit: Hit, portfolioId: string) => {
		await addCoinToPortfolio(portfolioId, hit.id).then(() => console.log('coin added'));
	};

	const HitComponent = ({ hit }: { hit: Hit }) => (
		<div className="p-4 hover:bg-gray-50 flex justify-between">
			<Link href={`/coin/${hit.id}`} className='flex items-center gap-4'>
				<Image src={hit.image} alt={hit.name} width={30} height={30} />
				<div className="ml-2">
					<p className="font-bold text-gray-900">{hit.name}</p>
					<p className="text-sm text-gray-600 uppercase">{hit.symbol}</p>
				</div>
			</Link>
			<Button variant="ghost" className="gap-1 p-0" onClick={() => addCoin(hit, portfolioId ?? '')}>
				<Plus size={16} />
			</Button>
		</div>
	);

	return (
		<div className="w-full max-w-2xl mx-auto bg-white shadow-sm border rounded-lg p-4">
			<InstantSearch indexName="coins" searchClient={searchClient}>
				<SearchBox
					placeholder="Rechercher une crypto..."
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
