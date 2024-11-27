import { FC, forwardRef, SyntheticEvent, useEffect, useMemo, useState } from 'react';

import { toast } from 'sonner';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import ru from 'react-phone-number-input/locale/ru.json';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
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
  arrivalCityId: z
    .number({ required_error: 'Выберите город прибытия!' })
    .refine(value => value > 0, { message: 'Выберите город прибытия!' }),
  departureCityId: z
    .number({ required_error: 'Выберите город отправления!' })
    .refine(value => value > 0, { message: 'Выберите город отправления!' }),
});

type DefaultValues = z.infer<typeof FormSchema>;

const defaultValues: DefaultValues = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  arrivalCityId: 0,
  departureCityId: 0,
};

const BookingBusPage: FC = () => {
  const [open, setOpen] = useState(false);

  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [searchParams, setSearchParams] = useSearchParams();
  const departureCityId = searchParams.get('departureCityId')!;
  const arrivalCityId = searchParams.get('arrivalCityId')!;

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

  const { data: departureData, isPending: departureIsPending } =
    useDepartureCities();

  const departureCities = useMemo(() => departureData?.departureCities || [], [departureData]);

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

  // useEffect(() => {
  //   const subscription = form.watch((value, { name, type }) => {
  //     console.log({ value, name, type });
  //   });
  //
  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, [form.watch, form.trigger]);

  useEffect(() => {
    form.setValue('arrivalCityId', Number(arrivalCityId), {
      shouldValidate: false,
    });
    form.setValue('departureCityId', Number(departureCityId), {
      shouldValidate: false,
    });
  }, [departureCityId, arrivalCityId]);

  const onSubmit: SubmitHandler<DefaultValues> = async data => {
    try {
      form.reset();

      toast.success('Заявка оформлена!', {
        richColors: true,
        position: 'bottom-center',
      });
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
              <h3 className='font-semibold tracking-tight text-xl'>
                Бронирование рейса НАЗВАНИЕ_РЕЙСА
              </h3>
              <p className='text-sm text-muted-foreground'>
                Введите информацию для оформления бронирования.
              </p>
            </div>

            <div className='space-y-4'>
              <div className='sm:grid sm:grid-cols-[repeat(auto-fill,_minmax(17rem,_1fr))] space-y-3 sm:space-y-0 sm:gap-1 sm:gap-y-2'>
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
                            placeholder="Введите номер телефона"
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
                  name='departureCityId'
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Город отправления</FormLabel>
                        <ComboBox
                          isLoading={departureIsPending}
                          setSearchParams={setSearchParams}
                          items={departureCities}
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
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Город прибытия</FormLabel>
                        <ComboBox
                          isLoading={arrivalIsLoading}
                          setSearchParams={setSearchParams}
                          items={arrivalCities}
                          {...field}
                        />
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
  name: string;
  onBlur?: () => void;
  setSearchParams?: (
    updateFn: (params: URLSearchParams) => URLSearchParams,
  ) => void;
}

const ComboBox = forwardRef<HTMLButtonElement, ComboBoxProps>(({
  value: valueProp,
  onValueChange,
  items,
  name,
  isLoading,
  setSearchParams,
}: ComboBoxProps, ref) => {
  const form = useFormContext();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [value] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  });

  const handleItemSelect = (item: any) => {
    form.setValue(name, item.id, {
      shouldValidate: true,
      shouldDirty: true,
    });

    // If setSearchParams is provided, update the searchParams
    if (setSearchParams) {
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());
        query.set(name, item.id); // Set the new search param
        return query;
      });
    }

    setOpen(false); // Close the dropdown or drawer
  };

  const handleFocus = (e: SyntheticEvent) => {
    console.log({ e });

    setOpen(true);
  };

  const [open, setOpen] = useState(false);

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
                disabled={isLoading}
                onFocus={handleFocus}
                className={cn(
                  'flex w-full justify-between',
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
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className='p-0'>
            <Command>
              <CommandInput placeholder='Искать город...' />
              <CommandList>
                <CommandEmpty>Не найдено городов</CommandEmpty>
                <CommandGroup>
                  <ScrollArea
                    className={cn(items.length >= 7 && 'h-[calc(14rem)]')}
                  >
                    {items.map(item => (
                      <CommandItem
                        value={item.name}
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
              disabled={isLoading}
              onFocus={handleFocus}
              className={cn(
                'flex w-full justify-between',
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
                    className={cn(items.length >= 7 && 'h-[calc(14rem)]')}
                  >
                    {items.map(item => (
                      <CommandItem
                        value={item.name}
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
});

export default BookingBusPage;
