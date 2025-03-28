import { FC, useMemo } from 'react';
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
import { FilterX } from 'lucide-react';
import { DrawerDescription, DrawerHeader, DrawerTitle } from './ui/drawer';
import { Separator } from './ui/separator';
import { useRegions } from '@/features/region';

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
  regionId: z
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
  regionId: '',
};

interface RouteFilterForm {
  includeInactiveCities?: boolean;
  includeInactiveRegion?: boolean;
}

const RouteFilterForm: FC<RouteFilterForm> = ({
  includeInactiveCities = true,
  includeInactiveRegion = true,
}) => {
  // Get and set URL search params
  const [searchParams, setSearchParams] = useSearchParams();

  const initialValues = useMemo<FormValues>(() => {
    const departureCityId = searchParams.get('departureCityId') || '';
    const arrivalCityId = searchParams.get('arrivalCityId') || '';
    const regionId = searchParams.get('regionId') || '';

    return {
      departureCityId,
      arrivalCityId,
      regionId,
    };
  }, [searchParams]);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    values: initialValues,
    defaultValues,
    mode: 'onChange',
  });

  // Add URL sync helper
  const updateUrlParams = (data: FormValues) => {
    const params = new URLSearchParams(searchParams);

    if (data.departureCityId) {
      params.set('departureCityId', data.departureCityId);
    } else {
      params.delete('departureCityId');
    }

    if (data.arrivalCityId) {
      params.set('arrivalCityId', data.arrivalCityId);
    } else {
      params.delete('arrivalCityId');
    }

    if (data.regionId || data.regionId === null) {
      params.set('regionId', data.regionId);
    } else {
      params.delete('regionId');
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

    if (field === 'regionId') {
      form.setValue('departureCityId', '');
      form.setValue('arrivalCityId', '');
    }

    // Update URL with current form data
    const currentValues = {
      ...form.getValues(),
      [field]: value,
      ...(field === 'departureCityId' ? { arrivalCityId: '' } : {}),
      ...(field === 'regionId'
        ? { arrivalCityId: '', departureCityId: '' }
        : {}),
    };

    updateUrlParams(currentValues);
  };

  const { data: regionsData, isPending: regionsIsPending } = useRegions();
  const regions = regionsData?.regions ?? [];

  const { data: departureData, isPending: departureIsPending } =
    useDepartureCities({ includeInactiveCities });
  const departureCities = departureData?.departureCities || [];

  const {
    data: arrivalData,
    isPending: arrivalIsPending,
    fetchStatus: arrivalFetchStatus,
  } = useArrivalCities({
    includeInactiveCities,
    cityId: values.departureCityId ?? '',
    options: { enabled: !!values.departureCityId },
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
      query.delete('regionId');

      return query;
    });
  };

  const inactiveRegion = includeInactiveRegion
    ? { id: null, name: 'Маршруты без региона' }
    : null;

  return (
    <>
      <DrawerHeader className='pt-7 pb-2 md:pt-8 md:pb-2 md:px-5 flex flex-wrap items-center gap-2'>
        <DrawerTitle className='flex-1'>
          <span className='flex items-center justify-center sm:justify-start flex-wrap gap-2'>
            Фильтры
          </span>
        </DrawerTitle>
        <DrawerDescription>
          Выберите параметры для фильтрации маршрутов
        </DrawerDescription>
      </DrawerHeader>
      <Separator className='mt-2 mb-4' />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full sm:max-w-screen-sm space-y-6 mx-auto pb-3'
        >
          <div className='space-y-2'>
            <div className='sm:grid sm:grid-cols-[repeat(auto-fit,_minmax(14rem,_1fr))] space-y-3 sm:space-y-0 sm:gap-y-4 sm:gap-x-2 px-4 sm:px-5'>
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
                        items={[
                          { id: '', name: 'Все регионы' },
                          ...regions,
                          inactiveRegion,
                        ].filter(Boolean)}
                        onValueChange={value =>
                          handleFormChange('regionId', value)
                        }
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

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
                        items={[
                          { id: '', name: 'Все города' },
                          ...departureCities,
                        ]}
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
                        items={[
                          { id: '', name: 'Все города' },
                          ...arrivalCities,
                        ]}
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

              <Button
                className='w-full'
                type='button'
                variant='outline'
                size='sm'
                onClick={handleClearFilters}
              >
                <FilterX />
                Сбросить фильтры
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

export default RouteFilterForm;
