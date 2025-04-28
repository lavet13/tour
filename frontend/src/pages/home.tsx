import { FC, forwardRef, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  SubmitHandler,
  useController,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'react-router-dom';
import ru from 'react-phone-number-input/locale/ru.json';
import { ru as fnsRU } from 'date-fns/locale';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ComboBox } from '@/components/combo-box';
import {
  ArrowRightLeft,
  FilterX,
  ChevronDown,
  CalendarIcon,
  Minus,
  Plus,
  MapPin,
} from 'lucide-react';
import { Meteors } from '@/components/magicui/meteors';
import { LazyImageWrapper } from '@/components/lazy-image';
import { useArrivalCities, useDepartureCities } from '@/features/city';
import { useRouteByIds } from '@/features/routes';
import { useSchedulesByIds } from '@/features/schedule';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookingInput,
  GetRouteByIdsQuery,
  GetSchedulesByIdsQuery,
} from '@/gql/graphql';
import { cn } from '@/lib/utils';
import { FormButton } from '@/components/form-button';
import { keepPreviousData } from '@tanstack/react-query';
import { SonnerSpinner } from '@/components/sonner-spinner';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import { useCreateBooking } from '@/features/booking';
import { toast } from 'sonner';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/phone-input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useControllableState } from '@/hooks/use-controllable-state';
import { useMediaQuery } from '@/hooks/use-media-query';
import { format } from 'date-fns';
import { NumericFormat } from 'react-number-format';
import { Checkbox } from '@/components/ui/checkbox';

type Route = GetRouteByIdsQuery['routeByIds'];
type ScheduleItem = Omit<
  GetSchedulesByIdsQuery['schedulesByIds'][number],
  '__typename'
>;

const FormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(3, { message: 'Имя обязательно к заполнению!' }),
  lastName: z
    .string()
    .trim()
    .min(4, { message: 'Фамилия обязательно к заполнению!' }),
  phoneNumber: z
    .string({ required_error: 'Телефон обязателен к заполнению!' })
    .refine(isPossiblePhoneNumber, 'Проверьте правильность ввода телефона!'),
  seatsCount: z
    .number({ invalid_type_error: 'Должно быть числом!' })
    .refine(value => value > 0, { message: 'Укажите количество мест!' }),
  telegram: z.boolean(),
  whatsapp: z.boolean(),
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
  phoneNumber: '',
  seatsCount: 0,
  travelDate: null,
  arrivalCityId: '',
  departureCityId: '',
  telegram: false,
  whatsapp: false,
};

export default function HomePage() {
  const [phoneInputKey, setPhoneInputKey] = useState(0);

  // Search Params syncronization
  const [searchParams, setSearchParams] = useSearchParams();
  const departureCityId = searchParams.get('departureCityId')!;
  const arrivalCityId = searchParams.get('arrivalCityId')!;

  // arrivalCities
  const { data: arrivalData, isLoading: arrivalIsLoading } = useArrivalCities({
    cityId: departureCityId,
    options: { enabled: !!departureCityId },
  });
  const arrivalCities = useMemo(
    () => arrivalData?.arrivalCities || [],
    [arrivalData],
  );

  // departureCities
  const { data: departureData, isPending: departureIsPending } =
    useDepartureCities();
  const departureCities = useMemo(
    () => departureData?.departureCities || [],
    [departureData],
  );

  const {
    data: routeData,
    isLoading: routeIsLoading,
    isFetching: routeIsFetching,
  } = useRouteByIds({
    arrivalCityId,
    departureCityId,
    options: {
      enabled: !!arrivalCityId && !!departureCityId,
      placeholderData: keepPreviousData,
    },
  });

  const route: Route = routeData?.routeByIds || null;
  console.log({ route });

  const {
    data: schedulesData,
    isLoading: schedulesIsLoading,
    isFetching: schedulesIsFetching,
  } = useSchedulesByIds({
    arrivalCityId,
    departureCityId,
    options: {
      enabled: !!arrivalCityId && !!departureCityId,
      placeholderData: keepPreviousData,
    },
  });

  // Обновим функцию сортировки расписаний, чтобы правильно обрабатывать строковые значения enum
  const schedules = useMemo(() => {
    return schedulesData?.schedulesByIds ?? [];
  }, [schedulesData]);
  console.log({ schedules });

  const form = useForm<DefaultValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const formState = form.formState;
  const values = form.getValues();
  const isSubmitting = formState.isSubmitting;
  console.log({
    errors: formState.errors,
    dirtyFields: formState.dirtyFields,
    formState,
    values,
  });

  const { mutateAsync: createBooking } = useCreateBooking();
  const onSubmit: SubmitHandler<DefaultValues> = async data => {
    try {
      const payload: BookingInput = {
        ...data,
        travelDate: data.travelDate as Date,
      };
      await createBooking({ input: payload });

      form.reset();
      setSearchParams(p => {
        const keys = [...p.entries()].map(([key]) => key);
        const query = new URLSearchParams(p.toString());
        keys.forEach(key => query.delete(key));
        return query;
      });

      toast.success('Заявка оформлена!', {
        richColors: true,
        position: 'bottom-center',
      });
      setPhoneInputKey(prev => prev + 1);
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

  // Function to swap departure and arrival cities
  const handleSwapCities = () => {
    console.log('clicked');
    const departureCityId = form.getValues('departureCityId');
    const arrivalCityId = form.getValues('arrivalCityId');

    if (departureCityId && arrivalCityId) {
      form.setValue('departureCityId', arrivalCityId, { shouldValidate: true });
      form.setValue('arrivalCityId', departureCityId, { shouldValidate: true });
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());

        query.set('departureCityId', arrivalCityId);
        query.set('arrivalCityId', departureCityId);

        return query;
      });
    }
  };

  // New effect to handle URL parameter changes
  useEffect(() => {
    const clearFields = () => {
      form.setValue('departureCityId', '', { shouldValidate: false });
      form.setValue('arrivalCityId', '', { shouldValidate: false });
      setSearchParams(
        params => {
          const query = new URLSearchParams(params.toString());
          query.delete('departureCityId');
          query.delete('arrivalCityId');
          return query;
        },
        { replace: true },
      );
    };

    // Check if departure cities are loaded
    if (!departureCities.length || arrivalIsLoading) return;

    // Reset form if departure city is cleared
    if (!departureCityId) {
      clearFields();
      return;
    }

    // Validate and set departure city if exists in the list
    const validDepartureCity = departureCities.find(
      city => city.id === departureCityId,
    );
    if (validDepartureCity) {
      form.setValue('departureCityId', validDepartureCity.id, {
        shouldValidate: true,
      });

      // If arrival city is present, validate it
      if (arrivalCityId) {
        const validArrivalCity = arrivalCities.find(
          city => city.id === arrivalCityId,
        );

        if (validArrivalCity) {
          form.setValue('arrivalCityId', validArrivalCity.id, {
            shouldValidate: true,
          });
        } else {
          // Clear invalid arrival city
          form.setValue('arrivalCityId', '', { shouldValidate: false });
          setSearchParams(
            params => {
              const query = new URLSearchParams(params.toString());
              query.delete('arrivalCityId');
              return query;
            },
            { replace: true },
          );
        }
      } else {
        form.setValue('arrivalCityId', '', { shouldValidate: false });
        setSearchParams(
          params => {
            const query = new URLSearchParams(params.toString());
            query.delete('arrivalCityId');
            return query;
          },
          { replace: true },
        );
      }
    } else {
      // Clear invalid departure city and related arrival city
      clearFields();
    }
  }, [
    arrivalIsLoading,
    arrivalCityId,
    departureCityId,
    departureCities,
    arrivalCities,
    form,
    setSearchParams,
  ]);

  return (
    <div className='flex-1 flex flex-col bg-gradient-to-b from-background to-background/95 font-inter'>
      <section className='relative -top-[3.5rem] py-16 md:py-24 overflow-hidden'>
        <div className='absolute inset-0 z-0'>
          <div className='absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-10' />
          <LazyImageWrapper
            src='/hero.png'
            fallbackSrc='/placeholder.svg'
            alt='Bus travel'
            className='object-cover w-full h-[calc(100%)]'
          />
        </div>

        <div className='container relative z-10 mt-[3.5rem]'>
          <div className='max-w-5xl mx-auto text-center mb-9 sm:mb-12 space-y-4'>
            <h1 className='text-5xl font-thin leading-none tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-inter italic'>
              Пассажирские перевозки
              <span className='flex justify-center font-semibold text-4xl font-nunito sm:text-5xl md:text-6xl lg:text-7xl'>
                в Мариуполь и<br /> на Азовское побережье
              </span>
            </h1>
          </div>

          <div className='max-w-3xl mx-auto relative overflow-hidden'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                <div className='max-w-4xl mx-auto bg-gradient-to-r from-primary-foreground/90 to-primary-foreground/90 rounded-2xl px-4 p-5 md:p-12 relative overflow-hidden space-y-4 z-10'>
                  <div className='absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]' />
                  <div className='absolute inset-0 z-0'>
                    <Meteors number={5} />
                  </div>
                  <div className='relative z-10'>
                    <h2 className='text-2xl md:text-3xl font-bold mb-4 text-center'>
                      Выберите нужный вам маршрут
                    </h2>
                    <p className='text-muted-foreground text-center mb-8 max-w-2xl mx-auto'>
                      Выберите откуда вы хотите поехать и куда
                    </p>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10'>
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
                              isLoading={departureIsPending}
                              items={departureCities}
                              onValueChange={value => {
                                onChange(value);
                                form.setValue('arrivalCityId', '', {
                                  shouldValidate: false,
                                });
                                setSearchParams(params => {
                                  const query = new URLSearchParams(
                                    params.toString(),
                                  );
                                  query.set('departureCityId', value);
                                  query.delete('arrivalCityId');
                                  return query;
                                });
                              }}
                              {...field}
                            />
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    {/* Swap button for mobile and desktop */}
                    <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 md:block hidden'>
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        className='rounded-full bg-background shadow-md hover:bg-primary/10'
                        onClick={handleSwapCities}
                        disabled={
                          !form.watch('departureCityId') ||
                          !form.watch('arrivalCityId')
                        }
                      >
                        <ArrowRightLeft className='h-4 w-4' />
                        <span className='sr-only'>Поменять города местами</span>
                      </Button>
                    </div>

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
                              isLoading={arrivalIsLoading}
                              items={arrivalCities}
                              disabled={!form.watch('departureCityId')}
                              onValueChange={value => {
                                onChange(value);
                                setSearchParams(params => {
                                  const query = new URLSearchParams(
                                    params.toString(),
                                  );
                                  query.set('arrivalCityId', value);
                                  return query;
                                });
                              }}
                              {...field}
                            />
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  {/* Mobile swap button */}
                  <div className='relative z-10 flex justify-center md:hidden'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='rounded-full xs:w-auto w-full'
                      onClick={handleSwapCities}
                      disabled={
                        !form.watch('departureCityId') ||
                        !form.watch('arrivalCityId')
                      }
                    >
                      <ArrowRightLeft className='h-4 w-4 mr-2' />
                      <span>Поменять местами</span>
                    </Button>
                  </div>

                  <div className='relative z-10 flex justify-center pb-5'>
                    {(departureCityId || arrivalCityId) && (
                      <Button
                        variant='outline'
                        type='button'
                        className='relative overflow-hidden px-10 w-full xs:w-auto'
                        size='lg'
                        onClick={() =>
                          setSearchParams(params => {
                            const query = new URLSearchParams(
                              params.toString(),
                            );

                            query.delete('departureCityId');
                            query.delete('arrivalCityId');

                            return query;
                          })
                        }
                      >
                        <FilterX />
                        Очистить фильтр
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>
      {schedulesIsLoading && routeIsLoading ? (
        <div className='flex justify-center col-span-full'>
          <SonnerSpinner className='bg-foreground' />
        </div>
      ) : route && schedules && departureCityId && arrivalCityId ? (
        <section className='py-8 pt-0 pb-10 md:pt-0 md:py-12 dark:bg-gradient-to-b dark:from-background/50 dark:to-background'>
          <div className='grid sm:grid-cols-1 lg:grid-cols-2 justify-items-center gap-3 container relative z-10'>
            <RouteSection className='mx-0 max-w-3xl lg:max-w-2xl lg:justify-self-end'>
              <div className='absolute h-full w-full -z-[10] dark:bg-gradient-to-b dark:from-transparent dark:to-primary-foreground/90' />
              <RouteInfo
                isFetching={routeIsFetching && schedulesIsFetching}
                route={route}
                schedules={schedules}
                handleSwapCities={handleSwapCities}
                form={form}
              />
            </RouteSection>
            <RouteSection className='mx-0 max-w-3xl lg:max-w-2xl lg:justify-self-start'>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-6 h-full'
                >
                  <div className='max-w-4xl h-full mx-auto dark:bg-gradient-to-r dark:from-primary-foreground/90 dark:to-primary-foreground/90 rounded-2xl px-4 p-5 pt-8 md:p-12 md:px-5 relative overflow-hidden space-y-4 z-10'>
                    <div className='relative z-10'>
                      <h2 className='text-2xl md:text-3xl font-bold mb-4 text-center'>
                        Укажите свои данные
                      </h2>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10'>
                      <FormField
                        control={form.control}
                        name='lastName'
                        render={({ field: { onChange, ...field } }) => {
                          return (
                            <FormItem>
                              <FormLabel>Фамилия</FormLabel>
                              <FormControl>
                                <Input
                                  onChange={e => {
                                    const capitalizeFirstChars = (
                                      value: string,
                                    ) => {
                                      const words = value.split(' ');
                                      const capitalizedWorlds = words
                                        .map(w =>
                                          w
                                            .replace(
                                              /^./,
                                              (
                                                w.at(0) as string
                                              )?.toUpperCase(),
                                            )
                                            .replace(/\d/gi, ''),
                                        )

                                        .join(' ');
                                      return capitalizedWorlds;
                                    };

                                    onChange(
                                      capitalizeFirstChars(e.target.value),
                                    );
                                  }}
                                  placeholder={'Иванов'}
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
                        name='firstName'
                        render={({ field: { onChange, ...field } }) => {
                          return (
                            <FormItem>
                              <FormLabel>Имя</FormLabel>
                              <FormControl>
                                <Input
                                  onChange={e => {
                                    const capitalizeFirstChars = (
                                      value: string,
                                    ) => {
                                      const words = value.split(' ');
                                      const capitalizedWorlds = words
                                        .map(w =>
                                          w
                                            .replace(
                                              /^./,
                                              (
                                                w.at(0) as string
                                              )?.toUpperCase(),
                                            )
                                            .replace(/\d/gi, ''),
                                        )
                                        .join(' ');
                                      return capitalizedWorlds;
                                    };

                                    onChange(
                                      capitalizeFirstChars(e.target.value),
                                    );
                                  }}
                                  placeholder={'Иван'}
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
                        name='phoneNumber'
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Телефон</FormLabel>
                              <FormControl>
                                <PhoneInput
                                  key={phoneInputKey}
                                  placeholder='Введите номер телефона'
                                  countries={['RU']}
                                  international
                                  labels={ru}
                                  countryCallingCodeEditable={false}
                                  defaultCountry={'RU'}
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
                        name='travelDate'
                        render={({ field: { onChange, ...field } }) => {
                          return (
                            <FormItem>
                              <FormLabel>Желаемая дата поездки</FormLabel>
                              <DatePicker onValueChange={onChange} {...field} />
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={form.control}
                        name='telegram'
                        render={({ field: { value, onChange, ...field } }) => {
                          return (
                            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow'>
                              <FormControl>
                                <Checkbox
                                  checked={value}
                                  onCheckedChange={onChange}
                                  {...field}
                                />
                              </FormControl>
                              <div className='space-y-1 leading-none'>
                                <FormLabel>Telegram</FormLabel>
                                <FormDescription className='text-xs'>
                                  Выберите если телефон привязан к телеграму
                                </FormDescription>
                              </div>
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={form.control}
                        name='whatsapp'
                        render={({ field: { value, onChange, ...field } }) => {
                          return (
                            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow'>
                              <FormControl>
                                <Checkbox
                                  checked={value}
                                  onCheckedChange={onChange}
                                  {...field}
                                />
                              </FormControl>
                              <div className='space-y-1 leading-none'>
                                <FormLabel>Whatsapp</FormLabel>
                                <FormDescription className='text-xs'>
                                  Выберите если телефон привязан к ватсапу
                                </FormDescription>
                              </div>
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={form.control}
                        name='seatsCount'
                        render={({ field: { onChange, ...field } }) => {
                          return (
                            <FormItem className='sm:col-span-2'>
                              <FormLabel>Количество мест</FormLabel>
                              <Counter onValueChange={onChange} {...field} />
                              <FormMessage className='text-center' />
                            </FormItem>
                          );
                        }}
                      />
                    </div>

                    <div className='relative z-10 flex justify-center pb-5'>
                      <FormButton
                        disabled={isSubmitting}
                        className='relative overflow-hidden px-10 w-full xs:w-auto'
                        type='submit'
                      >
                        {isSubmitting ? (
                          <>
                            <SonnerSpinner />
                            Оформляем заявку
                          </>
                        ) : (
                          'Заказать билет'
                        )}
                      </FormButton>
                    </div>
                  </div>
                </form>
              </Form>
            </RouteSection>
          </div>
        </section>
      ) : null}
    </div>
  );
}

// Add the RouteStopsList component
type RouteStopsListProps = {
  routeName: string;
  stops: ScheduleItem[];
};

const RouteStopsList: FC<RouteStopsListProps> = ({ stops }) => {
  if (stops.length === 0) {
    return (
      <div className='p-6 text-center text-muted-foreground'>
        Расписание не найдено
      </div>
    );
  }

  return (
    <div className='p-3 pt-1 sm:p-4 sm:pt-1 sm:pl-16'>
      <div className='relative'>
        {/* Vertical line connecting stops */}
        <div className='absolute z-[-10] left-2.5 top-3 bottom-3 w-[1px] bg-border' />

        {/* Stops */}
        <div className='space-y-1'>
          {stops.map((stop, index, arr) => (
            <RouteStop
              key={`stop-${index}`}
              time={stop.time}
              location={stop.city?.name || ''}
              details={stop.stopName}
              isActive={stop.isActive}
              isCurrentStop={index === 0 || index === arr.length - 1} // Optional: mark first stop as current
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Add the RouteStop component
type RouteStopProps = {
  time: string;
  location: string;
  details?: string | null;
  isActive?: boolean;
  isCurrentStop?: boolean;
};

const RouteStop: FC<RouteStopProps> = ({
  time,
  location,
  details,
  isActive = true,
  isCurrentStop = false,
}) => {
  return (
    <div className='flex items-start gap-3 py-2 last:pb-0'>
      <div className='pt-0.5'>
        <div
          className={cn(
            'size-5 rounded-full border flex items-center justify-center',
            isCurrentStop
              ? 'bg-primary border-primary text-primary-foreground'
              : isActive
                ? 'border-muted-foreground/50 bg-background'
                : 'border-muted-foreground/30 bg-muted/30',
          )}
        ></div>
      </div>
      <div className='flex-1'>
        <div className='flex flex-wrap items-baseline gap-x-2'>
          <span
            className={cn(
              'text-sm font-medium',
              !isActive && 'text-muted-foreground',
            )}
          >
            {time}
          </span>
          <span
            className={cn(
              'text-sm font-semibold',
              !isActive && 'text-muted-foreground',
            )}
          >
            {location}
          </span>
        </div>
        {details && (
          <p className='text-xs text-muted-foreground mt-0.5'>{details}</p>
        )}
      </div>
    </div>
  );
};

type RouteSectionProps = {
  children?: ReactNode;
  className?: string;
};

function RouteSection({ children, className }: RouteSectionProps) {
  return (
    <div
      className={cn(
        'max-w-xl w-full mx-auto dark:bg-gradient-to-b dark:from-primary-foreground/5 dark:to-primary-foreground/5 rounded-2xl relative overflow-hidden z-10 border',
        className,
      )}
    >
      <div className='absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]' />
      <div className='relative z-10 h-full'>{children}</div>
    </div>
  );
}

type RouteInfoProps = {
  route: NonNullable<Route>;
  schedules: ScheduleItem[];
  handleSwapCities: () => void;
  form: UseFormReturn<DefaultValues>;
  isFetching: boolean;
};

function RouteInfo({
  isFetching,
  route,
  schedules,
  handleSwapCities,
  form,
}: RouteInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Group schedules by direction
  const filteredSchedules = [
    ...schedules.filter(s => s.direction === route.direction),
  ].sort((a, b) => (a.time > b.time ? 1 : -1));

  return (
    <div className='flex flex-col h-full items-stretch justify-between'>
      <div>
        <div className='grid gap-1 sm:gap-y-4 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 px-4 p-5 pt-8 pb-1 md:p-12 md:px-7 md:pb-4 relative'>
          {isFetching && (
            <div className='absolute left-1/2 -translate-x-1/2 top-3 lg:top-5 flex justify-center col-span-full'>
              <SonnerSpinner className='bg-foreground' />
            </div>
          )}
          <div className='col-span-full flex flex-col items-center xs:items-baseline justify-center xs:justify-between xs:flex-row flex-wrap gap-1 z-10'>
            {route.region?.name && (
              <div className='flex items-center gap-1.5 justify-center text-background bg-foreground px-2 py-1 rounded-full'>
                <MapPin className='h-3.5 w-3.5 text-background' />
                <span className='text-xs font-medium'>
                  {route.region?.name}
                </span>
              </div>
            )}
            <div className='bg-foreground rounded-full text-background px-2 leading-3 flex justify-center items-baseline'>
              <span className='text-lg font-bold'>{route.price} ₽</span>
            </div>
          </div>
          <div className='flex flex-col sm:mt-3'>
            <div className='text-center lg:text-start'>
              <span>Откуда: </span>
              <span className='font-bold'>{route.departureCity?.name}</span>
              <div className='flex flex-col'>
                {route.departureCity?.description && (
                  <span className='text-muted-foreground text-xs'>
                    ({route.departureCity?.description})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className='flex flex-col sm:mt-3'>
            <div className='text-center lg:text-start'>
              <span>Куда: </span>
              <span className='font-bold'>{route.arrivalCity?.name}</span>
              <div className='flex flex-col'>
                {route.arrivalCity?.description && (
                  <span className='text-muted-foreground text-xs'>
                    ({route.arrivalCity?.description})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='flex justify-center items-center py-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='rounded-full w-fit px-6 justify-self-center col-span-full'
            onClick={handleSwapCities}
            disabled={
              !form.watch('departureCityId') || !form.watch('arrivalCityId')
            }
          >
            <ArrowRightLeft className='h-4 w-4 mr-2' />
            <span>Поменять местами</span>
          </Button>
        </div>
      </div>
      {/* <div className='relative mx-4 m-5 mt-4 mb-1 md:m-12 md:mx-7 md:mt-4 md:mb-0 overflow-hidden'> */}
      {/*   <div className='w-full bg-gradient-to-b from-transparent to-primary-foreground/80 absolute z-10 flex justify-center left-1/2 -translate-x-1/2 bottom-0 right-0 py-16 pb-2 rounded-b-none'> */}
      {/*     <Button */}
      {/*       onClick={() => setIsOpen(!isOpen)} */}
      {/*       className='w-fit gap-0 h-7' */}
      {/*       size='sm' */}
      {/*     > */}
      {/*       {isOpen ? 'Свернуть' : 'Показать'} */}
      {/*       <ChevronDown */}
      {/*         className={cn( */}
      {/*           'h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200 ml-1', */}
      {/*           isOpen && 'transform rotate-180', */}
      {/*         )} */}
      {/*       /> */}
      {/*     </Button> */}
      {/*   </div> */}
      {/*   <LazyImageWrapper */}
      {/*     src='/hero.png' */}
      {/*     fallbackSrc='/placeholder.svg' */}
      {/*     alt='Bus travel' */}
      {/*     className={cn( */}
      {/*       'object-cover aspect-[4/2] sm:aspect-[4/1] rounded-2xl w-full h-full', */}
      {/*       isOpen && 'aspect-auto sm:aspect-auto', */}
      {/*     )} */}
      {/*   /> */}
      {/* </div> */}
      {schedules.length !== 0 && (
        <Schedules
          schedules={filteredSchedules}
          departureCityName={route.departureCity?.name}
          arrivalCityName={route.arrivalCity?.name}
        />
      )}
    </div>
  );
}

type SchedulesProps = {
  schedules: ScheduleItem[];
  departureCityName?: string;
  arrivalCityName?: string;
};

function Schedules({
  schedules,
  departureCityName,
  arrivalCityName,
}: SchedulesProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen
            ? 'max-h-[2000px] opacity-100 visible'
            : 'max-h-0 opacity-0 invisible',
        )}
      >
        <RouteStopsList
          routeName={`${departureCityName} - ${arrivalCityName}`}
          stops={schedules}
        />
      </div>
      {/* Sticky button container with proper positioning */}
      <div className='relative'>
        <div
          className={cn(
            'sticky bottom-0 left-0 right-0 flex items-center justify-center backdrop-blur-sm py-2 z-10 ',
            isOpen && 'sm:border-t border-dashed',
          )}
        >
          <Button
            className='w-fit gap-1 mx-4 sm:mx-0 rounded-full'
            onClick={() => setIsOpen(!isOpen)}
            variant='ghost'
            size='sm'
          >
            {isOpen ? 'Свернуть расписание' : 'Посмотреть расписание'}
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200 ml-1',
                isOpen && 'transform rotate-180',
              )}
            />
          </Button>
        </div>
      </div>
    </>
  );
}

interface CounterProps {
  name: string;
  value?: any;
  onValueChange?: (value: any) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

const Counter = forwardRef<HTMLInputElement, CounterProps>(
  ({ name, value: valueProp, onValueChange }, ref) => {
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
    });

    const {
      fieldState: { error },
    } = useController({ name });

    // const isAllowed = (values: { floatValue?: number }) => {
    //   const { floatValue } = values;
    //
    //   return floatValue === undefined || (floatValue >= 1 && floatValue <= 20);
    // };

    return (
      <FormControl>
        <div
          className={cn(
            'flex items-center justify-center space-x-2 sm:space-x-4',
            value === 0 && 'text-muted-foreground',
            'focus:outline-none focus:ring-1 focus:ring-ring',
          )}
        >
          <Button
            variant='outline'
            size='icon'
            className={cn('h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full')}
            type='button'
            onClick={() => setValue(value - 1)}
            disabled={value <= 0}
            tabIndex={-1}
          >
            <Minus className='h-4 w-4 sm:h-5 sm:w-5' />
            <span className='sr-only'>Уменьшить</span>
          </Button>
          <div className='flex-1 text-center'>
            <NumericFormat
              displayType='text'
              getInputRef={ref}
              value={value || 0}
              className={cn(
                'bg-transparent focus:outline-none focus:ring-1 focus:ring-ring',
                'text-3xl sm:text-4xl font-bold tracking-tighter text-center w-full',
                error && 'text-destructive',
              )}
            />
            <div
              className={cn(
                'text-[0.70rem] sm:text-sm uppercase text-muted-foreground',
                error && 'text-destructive',
              )}
            >
              Кол-во мест
            </div>
          </div>
          <Button
            variant='outline'
            size='icon'
            className={cn('h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full')}
            type='button'
            onClick={() => setValue(value + 1)}
            disabled={value >= 20}
            tabIndex={-1}
          >
            <Plus className='h-4 w-4 sm:h-5 sm:w-5' />
            <span className='sr-only'>Увеличить</span>
          </Button>
        </div>
      </FormControl>
    );
  },
);

type DatePickerProps = {
  name: string;
  value?: any;
  onValueChange?: (value: any) => void;
  disabled?: boolean;
};

const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  ({ value: valueProp, onValueChange, name, disabled }, ref) => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
    });

    const [open, setOpen] = useState(false);

    const {
      fieldState: { error },
    } = useController({ name });

    const renderTrigger = () => {
      return (
        <FormControl>
          <Button
            ref={ref}
            variant='outline'
            className={cn(
              'flex w-full',
              'focus:outline-none focus:ring-1 focus:ring-ring aria-[invalid=true]:ring-destructive aria-[invalid=true]:border-destructive/15 hover:aria-[invalid=true]:bg-destructive/10 hover:aria-[invalid=true]:text-destructive',
              'justify-start text-left font-normal',
              !value && 'text-muted-foreground',
            )}
            disabled={disabled}
          >
            <CalendarIcon
              className={cn('mr-2 size-4', error && 'text-destructive/70')}
            />
            {value ? (
              <span
                className={cn('font-semibold', error && 'text-destructive/90')}
              >
                {format(value, 'PPP', {
                  locale: fnsRU,
                })}
              </span>
            ) : (
              <span
                className={cn(
                  'whitespace-pre leading-3 text-center',
                  error && 'text-destructive/80',
                )}
              >
                Выберите дату поездки
              </span>
            )}
          </Button>
        </FormControl>
      );
    };

    const renderContent = () => {
      return (
        <Calendar
          className='w-fit mx-auto'
          locale={fnsRU}
          mode='single'
          selected={value}
          onSelect={date => {
            setValue(date);
            setOpen(false);
          }}
          initialFocus
        />
      );
    };

    return isDesktop ? (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{renderTrigger()}</PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
          {renderContent()}
        </PopoverContent>
      </Popover>
    ) : (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{renderTrigger()}</DrawerTrigger>
        <DrawerContent className='min-h-[380px]'>
          {renderContent()}
        </DrawerContent>
      </Drawer>
    );
  },
);

function SkeletonRoute() {
  return (
    <>
      <div className='grid gap-1 sm:grid-cols-[repeat(auto-fill,_minmax(13rem,_1fr))]'>
        <div className='space-y-2'>
          <Skeleton className='w-12 h-4' />
          <Skeleton className='w-24 h-4' />
        </div>

        <div className='space-y-2'>
          <Skeleton className='w-12 h-4' />
          <Skeleton className='w-24 h-4' />
        </div>
      </div>

      <div className='mt-7 md:mt-10 flex items-center justify-center'>
        <Button size='sm' variant='ghost'>
          <Skeleton className='h-5 w-[200px]' />
        </Button>
      </div>
    </>
  );
}
