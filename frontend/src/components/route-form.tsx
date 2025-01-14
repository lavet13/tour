import { DrawerMode } from '@/hooks/use-drawer-state';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { z } from 'zod';


const FormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(3, { message: 'Имя обязательно к заполнению!' }),
  lastName: z
    .string()
    .trim()
    .min(4, { message: 'Фамилия обязательно к заполнению!' }),
  seatsCount: z
    .number({ invalid_type_error: 'Должно быть числом!' })
    .refine(value => value > 0, { message: 'Укажите количество мест!' }),
  travelDate: z
    .date({
      required_error: 'Дата поездки обязательна!',
      invalid_type_error: 'Выберите корректную дату!',
    })
    .nullable()
    .refine(
      date => {
        // Ensure date is a valid Date object
        if (!(date instanceof Date) || isNaN(date.getTime())) {
          return false;
        }

        // Reset time to start of the day for consistent comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        // Validate that the date is today or in the future
        return date >= today;
      },
      { message: 'Выберите сегодняшнюю или будущую дату!' },
    ),
  commentary: z.string().nullable(),
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
});

type DefaultValues = z.infer<typeof FormSchema>;

const defaultValues: DefaultValues = {
  firstName: '',
  lastName: '',
  seatsCount: 0,
  travelDate: null,
  commentary: null,
  arrivalCityId: '',
  departureCityId: '',
};

interface RouteFormProps {
  drawerMode: DrawerMode;
}

function RouteForm({ drawerMode }: RouteFormProps) {
  const form = useForm<DefaultValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<DefaultValues> = async data => {
    console.log({ data });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='w-full sm:max-w-screen-sm space-y-6 mx-auto'
      ></form>
    </Form>
  );
}

export default RouteForm;
