import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ActionButtonProps {
	icon: React.ReactNode;
	label?: string;
	onClick?: () => void;
}

export const ActionButton = ({ icon, label, onClick }: ActionButtonProps) => {
	return (
		<TooltipProvider>
			<Tooltip delayDuration={300}>
				<TooltipTrigger asChild>
					<button onClick={onClick || undefined} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label={label}>
						{icon}
					</button>
				</TooltipTrigger>
				{label && (
					<TooltipContent className="bg-gray-800 text-white text-xs px-2 py-1 rounded" sideOffset={5}>
						{label}
					</TooltipContent>
				)}
			</Tooltip>
		</TooltipProvider>
	);
};
