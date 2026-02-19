import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Skeleton } from '@/src/components/ui/skeleton';

interface LoadingSkeletonProps {
	columnCount: number;
	rowCount?: number;
}

export function LoadingSkeleton({ columnCount, rowCount = 15 }: LoadingSkeletonProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					{Array.from({ length: columnCount }).map((_, index) => (
						<TableHead key={index}>
							<Skeleton className="h-4 w-full" />
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{Array.from({ length: rowCount }).map((_, rowIndex) => (
					<TableRow key={rowIndex}>
						{Array.from({ length: columnCount }).map((_, colIndex) => (
							<TableCell key={colIndex}>
								<Skeleton className="h-6 w-full" />
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
