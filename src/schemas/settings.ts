import { z } from 'zod';

export const SettingsSchema = z.object({
	name: z.optional(z.string()),
	isTwoFactorAuthenticated: z.optional(z.boolean()),
	email: z.optional(z.string().email()),
	image: z.union([z.string().url().optional(), z.any().optional()])
});

const IntervalModel = z.enum(['1', '7', '30', '365']);

export type ChartInterval = z.infer<typeof IntervalModel>;
