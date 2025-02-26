import Link from 'next/link';
import { Star } from 'lucide-react';
import { flexRender } from '@tanstack/react-table';
import { PortfolioTableActions } from '../dashboard/portfolio/portoflio-table-actions';
import { TransactionProvider } from '../dashboard/portfolio/transaction/transaction-provider';

interface TableCellProps {
	cell: any;
	row: any;
	toggleFavorite: (id: string) => void;
	favorites: string[];
	portoflioId: string;
}

export function CustomTableCell({ cell, row, toggleFavorite, favorites, portoflioId }: TableCellProps) {
	if (cell.column.id === 'favorite') {
		return (
			<button onClick={() => toggleFavorite(row.original.id)} aria-label="Favorite" className="relative group">
				<Star className={`text-[#a6b1c2] h-5 w-5 ${favorites.includes(row.original.id) ? 'fill-[#f6b87e] text-[#f6b87e]' : ''}`} />
				<span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">Favorite</span>
			</button>
		);
	}

	if (cell.column.id === 'actions') {
		if (portoflioId) {
			return (
				<TransactionProvider portfolioId={portoflioId} coinId={row.original.id}>
					<PortfolioTableActions row={row} portfolioId={portoflioId} />
				</TransactionProvider>
			);
		}
	}

	return <Link href={`/coin/${row.original.id}`}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Link>;
}
