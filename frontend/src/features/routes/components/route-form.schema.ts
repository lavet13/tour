import { z } from "zod";

export const RouteFormSchema = z
  .object({
    arrivalCityId: z
      .string({
        invalid_type_error: 'Выберите город прибытия!',
      })
      .cuid2({ message: 'Выберите город прибытия!' }),
    departureCityId: z
      .string({
        invalid_type_error: 'Выберите город отправления!',
      })
      .cuid2({ message: 'Выберите город отправления!' }),
    regionId: z
      .string({
        invalid_type_error: 'Выберите регион!',
      })
      .cuid2({ message: 'Выберите регион!' })
      .nullish(),
    departureDate: z
      .date({ invalid_type_error: 'Выберите корректную дату!' })
      .nullish(),
    price: z
      .number({
        message: 'Введите цену!',
      })
      .max(5_000, 'Цена слишком высокая!'),
    isActive: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (
      data.departureCityId &&
      data.arrivalCityId &&
      data.departureCityId === data.arrivalCityId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Город отправления и прибытия не могут быть одинаковыми!',
        path: ['departureCityId'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Город отправления и прибытия не могут быть одинаковыми!',
        path: ['arrivalCityId'],
      });
    }
    if (!data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Цена обязательна!',
        path: ['price'],
      });
    }
  });

export type RouteFormValues = z.infer<typeof RouteFormSchema>;

export const defaultValues: RouteFormValues = {
  isActive: false,
  departureDate: null,
  arrivalCityId: '',
  departureCityId: '',
  regionId: null,
  price: 0,
};
