import { z } from 'zod';

export const MeasureType = z.enum(['WATER', 'GAS']);

export const CreateMeasureDto = z.object({
  image: z.string().base64(),
  customer_code: z.string().min(1),
  measure_datetime: z.string().datetime(),
  measure_type: MeasureType,
});

export type CreateMeasureDto = z.infer<typeof CreateMeasureDto>;
export type MeasureType = z.infer<typeof MeasureType>
