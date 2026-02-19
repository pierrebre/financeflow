import { z } from 'zod';

export const PortfolioSchema = z.object({
	name: z.string().min(2, { message: 'Minimum 2 characters' }).max(15, { message: 'Maximum 15 characters' }),
	description: z.string().optional()
});

export interface Portfolio {
	id: string;
	name: string;
	description: string | null;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface PortfolioCoin {
	id: string;
	portfolioId: string;
	coinId: string;
	coin?: {
		id?: string;
		name?: string;
	};
}
