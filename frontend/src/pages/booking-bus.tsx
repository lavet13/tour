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
  useController,
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
  ArrowDown,
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
import { Textarea } from '@/components/ui/textarea';
import { useCreateBooking } from '@/features/booking/use-create-booking';
import { BookingInput } from '@/gql/graphql';
import ExpandableTextarea from '@/components/expandable-textarea';

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
    .refine(value => value > 0, { message: 'Укажите количество мест!' }),
  travelDate: z.custom<Date | undefined>(
    value => {
      // If the value is undefined, return false
      if (value === undefined) return false;
      // Ensure it's a valid Date object
      if (!(value instanceof Date)) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      value.setHours(0, 0, 0, 0);
      // Validate that the date is today or in the future
      return value >= today;
    },
    {
      message: 'Выберите сегодняшнюю или будущую дату!',
    },
  ),
  commentary: z.string().nullish(),
  arrivalCityId: z
    .string({
      invalid_type_error: 'Выберите город прибытия!',
    })
    .cuid2({ message: 'Неверный формат!' }),
  departureCityId: z
    .string({
      invalid_type_error: 'Выберите город отправления!',
    })
    .cuid2({ message: 'Неверный формат!' }),
});

type DefaultValues = z.infer<typeof FormSchema>;

const defaultValues: DefaultValues = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  seatsCount: 0,
  travelDate: undefined,
  commentary: null,
  arrivalCityId: '',
  departureCityId: '',
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

  useEffect(() => {
    form.setValue('departureCityId', departureCityId);
    form.setValue('arrivalCityId', arrivalCityId);
  }, [departureCityId, arrivalCityId]);

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
        });
      } else if (error instanceof Error) {
        toast.error(error.message, { position: 'bottom-center' });
      }
    }
  };

  const isMobile = useMediaQuery('(max-width: 400px)');

  return (
    <div className='container mt-5 mb-10'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full sm:max-w-screen-sm space-y-6 mx-auto'
        >
          <div className='relative overflow-hidden w-full h-full border rounded-xl'>
            <div className='flex flex-col space-y-3 sm:space-y-3.5 mb-4 p-6 pb-0'>
              <div className='flex flex-col sm:flex-row items-center gap-y-3 sm:gap-y-1 gap-x-2 font-semibold tracking-tight text-xl'>
                <span className='leading-6 text-center'>
                  Бронирование рейса
                </span>
                <div
                  className={cn(
                    'flex items-center gap-2 flex-1 h-5',
                    isMobile && 'flex-col gap-0',
                  )}
                >
                  <Separator orientation={'vertical'} />
                  <span className='leading-5 text-center'>
                    {departureIsPending ? (
                      <Skeleton className='h-6 w-24' />
                    ) : (
                      departureCities.find(
                        city => city.id === departureCityId,
                      )?.name ?? (
                        <span className='text-sm text-muted-foreground'>
                          Город отправления
                        </span>
                      )
                    )}
                  </span>
                  {isMobile ? (
                    <ArrowDown className='size-4 mt-1.5' />
                  ) : (
                    <ArrowRightIcon className='size-4' />
                  )}
                  <span className='leading-5 text-center'>
                    {arrivalIsLoading ? (
                      <Skeleton className='h-6 w-24' />
                    ) : (
                      arrivalCities.find(
                        city => city.id === arrivalCityId,
                      )?.name ?? (
                        <span className='text-sm text-muted-foreground text-center'>
                          Город прибытия
                        </span>
                      )
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className='px-6 p-4 space-y-4 border-y'>
              <p className='text-center sm:text-start text-sm text-muted-foreground'>
                Выберите пункт отправления и назначения
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
                          isLoading={departureIsPending}
                          items={departureCities}
                          onValueChange={value => {
                            onChange(value);
                            form.setValue('arrivalCityId', '', {
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
              </div>
            </div>

            <div className='px-6 p-4 space-y-4 border-b'>
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
                  render={({ field }) => {
                    const { error } = useFormField();
                    return (
                      <FormItem>
                        <FormLabel>Желаемая дата поездки</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                ref={field.ref}
                                variant='outline'
                                className={cn(
                                  'flex w-full',
                                  'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                                  'justify-start text-left font-normal',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                <CalendarIcon className='mr-2 size-4' />
                                {field.value ? (
                                  <span
                                    className={cn(
                                      'font-semibold',
                                      error && 'text-muted-foreground',
                                    )}
                                  >
                                    {format(field.value, 'PPP', {
                                      locale: fnsRU,
                                    })}
                                  </span>
                                ) : (
                                  <span className='whitespace-pre leading-3 text-center'>
                                    Выберите дату поездки
                                  </span>
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
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name='commentary'
                  render={({ field: { value, ...field } }) => (
                    <FormItem className='sm:col-span-2'>
                      <FormLabel>Комментарий(необязательно)</FormLabel>
                      <FormControl>
                        <ExpandableTextarea
                          placeholder='Можете написать что-нибудь...'
                          value={value ?? ''}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className='p-4 px-6 space-y-4'>
              <div className='sm:grid sm:grid-cols-[repeat(auto-fill,_minmax(17rem,_1fr))] gap-1 gap-y-2'>
                <Button
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
                    'Забронировать'
                  )}
                </Button>
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
                        items.length >= 7 && 'h-[calc(14rem)] -mr-px pr-3',
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
                        items.length >= 7 && 'h-[calc(14rem)] -mr-px pr-3',
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
  name: string;
  value?: any;
  onValueChange?: (value: any) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

const Counter = forwardRef<HTMLButtonElement, CounterProps>(
  ({ name, value: valueProp, onValueChange }, ref) => {
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
    });

    const { fieldState: { error } } = useController({ name });

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
