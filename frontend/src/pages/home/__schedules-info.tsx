import { SonnerSpinner } from '@/components/sonner-spinner';
import { Button } from '@/components/ui/button';
import { GetRouteByIdsQuery, GetSchedulesByIdsQuery } from '@/gql/graphql';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRightLeft,
  ChevronDown,
  MapPin,
  Minus,
  Plus,
  X,
} from 'lucide-react';
import { FC, forwardRef, Fragment, useMemo, useState } from 'react';
import { DefaultValues } from '@/pages/home';
import {
  useController,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { useRouteByIds } from '@/features/routes';
import { keepPreviousData } from '@tanstack/react-query';
import { useSchedulesByIds } from '@/features/schedule';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/date-picker';
import { useControllableState } from '@/hooks/use-controllable-state';
import { NumericFormat } from 'react-number-format';
import ru from 'react-phone-number-input/locale/ru.json';
import { useAtom } from 'jotai';
import { activeStepAtom, containerRefAtom } from '@/lib/atoms/ui';
import { isPossiblePhoneNumber } from 'react-phone-number-input/input';
import { PhoneInput } from '@/components/phone-input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Route = GetRouteByIdsQuery['routeByIds'];
type ScheduleItem = Omit<
  GetSchedulesByIdsQuery['schedulesByIds'][number],
  '__typename'
>;

import {
  useTelegramLogin,
  type TelegramLoginData,
} from '@telegram-login-ultimate/react';
import { toast } from 'sonner';
import { useAuthenticateTelegramLogin, useGetMe } from '@/features/auth';

const SchedulesInfo: FC = () => {
  // Search Params syncronization
  const [searchParams, setSearchParams] = useSearchParams();
  const departureCityId = searchParams.get('departureCityId')!;
  const arrivalCityId = searchParams.get('arrivalCityId')!;
  const { mutateAsync: authenticate, isPending } =
    useAuthenticateTelegramLogin();
  const { refetch: refetchUser } = useGetMe();

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
  console.log({ schedulesIsFetching });

  // Обновим функцию сортировки расписаний, чтобы правильно обрабатывать строковые значения enum
  const schedules = useMemo(() => {
    return schedulesData?.schedulesByIds ?? [];
  }, [schedulesData]);
  console.log({ schedules });

  const form = useFormContext<DefaultValues>();

  // watching
  const [firstTelegramValue, secondTelegramValue] = form.watch([
    'phones.0.telegram',
    'phones.1.telegram',
  ]);
  console.log({ firstTelegramValue, secondTelegramValue });

  // Set up field array for phone numbers
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'phones',
  });

  // Function to swap departure and arrival cities
  const handleSwapCities = () => {
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

  return (
    <>
      {routeIsLoading ? (
        <div className='flex items-center justify-center col-span-full min-h-52'>
          <SonnerSpinner className='bg-foreground' />
        </div>
      ) : route && departureCityId && arrivalCityId ? (
        <div className='flex flex-col'>
          <RouteInfo
            routeIsFetching={routeIsFetching}
            schedulesIsLoading={schedulesIsLoading}
            route={route}
            schedules={schedules}
            handleSwapCities={handleSwapCities}
          />
          <div className='px-4 p-5 md:p-12 border-t border-dashed h-full relative overflow-hidden space-y-4 z-10'>
            <div className='relative z-10'>
              <h2 className='text-2xl md:text-3xl font-bold mb-4 text-center'>
                Укажите свои данные
              </h2>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 relative z-10'>
              <FormField
                control={form.control}
                name='lastName'
                rules={{
                  required: 'Фамилия обязательна к заполнению!',
                  minLength: {
                    value: 4,
                    message: 'Фамилия обязательна к заполнению!',
                  },
                }}
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
                rules={{
                  required: 'Имя обязательно к заполнению!',
                  minLength: {
                    value: 3,
                    message: 'Имя обязательно к заполнению!',
                  },
                }}
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

              {fields.map((_field, index) => {
                return (
                  <Fragment key={_field.id}>
                    <FormField
                      control={form.control}
                      name={`phones.${index}.value`}
                      rules={{
                        required: 'Телефон обязателен к заполнению!',
                        validate: value =>
                          isPossiblePhoneNumber(value) ||
                          'Проверьте правильность ввода телефона!',
                      }}
                      render={({ field }) => {
                        return (
                          <FormItem className='gap-y-0 sm:gap-y-0'>
                            <div className='flex flex-col gap-y-1.5'>
                              <FormLabel className='flex justify-between'>
                                <span>
                                  {index !== 0 ? (
                                    <>Доп. телефон</>
                                  ) : (
                                    <>Телефон</>
                                  )}
                                </span>
                                {index === 0 && (
                                  <Button
                                    onClick={() => {
                                      fields.length < 2 &&
                                        append({
                                          value: '',
                                          telegram: false,
                                          whatsapp: false,
                                        });
                                    }}
                                    type='button'
                                    className='size-fit p-0 m-0 text-xs underline-offset-2'
                                    variant='link'
                                    disabled={fields.length >= 2}
                                  >
                                    Добавить доп. телефон
                                  </Button>
                                )}
                              </FormLabel>

                              <div className='relative'>
                                {index !== 0 && (
                                  <Button
                                    onClick={() => remove(index)}
                                    type='button'
                                    className='absolute -top-2 -right-2 [&_svg]:size-3 size-5 rounded-sm z-[15]'
                                    variant='outline'
                                    size='icon'
                                  >
                                    <X />
                                    <span className='sr-only'>
                                      Удалить телефон
                                    </span>
                                  </Button>
                                )}
                                <FormControl>
                                  <PhoneInput
                                    placeholder='Введите номер телефона'
                                    countries={['RU']}
                                    international
                                    labels={ru}
                                    countryCallingCodeEditable={false}
                                    defaultCountry={'RU'}
                                    {...field}
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </div>

                            <div className='mx-auto inline-flex w-fit gap-2 p-1'>
                              <FormField
                                control={form.control}
                                name={`phones.${index}.telegram`}
                                rules={
                                  index !== 0
                                    ? undefined
                                    : {
                                        required: 'Требуется телеграм',
                                      }
                                }
                                render={function Render({
                                  field: { value, onChange, ...field },
                                }) {
                                  const [open, setOpen] = useState(false);
                                  const [openPopup, { isPending }] =
                                    useTelegramLogin({
                                      botId: import.meta.env
                                        .VITE_TELEGRAM_BOT_ID,
                                      onSuccess: async user => {
                                        console.warn(
                                          'Raw Telegram user data:',
                                          user,
                                        );

                                        // The auth_date should be a Unix timestamp (number of seconds since epoch)
                                        await authenticate({
                                          input: {
                                            id: user.id,
                                            first_name: user.first_name,
                                            last_name: user.last_name,
                                            username: user.username,
                                            photo_url: user.photo_url,
                                            auth_date: user.auth_date * 1000, // Keep as Unix timestamp
                                            hash: user.hash,
                                          },
                                        });
                                        await refetchUser();
                                        setOpen(false);
                                        toast.success(
                                          'Успешный вход через Telegram, бот уведомит вас об бронировании',
                                        );
                                      },
                                      onFail: () => {
                                        setOpen(false);
                                        toast.error(
                                          'Не удалось войти через Telegram',
                                        );
                                      },
                                    });

                                  return (
                                    <>
                                      <AlertDialog
                                        open={open}
                                        onOpenChange={setOpen}
                                      >
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>
                                              Требуется авторизация через
                                              Telegram
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Для уведомлений о доступных местах
                                              и подтверждения бронирования
                                              необходимо войти через Telegram.
                                              Это позволит нам своевременно
                                              информировать вас о статусе вашего
                                              маршрута.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel
                                              onClick={() => {
                                                form.setValue(
                                                  `phones.${index}.telegram`,
                                                  false,
                                                );
                                              }}
                                            >
                                              Отмена
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              disabled={isPending}
                                              onClick={e => {
                                                e.preventDefault();
                                                openPopup();
                                              }}
                                            >
                                              {isPending ? (
                                                <>
                                                  <SonnerSpinner />
                                                  Ожидаем ответ от Telegram
                                                </>
                                              ) : (
                                                <>Войти через Telegram</>
                                              )}
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>

                                      <div className='flex flex-col items-center'>
                                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 px-1'>
                                          <FormControl>
                                            <Checkbox
                                              checked={value}
                                              onCheckedChange={checked => {
                                                onChange(checked);
                                                if (checked === true) {
                                                  setOpen(true);
                                                }
                                              }}
                                              {...field}
                                            />
                                          </FormControl>
                                          <div className='space-y-1 leading-none'>
                                            <FormLabel>Telegram</FormLabel>
                                          </div>
                                        </FormItem>
                                        <FormMessage />
                                      </div>
                                    </>
                                  );
                                }}
                              />

                              <FormField
                                control={form.control}
                                name={`phones.${index}.whatsapp`}
                                render={({
                                  field: { value, onChange, ...field },
                                }) => {
                                  return (
                                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 px-1'>
                                      <FormControl>
                                        <Checkbox
                                          checked={value}
                                          onCheckedChange={onChange}
                                          {...field}
                                        />
                                      </FormControl>
                                      <div className='space-y-1 leading-none'>
                                        <FormLabel>Whatsapp</FormLabel>
                                      </div>
                                    </FormItem>
                                  );
                                }}
                              />
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  </Fragment>
                );
              })}

              <FormField
                control={form.control}
                name='travelDate'
                rules={{
                  required: 'Дата поездки обязательна!',
                  validate: date => {
                    // Ensure date is a valid Date object
                    if (!(date instanceof Date) || isNaN(date.getTime())) {
                      return 'Выберите корректную дату!';
                    }

                    // Reset time to start of the day for consistent comparison
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const selectedDate = new Date(date);
                    selectedDate.setHours(0, 0, 0, 0);

                    // Validate that the date is today or in the future
                    return (
                      selectedDate >= today ||
                      'Выберите сегодняшнюю или будущую дату!'
                    );
                  },
                }}
                render={({ field: { onChange, ...field } }) => {
                  return (
                    <FormItem>
                      <FormLabel>Желаемая дата поездки</FormLabel>
                      <DatePicker
                        label='Выберите дату'
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
                name='seatsCount'
                rules={{
                  validate: value => {
                    return value > 0 || 'Укажите кол-во мест!';
                  },
                }}
                render={({ field: { onChange, ...field } }) => {
                  return (
                    <FormItem className='sm:col-span-2'>
                      <FormLabel className='text-center'>
                        Количество мест
                      </FormLabel>
                      <Counter onValueChange={onChange} {...field} />
                      <FormMessage className='text-center' />
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

type RouteInfoProps = {
  route: NonNullable<Route>;
  schedules: ScheduleItem[];
  handleSwapCities: () => void;
  routeIsFetching: boolean;
  schedulesIsLoading: boolean;
};

function RouteInfo({
  routeIsFetching,
  schedulesIsLoading,
  route,
  schedules,
  handleSwapCities,
}: RouteInfoProps) {
  const [, setActiveStep] = useAtom(activeStepAtom);

  const handleBack = () => {
    setActiveStep(1);
  };

  // Group schedules by direction
  const filteredSchedules = schedules.filter(
    s => s.direction === route.direction,
  );

  return (
    <div className='px-4 p-5 md:p-12 md:pb-2 flex flex-col h-full items-stretch justify-between'>
      <div>
        <div className='grid gap-1 sm:gap-y-4 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 relative mb-4'>
          {routeIsFetching && (
            <div className='absolute left-1/2 -translate-x-1/2 -top-6 lg:top-10 flex justify-center col-span-full'>
              <SonnerSpinner className='bg-foreground' />
            </div>
          )}
          <div className='col-span-full sm:grid sm:grid-cols-2 justify-items-center flex flex-wrap items-center xs:flex-nowrap xs:items-baseline justify-center xs:justify-evenly xs:gap-6 xs:flex-row gap-1 z-10 mb-2'>
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
            <div className='text-center'>
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
            <div className='text-center'>
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
        <div className='flex flex-wrap justify-center items-center gap-2 py-2'>
          <Button
            type='button'
            onClick={handleBack}
            className='flex rounded-full px-6'
            size='sm'
            variant='outline'
          >
            <ArrowLeft />
            Назад
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='rounded-full w-fit px-6'
            onClick={handleSwapCities}
          >
            <ArrowRightLeft className='h-4 w-4 mr-2' />
            <span>Поменять местами</span>
          </Button>
        </div>
      </div>
      {schedulesIsLoading && (
        <div className='py-4 flex justify-center col-span-full'>
          <SonnerSpinner className='bg-foreground' />
        </div>
      )}
      {schedules.length > 0 && (
        <Schedules
          schedules={filteredSchedules}
          departureCityName={route.departureCity?.name}
          arrivalCityName={route.arrivalCity?.name}
        />
      )}
      {false}
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
  const [containerRef] = useAtom(containerRefAtom);

  return (
    <>
      <div
        className={cn(
          'overflow-hidden',
          isOpen ? 'h-auto opacity-100 visible' : 'h-0 opacity-0 invisible',
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
            'sticky bottom-0 left-0 right-0 flex items-center justify-center py-2 z-10',
          )}
        >
          <Button
            type='button'
            className='w-fit gap-1 mx-4 px-4 sm:mx-0 rounded-full'
            onClick={() => {
              setIsOpen(!isOpen);
              if (isOpen) {
                const bounding = containerRef?.current?.getBoundingClientRect();
                const top = bounding?.top ?? 0;

                window.scrollBy({
                  top: top - 60,
                  behavior: 'smooth',
                });
              }
            }}
            variant='outline'
            size='sm'
          >
            {isOpen ? 'Свернуть расписание' : 'Посмотреть расписание'}
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1',
                isOpen && 'transform rotate-180',
              )}
            />
          </Button>
        </div>
      </div>
    </>
  );
}

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

  console.log({ stops });

  return (
    <div className='p-3 pt-1 sm:p-4 sm:pt-1 sm:pl-16'>
      <div className='relative'>
        {/* Vertical line connecting stops */}
        <div className='absolute z-[-10] left-2.5 top-3 bottom-4 w-[1px] bg-border' />

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
            'flex items-center justify-center',
            value === 0 && 'text-muted-foreground',
            'focus:outline-none focus:ring-1 focus:ring-ring',
          )}
        >
          <Button
            variant='outline'
            size='icon'
            className={cn(
              'min-h-10 min-w-12 h-14 w-24 flex-1 sm:flex-none shrink-0 rounded-full',
            )}
            type='button'
            onClick={() => setValue(value - 1)}
            disabled={value <= 1}
            tabIndex={-1}
          >
            <Minus className='h-4 w-4 sm:h-5 sm:w-5' />
            <span className='sr-only'>Уменьшить</span>
          </Button>
          <div className='text-center flex-2 shrink-0 flex-grow sm:flex-none sm:px-6'>
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
            className={cn(
              'min-h-10 min-w-12 h-14 w-24 flex-1 sm:flex-none shrink-0 rounded-full',
            )}
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

export default SchedulesInfo;
