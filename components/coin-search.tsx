import React from 'react';
import { InstantSearch, SearchBox, Hits, Configure } from 'react-instantsearch';
import { searchClient } from '@/lib/algolia/client';

interface Hit {
	name: string;
	symbol: string;
	id: string;
}

const HitComponent = ({ hit }: { hit: Hit }) => (
	<div className="p-4 hover:bg-gray-50">
		<p className="font-bold text-gray-900">{hit.name}</p>
		<p className="text-sm text-gray-600 uppercase">{hit.symbol}</p>
	</div>
);

export default function CoinSearch() {
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
