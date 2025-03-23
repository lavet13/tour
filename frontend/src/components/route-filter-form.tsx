import { FC, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ComboBox } from '@/components/combo-box';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  useArrivalCities,
  useDepartureCities,
} from '@/features/city/api/queries';
import { Button } from '@/components/ui/button';
import { Filter, FilterX } from 'lucide-react';
import { DrawerHeader, DrawerTitle } from './ui/drawer';
import { Separator } from './ui/separator';

// Define form schema
const FormSchema = z.object({
  departureCityId: z
    .string({
      invalid_type_error: 'Выберите город отправления!',
    })
    .cuid2({ message: 'Выберите город отправления!' })
    .optional(),
  arrivalCityId: z
    .string({
      invalid_type_error: 'Выберите город прибытия!',
    })
    .cuid2({ message: 'Выберите город прибытия!' })
    .optional(),
});

type FormValues = z.infer<typeof FormSchema>;

const defaultValues: FormValues = {
  departureCityId: '',
  arrivalCityId: '',
};

interface RouteFilterForm {}

const RouteFilterForm: FC<RouteFilterForm> = () => {
  // Get and set URL search params
  const [searchParams, setSearchParams] = useSearchParams();

  const initialValues = useMemo<FormValues>(() => {
    const departureCityId = searchParams.get('departureCityId') || '';
    const arrivalCityId = searchParams.get('arrivalCityId') || '';

    return {
      departureCityId,
      arrivalCityId,
    };
  }, [searchParams]);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    values: initialValues,
    defaultValues,
    mode: 'onChange',
  });

  // Load initial values from URL on mount
  useEffect(() => {
    const departureCityId = searchParams.get('departureCityId') || '';
    const arrivalCityId = searchParams.get('arrivalCityId') || '';

    if (departureCityId || arrivalCityId) {
      form.reset({ departureCityId, arrivalCityId });
    }
  }, []);

  // Add URL sync helper
  const updateUrlParams = (data: FormValues) => {
    const params = new URLSearchParams(searchParams);

    if (data.departureCityId) {
      params.set('departureCityId', data.departureCityId);
    }

    if (data.arrivalCityId) {
      params.set('arrivalCityId', data.arrivalCityId);
    }

    setSearchParams(params);
  };

  const values = form.getValues();

  // Handle form changes
  const handleFormChange = (field: keyof FormValues, value: string) => {
    form.setValue(field, value);

    // If changing departure, reset arrival
    if (field === 'departureCityId') {
      form.setValue('arrivalCityId', '');
    }

    // Update URL with current form data
    const currentValues = {
      ...form.getValues(),
      [field]: value,
      ...(field === 'departureCityId' ? { arrivalCityId: '' } : {}),
    };

    updateUrlParams(currentValues);
  };

  // departureCities
  const { data: departureData, isPending: departureIsPending } =
    useDepartureCities();
  const departureCities = departureData?.departureCities || [];

  // arrivalCities
  const {
    data: arrivalData,
    isPending: arrivalIsPending,
    fetchStatus: arrivalFetchStatus,
  } = useArrivalCities(values.departureCityId ?? '', {
    enabled: !!values.departureCityId,
  });

  const arrivalIsLoading =
    arrivalFetchStatus === 'fetching' && arrivalIsPending;
  const arrivalCities = arrivalData?.arrivalCities || [];

  const onSubmit: SubmitHandler<FormValues> = async data => {
    console.log('submitted: ', { data });
  };

  // Clear filters and URL params
  const handleClearFilters = () => {
    form.reset(defaultValues);
    setSearchParams(params => {
      const query = new URLSearchParams(params.toString());

      query.delete('departureCityId');
      query.delete('arrivalCityId');
      query.delete('filter');

      return query;
    });
  };

  return (
    <>
      <DrawerHeader className='pt-4 pb-2 md:pt-4 md:pb-2 md:px-5 flex flex-wrap items-center gap-2'>
        <DrawerTitle className='flex-1'>
          <span className='flex items-center justify-center flex-wrap gap-2'>
            Фильтры
          </span>
        </DrawerTitle>
      </DrawerHeader>
      <Separator className='mt-2 mb-4' />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full sm:max-w-screen-sm space-y-6 mx-auto pb-3'
        >
          <div className='space-y-2'>
            <div className='flex justify-center sm:grid sm:grid-cols-[repeat(auto-fit,_minmax(14rem,_1fr))] space-y-3 sm:space-y-0 sm:gap-y-4 sm:gap-x-2 px-4 sm:px-5'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='w-full sm:w-auto justify-self-end col-start-2 h-7'
                onClick={handleClearFilters}
              >
                <FilterX />
                Очистить фильтр
              </Button>
            </div>
            <div className='sm:grid sm:grid-cols-[repeat(auto-fit,_minmax(14rem,_1fr))] space-y-3 sm:space-y-0 sm:gap-y-4 sm:gap-x-2 px-4 sm:px-5'>
              <FormField
                control={form.control}
                name='departureCityId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Город отправления</FormLabel>
                    <FormControl>
                      <ComboBox
                        inputPlaceholder='Искать город...'
                        emptyLabel='Не найдено городов'
                        label='Выберите откуда'
                        isLoading={departureIsPending}
                        items={departureCities}
                        value={field.value}
                        onValueChange={value =>
                          handleFormChange('departureCityId', value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='arrivalCityId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Город прибытия</FormLabel>
                    <FormControl>
                      <ComboBox
                        inputPlaceholder='Искать город...'
                        emptyLabel='Не найдено городов'
                        label='Выберите куда'
                        isLoading={arrivalIsLoading}
                        items={arrivalCities}
                        disabled={!form.watch('departureCityId')}
                        value={field.value}
                        onValueChange={value =>
                          handleFormChange('arrivalCityId', value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

export default RouteFilterForm;
