import Link from 'next/link';
import { Star } from 'lucide-react';
import { flexRender, type Cell, type Row } from '@tanstack/react-table';
import { PortfolioTableActions, type PortfolioTableActionsRowType } from '../dashboard/portfolio/portfolio-table-actions';
import { TransactionProvider } from '../dashboard/portfolio/transaction/transaction-provider';
import { TransactionTableActions } from '../dashboard/portfolio/transaction/transaction-table-actions';
import { Transaction } from '@/src/schemas/';

type RowData = Record<string, unknown>;

interface TableCellProps {
	cell: Cell<RowData, unknown>;
	row: Row<RowData>;
	toggleFavorite: (id: string) => void;
	favorites: string[];
	portfolioId: string;
}

export function CustomTableCell({ cell, row, toggleFavorite, favorites, portfolioId }: TableCellProps) {
	const rowId = row.original.id as string;

	if (cell.column.id === 'favorite') {
		return (
			<button onClick={() => toggleFavorite(rowId)} aria-label="Favorite" className="relative group">
				<Star className={`text-[#a6b1c2] h-5 w-5 ${favorites.includes(rowId) ? 'fill-[#f6b87e] text-[#f6b87e]' : ''}`} />
				<span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">Favorite</span>
			</button>
		);
	}

	if (cell.column.id === 'actions') {
		if (portfolioId) {
			return (
				<TransactionProvider portfolioId={portfolioId}>
					<PortfolioTableActions row={row as unknown as PortfolioTableActionsRowType} portfolioId={portfolioId} />
				</TransactionProvider>
			);
		}
	}

	if (cell.column.id === 'transaction-actions') {
		return (
			<TransactionProvider portfolioId={portfolioId}>
				<TransactionTableActions
					transaction={row.original as unknown as Transaction}
					portfolioId={portfolioId}
					coinId={row.original.coinId as string}
				/>
			</TransactionProvider>
		);
	}

	return <Link href={`/coin/${rowId}`}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Link>;
}
