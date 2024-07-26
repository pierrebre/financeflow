import { z } from 'zod';

const IntervalModel = z.enum(['1', '7', '30', '365']);

export type ChartInterval = z.infer<typeof IntervalModel>;
