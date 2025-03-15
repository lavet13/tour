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

// Define form schema
const FormSchema = z.object({
  departureCityId: z
    .string({
      invalid_type_error: 'Выберите город отправления!',
    })
    .cuid2({ message: 'Выберите город отправления!' }),
  arrivalCityId: z
    .string({
      invalid_type_error: 'Выберите город прибытия!',
    })
    .cuid2({ message: 'Выберите город прибытия!' }),
});

type FormValues = z.infer<typeof FormSchema>;

const defaultValues: FormValues = {
  departureCityId: '',
  arrivalCityId: '',
};

interface CitySelectionFormProps {}

const CitySelectionForm: FC<CitySelectionFormProps> = () => {
  // Search Params synchronization
  const [searchParams, setSearchParams] = useSearchParams();
  const departureCityId = searchParams.get('departureCityId') || '';
  const arrivalCityId = searchParams.get('arrivalCityId') || '';

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
    mode: 'onChange',
  });

  // departureCities
  const { data: departureData, isPending: departureIsPending } =
    useDepartureCities();
  const departureCities = useMemo(
    () => departureData?.departureCities || [],
    [departureData],
  );

  // arrivalCities
  const {
    data: arrivalData,
    isPending: arrivalIsPending,
    fetchStatus: arrivalFetchStatus,
  } = useArrivalCities(form.watch('departureCityId'), {
    enabled: !!form.watch('departureCityId'),
  });

  const arrivalIsLoading =
    arrivalFetchStatus === 'fetching' && arrivalIsPending;
  const arrivalCities = useMemo(
    () => arrivalData?.arrivalCities || [],
    [arrivalData],
  );

  // New effect to handle URL parameter changes
  useEffect(() => {
    const clearFields = () => {
      form.setValue('departureCityId', '', { shouldValidate: false });
      form.setValue('arrivalCityId', '', { shouldValidate: false });
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());
        query.delete('departureCityId');
        query.delete('arrivalCityId');
        return query;
      });
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
      if (arrivalCityId && arrivalCities.length) {
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
          setSearchParams(params => {
            const query = new URLSearchParams(params.toString());
            query.delete('arrivalCityId');
            return query;
          });
        }
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
    arrivalCities.length,
    form,
    setSearchParams,
  ]);

  const onSubmit: SubmitHandler<FormValues> = async data => {
    console.log('submitted: ', { data });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='w-full sm:max-w-screen-md space-y-6'
      >
        <div className='space-y-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='departureCityId'
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Город отправления</FormLabel>
                  <FormControl>
                    <ComboBox
                      inputPlaceholder='Искать город...'
                      emptyLabel='Не найдено городов'
                      label='Выберите откуда'
                      isLoading={departureIsPending}
                      items={departureCities}
                      onValueChange={value => {
                        onChange(value);
                        // Reset arrival city when departure city changes
                        form.setValue('arrivalCityId', '', {
                          shouldValidate: false,
                        });
                        setSearchParams(params => {
                          const query = new URLSearchParams(params.toString());
                          if (value) {
                            query.set('departureCityId', value);
                          } else {
                            query.delete('departureCityId');
                          }
                          query.delete('arrivalCityId');
                          return query;
                        });
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='arrivalCityId'
              render={({ field: { onChange, ...field } }) => (
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
                      onValueChange={value => {
                        onChange(value);
                        setSearchParams(params => {
                          const query = new URLSearchParams(params.toString());
                          if (value) {
                            query.set('arrivalCityId', value);
                          } else {
                            query.delete('arrivalCityId');
                          }
                          return query;
                        });
                      }}
                      {...field}
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
  );
};

export default CitySelectionForm;
