import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, subDays, subWeeks, subMonths, subYears } from 'date-fns';
import { ChartInterval } from '@/lib/types/Chart';

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

export async function hashString(input: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(input);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	return hashHex;
}
