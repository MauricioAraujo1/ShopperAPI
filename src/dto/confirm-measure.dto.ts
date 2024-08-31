import { z } from 'zod';

export const ConfirmMeasureDto = z.object({
  measure_uuid: z.string().uuid(),
  confirmed_value: z.number().int(),
});

export type ConfirmMeasureDto = z.infer<typeof ConfirmMeasureDto>;

