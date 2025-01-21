import { DrawerMode } from '@/hooks/use-drawer-state';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { ComboBox } from '@/components/combo-box';
import { useCities } from '@/features/city/use-cities';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { SonnerSpinner } from '@/components/sonner-spinner';
import { Edit, MapPinPlus } from 'lucide-react';
import { useRegions } from '@/features/region/use-regions';
import { DatePicker } from '@/components/date-picker';
import { Switch } from '@/components/ui/switch';
import { useRouteById } from '@/features/routes/use-route-by-id';
import { Skeleton } from './ui/skeleton';
import { useCreateRoute } from '@/features/routes/use-create-route';
import { toast } from 'sonner';
import { CreateRouteInput } from '@/gql/graphql';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { useUpdateRoute } from '@/features/routes/use-update-route';
import { client } from '@/react-query';
import { NumericFormat } from 'react-number-format';
import { Input } from '@/components/ui/input';

const FormSchema = z
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
      .nullish()
      .refine(
        date => {
          if (date === null || date === undefined) {
            return true;
          }

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

type DefaultValues = z.infer<typeof FormSchema>;

const defaultValues: DefaultValues = {
  isActive: false,
  departureDate: null,
  arrivalCityId: '',
  departureCityId: '',
  regionId: null,
  price: 0,
};

interface RouteFormProps {
  drawerMode: DrawerMode;
  routeId: string | null;
  onClose: () => void;
}

export function RouteForm({ drawerMode, routeId, onClose }: RouteFormProps) {
  const {
    data: routeData,
    fetchStatus: routeFetchStatus,
    status: routeStatus,
    isSuccess: routeIsSuccess,
    isFetching: routeIsFetching,
  } = useRouteById(routeId, {
    enabled: !!routeId,
  });

  const values = routeData?.routeById
    ? {
        arrivalCityId: routeData.routeById.arrivalCity?.id as string,
        departureCityId: routeData.routeById.departureCity?.id as string,
        regionId: routeData.routeById.region?.id ?? null,
        departureDate: routeData.routeById.departureDate
          ? new Date(routeData.routeById.departureDate)
          : null,
        isActive: routeData.routeById.isActive,
        price: routeData.routeById.price,
      }
    : undefined;
  console.log({ values });

  const routeInitialLoading =
    routeFetchStatus === 'fetching' && routeStatus === 'pending';

  const form = useForm<DefaultValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
    values,
    mode: 'onChange',
  });

  const { mutateAsync: createRoute } = useCreateRoute();
  const { mutateAsync: updateRoute } = useUpdateRoute();

  const formState = form.formState;
  const isSubmitting = formState.isSubmitting;
  const isDirty = formState.isDirty;

  const { data: regionsData, isPending: regionsIsPending } = useRegions();
  const regions = useMemo(() => regionsData?.regions ?? [], [regionsData]);

  const { data: citiesData, isPending: citiesIsPending } = useCities();
  const cities = useMemo(() => citiesData?.cities ?? [], [citiesData]);

  // Watch both city fields
  const departureCityId = useWatch({
    control: form.control,
    name: 'departureCityId',
  });
  const arrivalCityId = useWatch({
    control: form.control,
    name: 'arrivalCityId',
  });

  // Trigger validation when either city changes
  useMemo(() => {
    if (departureCityId) {
      form.trigger('arrivalCityId');
    }
  }, [departureCityId, form]);

  useMemo(() => {
    if (arrivalCityId) {
      form.trigger('departureCityId');
    }
  }, [arrivalCityId, form]);

  // Filter out selected arrival city from departure cities
  // const departureCities = useMemo(() => {
  //   const selectedArrivalId = form.watch('arrivalCityId');
  //   return cities.filter(city => city.id !== selectedArrivalId);
  // }, [cities, form.watch('arrivalCityId')]);

  // Filter out selected departure city from arrival cities
  // const arrivalCities = useMemo(() => {
  //   const selectedDepartureId = form.watch('departureCityId');
  //   return cities.filter(city => city.id !== selectedDepartureId);
  // }, [cities, form.watch('departureCityId')]);

  const onSubmit: SubmitHandler<DefaultValues> = async data => {
    try {
      if (routeData?.routeById) {
        // editing existing route
        const payload: CreateRouteInput = {
          ...data,
        };
        await updateRoute({
          id: routeId as string,
          input: payload,
        });
        toast.success('Маршрут успешно обновлен!', {
          richColors: true,
          position: 'bottom-center',
        });
      } else {
        // adding a new route
        const payload: CreateRouteInput = {
          ...data,
        };
        await createRoute({ input: payload });
        toast.success('Новый маршрут добавлен!', {
          richColors: true,
          position: 'bottom-center',
        });
        client.invalidateQueries({ queryKey: ['InfiniteRoutes'] });
        form.reset();
      }
      onClose();
    } catch (error) {
      console.error(error);
      if (isGraphQLRequestError(error)) {
        toast.error(error.response.errors[0].message, {
          position: 'bottom-center',
          richColors: true,
        });
      } else if (error instanceof Error) {
        toast.error(error.message, {
          position: 'bottom-center',
          richColors: true,
        });
      }
    }
  };

  return (
    <>
      {routeIsFetching && routeIsSuccess && (
        <div className='w-full sm:max-w-screen-sm mx-auto'>
          <div className='flex items-center justify-center mb-6 px-4 sm:px-5'>
            <SonnerSpinner className='bg-foreground' />
          </div>
        </div>
      )}
      {routeInitialLoading && <RouteFormSkeleton />}
      {!routeInitialLoading && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='w-full sm:max-w-screen-sm space-y-6 mx-auto pb-3'
          >
            <div className='sm:grid sm:grid-cols-[repeat(auto-fill,_minmax(14rem,_1fr))] space-y-3 sm:space-y-0 sm:gap-y-4 sm:gap-x-2 px-4 sm:px-5'>
              <FormField
                control={form.control}
                name='departureCityId'
                render={({ field: { onChange, ...field } }) => {
                  return (
                    <FormItem>
                      <FormLabel>Город отправления</FormLabel>
                      <ComboBox
                        inputPlaceholder={'Искать город...'}
                        emptyLabel={'Не найдено городов'}
                        label={'Выберите откуда'}
                        isLoading={citiesIsPending}
                        items={cities}
                        onValueChange={onChange}
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name='arrivalCityId'
                render={({ field: { onChange, ...field } }) => {
                  return (
                    <FormItem>
                      <FormLabel>Город прибытия</FormLabel>
                      <ComboBox
                        inputPlaceholder={'Искать город...'}
                        emptyLabel={'Не найдено городов'}
                        label={'Выберите куда'}
                        isLoading={citiesIsPending}
                        items={cities}
                        onValueChange={onChange}
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name='regionId'
                render={({ field: { onChange, ...field } }) => {
                  return (
                    <FormItem>
                      <FormLabel>Регион</FormLabel>
                      <ComboBox
                        inputPlaceholder={'Искать регион...'}
                        emptyLabel={'Не найдено регионов'}
                        label={'Выберите регион'}
                        isLoading={regionsIsPending}
                        items={regions}
                        onValueChange={onChange}
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name='departureDate'
                render={({ field: { onChange, ...field } }) => {
                  return (
                    <FormItem>
                      <FormLabel>Активация поездки</FormLabel>
                      <DatePicker
                        label={'Выберите дату поездки'}
                        onValueChange={onChange}
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name='price'
                render={({ field: { onChange, ref, value, ...field } }) => {
                  return (
                    <FormItem>
                      <FormLabel>Цена</FormLabel>
                      <FormControl>
                        <NumericFormat
                          type='tel'
                          placeholder='Введите цену для маршрута'
                          customInput={Input}
                          thousandSeparator=' '
                          suffix=' ₽'
                          decimalScale={0}
                          allowNegative={false}
                          isAllowed={values => {
                            console.log(values);
                            const floatValue = values.floatValue;
                            return (
                              typeof floatValue === 'undefined' ||
                              floatValue > 0
                            );
                          }}
                          onValueChange={values => onChange(values.floatValue)}
                          value={value || ''}
                          getInputRef={ref}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name='isActive'
                render={({ field: { value, onChange, ...field } }) => {
                  return (
                    <FormItem className='col-span-2 flex flex-row items-center justify-between rounded-lg border shadow-sm pr-3 gap-1 sm:gap-0'>
                      <FormLabel className='flex-1 flex flex-col gap-1 py-3 ml-3 cursor-pointer'>
                        Активировать маршрут
                        <FormDescription className='text-xs font-normal'>
                          Сделать маршрут доступным для бронирования
                        </FormDescription>
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={value}
                          onCheckedChange={onChange}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />

              <Button
                disabled={isSubmitting || !isDirty}
                className={`w-full col-span-2`}
                type='submit'
              >
                {isSubmitting ? (
                  <>
                    <SonnerSpinner />
                    Пожалуйста подождите
                  </>
                ) : drawerMode === 'editRoute' ? (
                  <>
                    <Edit />
                    Сохранить изменения
                  </>
                ) : drawerMode === 'addRoute' ? (
                  <>
                    <MapPinPlus />
                    Добавить новый маршрут
                  </>
                ) : null}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
}

function RouteFormSkeleton() {
  return (
    <div className='w-full sm:max-w-screen-sm space-y-6 mx-auto pb-3'>
      <div className='sm:grid sm:grid-cols-[repeat(auto-fill,_minmax(14rem,_1fr))] space-y-3 sm:space-y-0 sm:gap-y-4 sm:gap-x-2 px-4 sm:px-5'>
        {/* Departure City */}
        <div className='space-y-2'>
          <Skeleton className='h-4 w-[100px]' />
          <Skeleton className='h-10 w-full' />
        </div>

        {/* Arrival City */}
        <div className='space-y-2'>
          <Skeleton className='h-4 w-[100px]' />
          <Skeleton className='h-10 w-full' />
        </div>

        {/* Region */}
        <div className='space-y-2'>
          <Skeleton className='h-4 w-[100px]' />
          <Skeleton className='h-10 w-full' />
        </div>

        {/* Departure Date */}
        <div className='space-y-2'>
          <Skeleton className='h-4 w-[100px]' />
          <Skeleton className='h-10 w-full' />
        </div>

        {/* Is Active Switch */}
        <div className='col-span-2 flex items-center justify-between rounded-lg border shadow-sm p-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-[150px]' />
            <Skeleton className='h-4 w-[200px]' />
          </div>
          <Skeleton className='h-6 w-11' />
        </div>

        {/* Submit Button */}
        <Button disabled className='w-full col-span-2'>
          <Skeleton className='h-5 w-[200px]' />
        </Button>
      </div>
    </div>
  );
}
