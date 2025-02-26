'use client';

import { Transaction } from '@/schemas';
import { ActionButton } from '@/components/action-button';
import { Pencil, Trash, Info } from 'lucide-react';
import { TransactionDialog } from './transaction-dialog';
import { formatTransactionForDisplay } from '@/lib/utils';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

interface TransactionItemProps {
	transaction: Transaction;
	coinId: string;
	portfolioId: string;
	onDelete: (transaction: Transaction) => void;
}

export function TransactionItem({ transaction, coinId, portfolioId, onDelete }: TransactionItemProps) {
	const [isHovered, setIsHovered] = useState(false);
	const displayTransaction = formatTransactionForDisplay(transaction);

	const isTemporary = transaction.id.startsWith('temp-');

	return (
		<motion.div
			className={`flex items-center justify-between p-3 border-b hover:bg-gray-50 transition-colors duration-150 ${isTemporary ? 'opacity-70' : ''}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			initial={isTemporary ? { backgroundColor: '#f0f9ff' } : {}}
			animate={isTemporary ? { backgroundColor: '#ffffff' } : {}}
			transition={{ duration: 1.5 }}
		>
			<div className="grid grid-cols-6 gap-2 flex-1">
				<div className={`font-medium text-sm ${transaction.type === 'ACHAT' ? 'text-green-600' : 'text-red-600'}`}>{transaction.type === 'ACHAT' ? 'Achat' : 'Vente'}</div>
				<div className="text-sm">{displayTransaction.formattedQuantity}</div>
				<div className="text-sm">{displayTransaction.formattedAmount}</div>
				<div className="text-sm">{displayTransaction.formattedPrice}</div>
				<div className="text-sm text-gray-500">{displayTransaction.formattedFees}</div>
				<div className="text-sm text-gray-500">{displayTransaction.formattedDate}</div>
			</div>

			<div className="flex items-center">
				{transaction.note && (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Info size={16} className="mr-2 text-gray-400" />
							</TooltipTrigger>
							<TooltipContent side="top">
								<p className="max-w-xs text-sm">{transaction.note}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}

				<div className={`flex gap-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
					<TransactionDialog
						portfolioId={portfolioId}
						coinId={coinId}
						transaction={{
							...transaction,
							portfolioCoin: transaction.portfolioCoin || { coinId, id: transaction.portfolioCoinId, portfolioId }
						}}
						triggerIcon={<Pencil size={16} />}
						triggerLabel="Modifier la transaction"
					/>
					<ActionButton icon={Trash} label="Supprimer la transaction" onClick={() => onDelete(transaction)} />
				</div>
			</div>
		</motion.div>
	);
}
