import { TriangleAlert } from 'lucide-react';

interface FormErrorProps {
	message: string | undefined;
}

export const FormError = ({ message }: FormErrorProps) => {
	if (!message) return null;

	return (
		<div className="bg-destructive/15 p-3 rounded-md text-destructive flex items-center gap-2 text-sm">
			<TriangleAlert className="h-4 w-4" />
			{message}
		</div>
	);
};
