import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ActionButtonProps {
	icon: LucideIcon;
	label: string;
	onClick?: () => void;
}

export const ActionButton = ({ icon: Icon, label, onClick }: ActionButtonProps) => {
	return (
		<TooltipProvider>
			<Tooltip delayDuration={300}>
				<TooltipTrigger asChild>
					<button onClick={onClick} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label={label}>
						<Icon className="h-4 w-4 text-gray-600" />
					</button>
				</TooltipTrigger>
				<TooltipContent className="bg-gray-800 text-white text-xs px-2 py-1 rounded" sideOffset={5}>
					{label}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
