import Link from 'next/link';
import { Star } from 'lucide-react';
import { flexRender } from '@tanstack/react-table';

interface TableCellProps {
	cell: any;
	row: any;
	toggleFavorite: (id: string) => void;
	favorites: string[];
}

export function CustomTableCell({ cell, row, toggleFavorite, favorites }: TableCellProps) {
	if (cell.column.id === 'favorite') {
		return (
			<button onClick={() => toggleFavorite(row.original.id)} aria-label="Favorite">
				<Star className={`text-[#a6b1c2] h-5 w-5 ${favorites.includes(row.original.id) ? 'fill-[#f6b87e] text-[#f6b87e]' : ''}`} />
			</button>
		);
	}

	return <Link href={`/coin/${row.original.id}`}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Link>;
}
