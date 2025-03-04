import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, subDays, subWeeks, subMonths, subYears } from 'date-fns';
import { ChartInterval, Coin, Transaction } from '@/schemas';
import { auth } from '@/auth';

export const getDateRangeMessage = (unity: ChartInterval): string => {
	const today = new Date();

	const startDate = (() => {
		switch (unity) {
			case '1':
				return subDays(today, 1);
			case '7':
				return subWeeks(today, 1);
			case '30':
				return subMonths(today, 1);
			case '365':
				return subYears(today, 1);
			default:
				return today;
		}
	})();

	const formattedStartDate = format(startDate, 'dd/MM/yyyy');
	const formattedEndDate = format(today, 'dd/MM/yyyy');

	return `${formattedStartDate} - ${formattedEndDate}`;
};

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const currentUser = async () => {
	const session = await auth();
	if (!session) return null;

	return session?.user;
};

export const currentRole = async () => {
	const session = await auth();
	return session?.user?.role;
};

export const uploadImage = async (file: File) => {
	const response = await fetch(`/api/avatar/upload?filename=${file.name}`, {
		method: 'POST',
		body: file
	});
	const blob = await response.json();
	return blob.url;
};

export const getPeriod = (unity: ChartInterval) => {
	switch (unity) {
		case '1':
			return 'day';
		case '7':
			return 'week';
		case '30':
			return 'month';
		default:
			return 'year';
	}
};

export function prepareTransactionForSubmission(transaction: Transaction) {
	return {
		portfolioId: transaction.portfolioCoinId.split('_')[0],
		coinId: transaction.portfolioCoinId.split('_')[1] || transaction.portfolioCoinId,
		quantityCrypto: transaction.quantityCrypto,
		amountUsd: transaction.amountUsd,
		type: transaction.type,
		pricePerCoin: transaction.pricePerCoin,
		fees: transaction.fees || 0,
		note: transaction.note || ''
	};
}

/**
 * Convertit une transaction pour l'affichage
 */
export function formatTransactionForDisplay(transaction: Transaction) {
	return {
		...transaction,
		formattedAmount: `$${transaction.amountUsd.toFixed(2)}`,
		formattedQuantity: transaction.quantityCrypto.toFixed(2),
		formattedPrice: `$${transaction.pricePerCoin.toFixed(2)}`,
		formattedFees: transaction.fees ? `$${transaction.fees.toFixed(2)}` : '$0.00',
		formattedDate: transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'
	};
}

/**
 * Vérifie si deux transactions sont identiques
 */
export function areTransactionsEqual(tx1: Transaction, tx2: Transaction): boolean {
	return tx1.id === tx2.id && tx1.portfolioCoinId === tx2.portfolioCoinId && tx1.quantityCrypto === tx2.quantityCrypto && tx1.amountUsd === tx2.amountUsd && tx1.type === tx2.type && tx1.pricePerCoin === tx2.pricePerCoin && tx1.fees === tx2.fees && tx1.note === tx2.note;
}
