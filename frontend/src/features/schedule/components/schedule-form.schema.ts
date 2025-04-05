import { RouteDirection } from '@/gql/graphql';
import { z } from 'zod';

export const ScheduleFormSchema = z.object({
  departureTime: z.string().trim().min(1, { message: 'Время отправления обязательно!' }),
  arrivalTime: z.string().trim().min(1, { message: 'Время прибытия обязательно!' }),
  direction: z.nativeEnum(RouteDirection, {
    required_error: 'День недели обязателен!',
  }),
  stopName: z.string(),
  isActive: z.boolean().default(false),
});

export type ScheduleFormValues = z.infer<typeof ScheduleFormSchema>;

export const defaultValues: ScheduleFormValues = {
  isActive: false,
  departureTime: '',
  arrivalTime: '',
  stopName: '',
  direction: undefined as unknown as RouteDirection,
};
