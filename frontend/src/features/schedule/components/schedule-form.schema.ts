import { DaysOfWeek } from '@/gql/graphql';
import { z } from 'zod';

export const ScheduleFormSchema = z.object({
  startTime: z.string().trim().min(1, { message: 'Время отправления обязательно!' }),
  endTime: z.string().trim().min(1, { message: 'Время прибытия обязательно!' }),
  dayOfWeek: z.nativeEnum(DaysOfWeek, {
    required_error: 'День недели обязателен!',
  }),
  isActive: z.boolean().default(false),
});

export type ScheduleFormValues = z.infer<typeof ScheduleFormSchema>;

export const defaultValues: ScheduleFormValues = {
  isActive: false,
  startTime: '',
  endTime: '',
  dayOfWeek: undefined as unknown as DaysOfWeek,
};
