import { DrawerMode } from '@/hooks/use-drawer-state';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
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
import { useEffect, useMemo } from 'react';
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

const FormSchema = z.object({
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
    .nullable(),
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
  isActive: z.boolean().default(false).optional(),
});

type DefaultValues = z.infer<typeof FormSchema>;

const defaultValues: DefaultValues = {
  isActive: false,
  departureDate: null,
  arrivalCityId: '',
  departureCityId: '',
  regionId: null,
};

interface RouteFormProps {
  drawerMode: DrawerMode;
  routeId: string | null;
  onClose: () => void;
}

function RouteForm({ drawerMode, routeId, onClose }: RouteFormProps) {
  const form = useForm<DefaultValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    data: routeData,
    isPending: routeIsPending,
    isFetching: routeIsFetching,
  } = useRouteById(routeId, {
    enabled: !!routeId,
  });
  const { mutateAsync: createRoute } = useCreateRoute();

  const formState = form.formState;
  const values = form.getValues();
  const isSubmitting = formState.isSubmitting;

  const { data: regionsData, isPending: regionsIsPending } = useRegions();
  const regions = useMemo(() => regionsData?.regions ?? [], [regionsData]);

  const { data: citiesData, isPending: citiesIsPending } = useCities();
  const cities = useMemo(() => citiesData?.cities ?? [], [citiesData]);

  // Filter out selected arrival city from departure cities
  const departureCities = useMemo(() => {
    const selectedArrivalId = form.watch('arrivalCityId');
    return cities.filter(city => city.id !== selectedArrivalId);
  }, [cities, form.watch('arrivalCityId')]);

  // Filter out selected departure city from arrival cities
  const arrivalCities = useMemo(() => {
    const selectedDepartureId = form.watch('departureCityId');
    return cities.filter(city => city.id !== selectedDepartureId);
  }, [cities, form.watch('departureCityId')]);

  const onSubmit: SubmitHandler<DefaultValues> = async data => {
    if (routeData?.routeById) {
      // editing existing route
    } else {
      try {
        console.log({ data });
        // adding a new route
        const payload: CreateRouteInput = {
          ...data,
        };
        await createRoute({ input: payload });
        toast.success('Новый маршрут добавлен!', {
          richColors: true,
          position: 'bottom-center',
        });
        form.reset();
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
    }
  };

  return (
    <>
      {routeIsFetching && (
        <div className='w-full sm:max-w-screen-sm mx-auto'>
          <div className='flex items-center justify-center mt-2 mb-6 px-4 sm:px-5'>
            <SonnerSpinner className='bg-foreground' />
          </div>
        </div>
      )}
      {routeIsPending && <RouteFormSkeleton />}
      {!routeIsPending && (
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
                        items={departureCities}
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
                        items={arrivalCities}
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
                      <FormLabel>Дата поездки</FormLabel>
                      <DatePicker onValueChange={onChange} {...field} />
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
                disabled={isSubmitting}
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

export default RouteForm;
