import { AlertCircle } from 'lucide-react';

export function ErrorState() {
	return (
		<div className="rounded-md border p-4 text-center">
			<AlertCircle className="mx-auto h-10 w-10 text-red-500" />
			<h2 className="mt-2 text-lg font-semibold text-red-500">An error occurred</h2>
			<p className="mt-1 text-sm text-gray-600">We were unable to load the data. Please try again later.</p>
		</div>
	);
}
