import { ColumnDef } from '@tanstack/react-table';

export interface DataTableProps<TData, TValue> {
	readonly columns: ColumnDef<TData, TValue>[];
	readonly data: TData[];
	readonly isLoading?: boolean;
	readonly isError?: boolean;
	readonly isForPortfolio?: boolean;
	readonly portfolioId?: string;
}
