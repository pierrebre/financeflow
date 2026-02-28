import { ColumnDef } from '@tanstack/react-table';

export interface TxPnL {
	pnl: number;
	pnlPct: number;
}

export interface DataTableProps<TData, TValue> {
	readonly columns: ColumnDef<TData, TValue>[];
	readonly data: TData[];
	readonly isLoading?: boolean;
	readonly isError?: boolean;
	readonly isForPortfolio?: boolean;
	readonly portfolioId?: string;
	readonly pnlByTx?: Record<string, TxPnL>;
}

// Augment TanStack Table meta to carry pnlByTx to column cells
declare module '@tanstack/react-table' {
	interface TableMeta<TData extends import('@tanstack/react-table').RowData> {
		pnlByTx?: Record<string, TxPnL>;
		_phantom?: TData;
	}
}
