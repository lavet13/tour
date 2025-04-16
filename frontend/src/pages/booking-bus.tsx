import { FC, forwardRef, useEffect, useMemo, useState } from 'react';

import { toast } from 'sonner';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import ru from 'react-phone-number-input/locale/ru.json';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useController, useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/phone-input';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { cn } from '@/lib/utils';
import { BorderBeam } from '@/components/ui/border-beam';
import { SonnerSpinner } from '@/components/sonner-spinner';
import { useSearchParams } from 'react-router-dom';
import {
  useArrivalCities,
  useDepartureCities,
} from '@/features/city/api/queries';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ArrowDown,
  ArrowRightLeft,
  ArrowUp,
  CalendarIcon,
  ChevronDown,
  Clock,
  MapPin,
  Minus,
  Plus,
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useControllableState } from '@/hooks/use-controllable-state';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ru as fnsRU } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { useCreateBooking } from '@/features/booking/api/mutations';
import {
  BookingInput,
  RouteDirection,
  GetSchedulesByIdsQuery,
} from '@/gql/graphql';
import { ComboBox } from '@/components/combo-box';
import { NumericFormat } from 'react-number-format';
import { useSchedulesByIds } from '@/features/schedule';
import { useRouteByIds } from '@/features/routes';
import { LazyImageWrapper } from '@/components/lazy-image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormButton } from '@/components/form-button';
import { useTheme } from '@/lib/atoms/theme';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
};

const BookingBusPage: FC = () => {
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

  const { data: routeData } = useRouteByIds({
    arrivalCityId,
    departureCityId,
    options: {
      enabled: !!arrivalCityId && !!departureCityId,
    },
  });

  const route = useMemo(() => routeData?.routeByIds || null, [routeData]);
  console.log({ route });

  const { data: schedulesData, isLoading: schedulesIsLoading } =
    useSchedulesByIds({
      arrivalCityId,
      departureCityId,
      options: {
        enabled: !!arrivalCityId && !!departureCityId,
      },
    });

  // Обновим функцию сортировки расписаний, чтобы правильно обрабатывать строковые значения enum
  const schedules = useMemo(() => {
    return schedulesData?.schedulesByIds ?? [];
  }, [schedulesData]);

  const form = useForm<DefaultValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
    mode: 'onChange',
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

  return (
    <div className='container mt-5 mb-10 flex flex-col gap-2'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full sm:max-w-screen-sm space-y-6 mx-auto'
        >
          <div className='relative overflow-hidden w-full h-full border rounded-xl'>
            <div className='flex flex-col mb-3 sm:mb-7 p-5 pb-0'>
              <div className='flex flex-col sm:flex-row items-center font-semibold tracking-tight text-xl'>
                <span className='leading-6 text-center'>
                  Бронирование рейса
                </span>
              </div>
            </div>

            <div className='px-4 sm:px-5 p-4 space-y-4 border-y'>
              <p className='text-center sm:text-start text-sm text-muted-foreground'>
                Выберите пункт отправления и прибытия
              </p>
              <div className='sm:grid sm:grid-cols-[repeat(auto-fill,_minmax(17rem,_1fr))] space-y-3 sm:space-y-0 sm:gap-y-4 sm:gap-x-2'>
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
            </div>

            {/* Route information card - now inside the form */}
            {route && (
              <div className='border-b'>
                <Card className='h-fit overflow-hidden border-0 rounded-none shadow-none'>
                  <div className='grid grid-cols-1 gap-0'>
                    {/* Route Image */}
                    <div className='relative'>
                      <LazyImageWrapper
                        src={
                          route.photoName
                            ? `/uploads/images/${route.photoName}`
                            : `/placeholder.svg`
                        }
                        fallbackSrc={'/placeholder.svg'}
                        alt={`Route from ${route.departureCity?.name} to ${route.arrivalCity?.name}`}
                        className='object-cover h-80 w-full'
                      />

                      {/* Region badge */}
                      {route.region && (
                        <div className='absolute top-4 left-4 z-[2] flex items-center gap-1.5 bg-background/90 backdrop-blur-sm text-foreground px-3 py-1.5 rounded-full text-xs font-medium'>
                          <MapPin className='h-3 w-3 text-primary' />
                          <span>{route.region.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Route Details */}
                    <div className='p-5 flex flex-col'>
                      <div className='flex flex-wrap gap-1 items-center justify-center sm:justify-between mb-4'>
                        <h2 className='text-lg text-center sm:text-xl font-bold'>
                          Информация о маршруте
                        </h2>
                        <div className='hidden sm:flex gap-1 text-sm sm:text-xl ml-auto font-bold text-primary'>
                          <span>{route.price}</span>
                          <span>₽</span>
                        </div>
                      </div>

                      <div className='text-md sm:text-base flex flex-wrap justify-center sm:justify-start items-center gap-1 font-medium'>
                        <span className='self-center leading-4'>
                          {route.departureCity?.name}
                        </span>
                        {route.departureCity?.description && (
                          <span className='leading-4 text-muted-foreground self-end text-xs'>
                            ({route.departureCity.description})
                          </span>
                        )}

                        <ArrowRightLeft className='self-center min-w-4 min-h-4 size-4' />

                        <span className='self-center leading-4'>
                          {route.arrivalCity?.name}
                        </span>
                        {route.arrivalCity?.description && (
                          <span className='leading-4 text-muted-foreground self-end text-xs'>
                            ({route.arrivalCity.description})
                          </span>
                        )}
                      </div>
                      <div className='sm:hidden mt-1 flex gap-1 text-2xl mx-auto font-bold text-primary'>
                        <span>{route.price}</span>
                        <span>₽</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {schedules.length !== 0 && (
              <div className='border-b'>
                <BusRouteSchedule
                  className='border-0 rounded-none'
                  departureCityName={route?.departureCity?.name || ''}
                  arrivalCityName={route?.arrivalCity?.name || ''}
                  schedules={schedules}
                  routeId={route?.id}
                />
              </div>
            )}

            <div className='sm:px-5 sm:p-4 pt-5 p-3 space-y-4 border-b'>
              <p className='text-center sm:text-start text-sm text-muted-foreground'>
                Введите информацию для оформления бронирования.
              </p>
              <div className='sm:grid sm:grid-cols-[repeat(auto-fill,_minmax(17rem,_1fr))] space-y-5 sm:space-y-0 sm:gap-y-4 sm:gap-x-2'>
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
                              const capitalizeFirstChars = (value: string) => {
                                const words = value.split(' ');
                                const capitalizedWorlds = words
                                  .map(w =>
                                    w
                                      .replace(
                                        /^./,
                                        (w.at(0) as string)?.toUpperCase(),
                                      )
                                      .replace(/\d/gi, ''),
                                  )

                                  .join(' ');
                                return capitalizedWorlds;
                              };

                              onChange(capitalizeFirstChars(e.target.value));
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
                              const capitalizeFirstChars = (value: string) => {
                                const words = value.split(' ');
                                const capitalizedWorlds = words
                                  .map(w =>
                                    w
                                      .replace(
                                        /^./,
                                        (w.at(0) as string)?.toUpperCase(),
                                      )
                                      .replace(/\d/gi, ''),
                                  )
                                  .join(' ');
                                return capitalizedWorlds;
                              };

                              onChange(capitalizeFirstChars(e.target.value));
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
            </div>
            <div className='p-4 sm:px-5 space-y-4'>
              <div className='sm:grid sm:grid-cols-[repeat(auto-fill,_minmax(17rem,_1fr))] gap-1 gap-y-2'>
                <FormButton
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto col-start-1 col-end-2`}
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
            <BorderBeam className='border rounded-xl' />
          </div>
        </form>
      </Form>
    </div>
  );
};

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

    const isAllowed = (values: { floatValue?: number }) => {
      const { floatValue } = values;

      return floatValue === undefined || (floatValue >= 1 && floatValue <= 20);
    };

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
              displayType="text"
              getInputRef={ref}
              value={value || 0}
              className={cn(
                'focus:outline-none focus:ring-1 focus:ring-ring',
                'text-3xl sm:text-4xl font-bold tracking-tighter text-center bg-background w-full',
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

interface BusRouteScheduleProps {
  schedules: ScheduleItem[];
  departureCityName: string;
  arrivalCityName: string;
  className?: string;
  routeId?: string;
}

export const BusRouteSchedule: FC<BusRouteScheduleProps> = ({
  schedules,
  departureCityName,
  arrivalCityName,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (schedules.length === 0) {
    return null;
  }

  // Group schedules by direction
  const forwardSchedules = [
    ...schedules.filter(s => s.direction === RouteDirection.Forward),
  ].sort((a, b) => (a.time > b.time ? 1 : -1));

  const backwardSchedules = [
    ...schedules.filter(s => s.direction === RouteDirection.Backward),
  ].sort((a, b) => (a.time > b.time ? 1 : -1));

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <div
        className='p-2.5 sm:p-3 flex justify-between items-center cursor-pointer hover:bg-muted/30 transition-colors'
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className='flex items-center gap-2 sm:gap-3'>
          <div className='size-7 sm:size-8 rounded-full bg-primary/10 flex items-center justify-center'>
            <Clock className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary' />
          </div>

          <div>
            <h4 className='text-sm font-medium'>Расписание рейсов</h4>
          </div>
        </div>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-7 w-7 sm:h-8 sm:w-8 p-0'
        >
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300',
              isOpen && 'transform rotate-180',
            )}
          />
        </Button>
      </div>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className='p-0'>
          <Tabs defaultValue={RouteDirection.Forward} className='w-full'>
            <div className='border-b p-2'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger
                  value={RouteDirection.Forward}
                  className='flex items-center gap-1'
                >
                  <ArrowDown className='h-3 w-3 rotate-45' />
                  <span className='hidden xs:inline'>Прямое направление</span>
                  <span className='xs:hidden'>Прямое</span>
                </TabsTrigger>
                <TabsTrigger
                  value={RouteDirection.Backward}
                  className='flex items-center gap-1'
                >
                  <ArrowUp className='h-3 w-3 rotate-45' />
                  <span className='hidden xs:inline'>Обратное направление</span>
                  <span className='xs:hidden'>Обратное</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={RouteDirection.Forward}>
              <RouteStopsList
                routeName={`${departureCityName} - ${arrivalCityName}`}
                stops={forwardSchedules}
              />
            </TabsContent>

            <TabsContent value={RouteDirection.Backward}>
              <RouteStopsList
                routeName={`${arrivalCityName} - ${departureCityName}`}
                stops={backwardSchedules}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Add the RouteStopsList component
interface RouteStopsListProps {
  routeName: string;
  stops: ScheduleItem[];
}

const RouteStopsList: FC<RouteStopsListProps> = ({ stops }) => {
  if (stops.length === 0) {
    return (
      <div className='p-6 text-center text-muted-foreground'>
        Расписание не найдено
      </div>
    );
  }

  return (
    <div className='p-3 py-1 sm:p-4 sm:py-1'>
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
interface RouteStopProps {
  time: string;
  location: string;
  details?: string | null;
  isActive?: boolean;
  isCurrentStop?: boolean;
}

const RouteStop: FC<RouteStopProps> = ({
  time,
  location,
  details,
  isActive = true,
  isCurrentStop = false,
}) => {
  return (
    <div className='flex items-start gap-3 py-2'>
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

export default BookingBusPage;
