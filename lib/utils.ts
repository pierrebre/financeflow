import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, subDays, subWeeks, subMonths, subYears } from 'date-fns';
import { ChartInterval, Coin } from '@/schemas';
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
