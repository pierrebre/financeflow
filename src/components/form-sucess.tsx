import { BadgeCheck } from 'lucide-react';

interface FormSucessProps {
	message: string | undefined;
}

export const FormSucess = ({ message }: FormSucessProps) => {
	if (!message) return null;

	return (
		<div className="bg-emerald-500/15 p-3 rounded-md text-emerald-500 flex items-center gap-2 text-sm">
			<BadgeCheck className="h-4 w-4" />
			{message}
		</div>
	);
};
