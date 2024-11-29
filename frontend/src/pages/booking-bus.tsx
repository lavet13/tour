import {
  FC,
  forwardRef,
  SyntheticEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { toast } from 'sonner';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import ru from 'react-phone-number-input/locale/ru.json';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  SubmitHandler,
  useForm,
  useFormContext,
  useFormState,
} from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/phone-input';
import { FileUploader } from '@/components/file-uploader';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import CircularProgress from '@/components/circular-progress';
import { cn } from '@/lib/utils';
import { BorderBeam } from '@/components/ui/border-beam';
import { FormButton } from '@/components/form-button';
import { SonnerSpinner } from '@/components/sonner-spinner';
import { useSearchParams } from 'react-router-dom';
import { useArrivalCities } from '@/features/city/use-arrival-cities';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ArrowRightIcon,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Minus,
  Plus,
} from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDepartureCities } from '@/features/city/use-departure-cities';
import { useControllableState } from '@/hooks/use-controllable-state';
import { useRegionByName } from '@/features/region/use-region-by-name';
import { useRegionForRoute } from '@/features/region/use-region-for-route';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ru as fnsRU } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';

const FormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: 'Имя обязательно к заполнению!' }),
  lastName: z
    .string()
    .trim()
    .min(1, { message: 'Фамилия обязательно к заполнению!' }),
  phoneNumber: z
    .string({ required_error: 'Телефон обязателен к заполнению!' })
    .refine(
      value => isPossiblePhoneNumber(value),
      'Проверьте правильность ввода телефона!',
    ),
  seatsCount: z
    .number({ invalid_type_error: 'Должно быть числом!' })
    .refine(value => value > 0, { message: 'Укажите кол-во мест' }),
  travelDate: z
    .date({
      required_error: 'Желаемая дата поездки обязательна!',
      invalid_type_error: 'Должно быть датой!',
    })
    .refine(
      date => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        date.setHours(0, 0, 0, 0); // Reset time for comparison

        return date >= today;
      },
      {
        message: 'Выберите сегодняшнюю или будущую дату!',
      },
    ),
  arrivalCityId: z
    .number({
      invalid_type_error: 'ID Должно быть числом!',
    })
    .refine(value => value > 0, { message: 'Выберите город прибытия!' }),
  departureCityId: z
    .number({
      invalid_type_error: 'ID Должно быть числом!',
    })
    .refine(value => value > 0, { message: 'Выберите город отправления!' }),
});

type DefaultValues = z.infer<typeof FormSchema>;

const defaultValues: DefaultValues = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  seatsCount: 0,
  travelDate: new Date(),
  arrivalCityId: 0,
  departureCityId: 0,
};

const BookingBusPage: FC = () => {
  const [phoneInputKey, setPhoneInputKey] = useState(0);
  // Search Params syncronization

  const [searchParams, setSearchParams] = useSearchParams();
  const departureCityId = searchParams.get('departureCityId')!;
  const arrivalCityId = searchParams.get('arrivalCityId')!;
  console.log({ departureCityId, arrivalCityId });

  // arrivalCities
  const {
    data: arrivalData,
    isPending: arrivalIsPending,
    fetchStatus: arrivalFetchStatus,
  } = useArrivalCities(departureCityId, {
    enabled: !!departureCityId,
  });
  const arrivalIsLoading =
    arrivalFetchStatus === 'fetching' && arrivalIsPending;
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

  const form = useForm<DefaultValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      ...defaultValues,
      departureCityId: Number(departureCityId),
      arrivalCityId: Number(arrivalCityId),
    },
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

  useEffect(() => {
    form.setValue('departureCityId', Number(departureCityId));
    form.setValue('arrivalCityId', Number(arrivalCityId));
  }, [departureCityId, arrivalCityId]);

  const onSubmit: SubmitHandler<DefaultValues> = async data => {
    try {
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
        });
      } else if (error instanceof Error) {
        toast.error(error.message, { position: 'bottom-center' });
      }
    }
  };

  return (
    <div className='container mt-5 mb-10'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full sm:max-w-screen-sm space-y-6 mx-auto'
        >
          <div className='relative overflow-hidden w-full h-full border rounded-xl p-6'>
            <div className='flex flex-col space-y-1.5 mb-6'>
              <div className='flex flex-col sm:flex-row items-center gap-y-1 gap-x-2 font-semibold tracking-tight text-xl'>
                <span>Бронирование рейса</span>
                <div className='flex items-center gap-2 flex-1'>
                  <Separator
                    className='hidden sm:block h-7'
                    orientation={'vertical'}
                  />
                  <span>
                    {departureIsPending ? (
                      <Skeleton className='h-6 w-24' />
                    ) : (
                      departureCities.find(
                        city => city.id === values.departureCityId,
                      )?.name ?? (
                        <span className='text-sm opacity-50 uppercase'>
                          город отправления
                        </span>
                      )
                    )}
                  </span>
                  <ArrowRightIcon className='size-4' />
                  <span>
                    {arrivalIsLoading ? (
                      <Skeleton className='h-6 w-24' />
                    ) : (
                      arrivalCities.find(
                        city => city.id === values.arrivalCityId,
                      )?.name ?? (
                        <span className='text-sm opacity-50 uppercase'>
                          город прибытия
                        </span>
                      )
                    )}
                  </span>
                </div>
              </div>
              <p className='text-center sm:text-start text-sm text-muted-foreground'>
                Введите информацию для оформления бронирования.
              </p>
            </div>

            <div className='space-y-4'>
              <div className='sm:grid sm:grid-cols-[repeat(auto-fill,_minmax(17rem,_1fr))] space-y-3 sm:space-y-0 sm:gap-y-4 sm:gap-x-2'>
                <FormField
                  control={form.control}
                  name='departureCityId'
                  render={({ field: { onChange, ...field } }) => {
                    return (
                      <FormItem>
                        <FormLabel>Город отправления</FormLabel>
                        <ComboBox
                          isLoading={departureIsPending}
                          items={departureCities}
                          onValueChange={value => {
                            onChange(value);
                            form.setValue('arrivalCityId', 0, {
                              shouldValidate: false,
                            });
                            setSearchParams(params => {
                              console.log({ params });
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
                          isLoading={arrivalIsLoading}
                          items={arrivalCities}
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
                                    w.replace(
                                      /^./,
                                      (w.at(0) as string)?.toUpperCase(),
                                    ),
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
                                    w.replace(
                                      /^./,
                                      (w.at(0) as string)?.toUpperCase(),
                                    ),
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Желаемая дата поездки</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              ref={field.ref}
                              variant='outline'
                              className={cn(
                                'transfor-gpu transition-all ease-out',
                                'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                                'w-[280px] justify-start text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              <CalendarIcon className='mr-2 size-4' />
                              {field.value ? (
                                format(field.value, 'PPP', { locale: fnsRU })
                              ) : (
                                <span>Выберите дату поездки</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0'>
                          <Calendar
                            locale={fnsRU}
                            mode='single'
                            selected={field.value}
                            onSelect={date => field.onChange(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='seatsCount'
                  render={({ field: { onChange, ...field } }) => {
                    return (
                      <FormItem className='sm:col-span-2'>
                        <FormLabel>Количество мест</FormLabel>
                        <Counter onValueChange={onChange} {...field} />
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div className='sm:grid sm:grid-cols-[repeat(auto-fill,_minmax(17rem,_1fr))] gap-1 gap-y-2'>
                <FormButton
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto col-start-1 col-end-2`}
                  type='submit'
                >
                  {isSubmitting ? (
                    <>
                      <SonnerSpinner />
                      Пожалуйста подождите
                    </>
                  ) : (
                    'Зарегестрировать'
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

interface ComboBoxProps {
  value?: any;
  onValueChange?: (value: any) => void;
  isLoading?: boolean;
  items: any[];
  onBlur?: () => void;
  disabled?: boolean;
}

const ComboBox = forwardRef<HTMLButtonElement, ComboBoxProps>(
  (
    {
      value: valueProp,
      onValueChange,
      items,
      isLoading,
      disabled,
    }: ComboBoxProps,
    ref,
  ) => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
    });

    const { error } = useFormField();

    const [open, setOpen] = useState(false);

    const handleItemSelect = (item: any) => {
      setValue(item.id);
      setOpen(false); // Close the popover or drawer
    };

    return (
      <>
        {isDesktop ? (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  ref={ref}
                  variant='outline'
                  role='combobox'
                  disabled={isLoading || disabled}
                  className={cn(
                    'flex w-full justify-between',
                    'transfor-gpu transition-all ease-out',
                    'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    !value && 'text-muted-foreground',
                  )}
                >
                  {isLoading ? (
                    <div className='w-full select-none flex justify-between items-center gap-2'>
                      Загрузка городов...
                      <SonnerSpinner className='bg-foreground' />
                    </div>
                  ) : value ? (
                    items.find(item => item.id === value)?.name ||
                    'Выберите куда'
                  ) : (
                    'Выберите куда'
                  )}
                  {!isLoading && (
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  )}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className='p-0'>
              <Command>
                <CommandInput placeholder='Искать город...' />
                <CommandList>
                  <CommandEmpty>Не найдено городов</CommandEmpty>
                  <CommandGroup>
                    <ScrollArea
                      className={cn(
                        items.length >= 7 && 'h-[calc(14rem)] pr-2.5',
                      )}
                    >
                      {items.map(item => (
                        <CommandItem
                          key={item.id}
                          onSelect={() => handleItemSelect(item)}
                        >
                          {item.name}
                          <Check
                            className={cn(
                              'ml-auto',
                              item.id === value ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                        </CommandItem>
                      ))}
                    </ScrollArea>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        ) : (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button
                ref={ref}
                variant='outline'
                role='combobox'
                disabled={isLoading || disabled}
                className={cn(
                  'flex w-full justify-between',
                  'transform-gpu transition-all ease-out',
                  'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  !value && 'text-muted-foreground',
                )}
              >
                {isLoading ? (
                  <div className='w-full select-none flex justify-between items-center gap-2'>
                    Загрузка городов...
                    <SonnerSpinner className='bg-foreground' />
                  </div>
                ) : value ? (
                  items.find(item => item.id === value)?.name || 'Выберите куда'
                ) : (
                  'Выберите куда'
                )}
                {!isLoading && (
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <Command>
                <CommandInput placeholder='Искать город...' />
                <CommandList>
                  <CommandEmpty>Не найдено городов</CommandEmpty>
                  <CommandGroup>
                    <ScrollArea
                      className={cn(
                        items.length >= 7 && 'h-[calc(14rem)] pr-2.5',
                      )}
                    >
                      {items.map(item => (
                        <CommandItem
                          key={item.id}
                          onSelect={() => handleItemSelect(item)}
                        >
                          {item.name}
                          <Check
                            className={cn(
                              'ml-auto',
                              item.id === value ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                        </CommandItem>
                      ))}
                    </ScrollArea>
                  </CommandGroup>
                </CommandList>
              </Command>
            </DrawerContent>
          </Drawer>
        )}
      </>
    );
  },
);

interface CounterProps {
  value?: any;
  onValueChange?: (value: any) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

const Counter = forwardRef<HTMLButtonElement, CounterProps>(
  ({ value: valueProp, onValueChange }, ref) => {
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
    });

    const { error } = useFormField();

    return (
      <div
        className={cn(
          'flex items-center justify-center space-x-2',
          value === 0 && 'text-muted-foreground',
        )}
      >
        <Button
          variant='outline'
          size='icon'
          className={cn(
            'h-8 w-8 shrink-0 rounded-full',
            'transfor-gpu transition-all ease-out',
            'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          )}
          type='button'
          onClick={() => setValue(value - 1)}
          disabled={value <= 0}
        >
          <Minus />
          <span className='sr-only'>Уменьшить</span>
        </Button>
        <div className='flex-1 text-center'>
          <div
            className={cn(
              'text-4xl font-bold tracking-tighter',
              error && 'text-destructive',
            )}
          >
            {value}
          </div>
          <div
            className={cn(
              'text-[0.70rem] uppercase text-muted-foreground',
              error && 'text-destructive',
            )}
          >
            Кол-во мест
          </div>
        </div>
        <FormControl>
          <Button
            ref={ref}
            variant='outline'
            size='icon'
            className={cn(
              'h-8 w-8 shrink-0 rounded-full',
              'transfor-gpu transition-all ease-out',
              'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            )}
            type='button'
            onClick={() => setValue(value + 1)}
            disabled={value >= 20}
          >
            <Plus />
            <span className='sr-only'>Увеличить</span>
          </Button>
        </FormControl>
      </div>
    );
  },
);

export default BookingBusPage;
