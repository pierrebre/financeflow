import { ActionButton } from '../../action-button';
import { Plus, X } from 'lucide-react';

export const PortfolioTableActions = ({ row }: { row: any }) => {
	const handleAdd = () => {
		console.log('Add transaction for:', row.original.id);
	};

	const handleDelete = () => {
		console.log('Delete coin:', row.original.id);
	};

	return (
		<div className="flex items-center gap-1">
			<ActionButton icon={Plus} label="Add transaction" onClick={handleAdd} />
			<ActionButton icon={X} label="Delete coin" onClick={handleDelete} />
		</div>
	);
};
