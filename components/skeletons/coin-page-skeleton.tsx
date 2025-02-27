import { Skeleton } from '../ui/skeleton';

export const CoinPageSkeleton = () => (
	<div className="space-y-6">
		<div className="flex items-center gap-4">
			<Skeleton className="h-12 w-12 rounded-full" />
			<div>
				<Skeleton className="h-8 w-48 mb-2" />
				<Skeleton className="h-4 w-24" />
			</div>
		</div>

		<div className="flex flex-col lg:flex-row gap-6">
			<div className="w-full lg:w-1/4">
				<Skeleton className="h-[300px] w-full rounded-lg" />
			</div>
			<div className="w-full lg:w-3/4">
				<Skeleton className="h-[400px] w-full rounded-lg" />
			</div>
		</div>
	</div>
);
