import { FC, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { DefaultValues } from '@/pages/home';
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ComboBox } from '@/components/combo-box';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useArrivalCities, useDepartureCities } from '@/features/city';

const DepartureArrivalCitiesInfo: FC = () => {
  const { control, watch, setValue, getValues } =
    useFormContext<DefaultValues>();

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

  // New effect to handle URL parameter changes
  useEffect(() => {
    const clearFields = () => {
      setValue('departureCityId', '', { shouldValidate: false });
      setValue('arrivalCityId', '', { shouldValidate: false });
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
      setValue('departureCityId', validDepartureCity.id, {
        shouldValidate: true,
      });

      // If arrival city is present, validate it
      if (arrivalCityId) {
        const validArrivalCity = arrivalCities.find(
          city => city.id === arrivalCityId,
        );

        if (validArrivalCity) {
          setValue('arrivalCityId', validArrivalCity.id, {
            shouldValidate: true,
          });
        } else {
          // Clear invalid arrival city
          setValue('arrivalCityId', '', { shouldValidate: false });
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
        setValue('arrivalCityId', '', { shouldValidate: false });
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
    setSearchParams,
  ]);

  // Function to swap departure and arrival cities
  const handleSwapCities = () => {
    console.log('clicked');
    const departureCityId = getValues('departureCityId');
    const arrivalCityId = getValues('arrivalCityId');

    if (departureCityId && arrivalCityId) {
      setValue('departureCityId', arrivalCityId, { shouldValidate: true });
      setValue('arrivalCityId', departureCityId, { shouldValidate: true });
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());

        query.set('departureCityId', arrivalCityId);
        query.set('arrivalCityId', departureCityId);

        return query;
      });
    }
  };

  return (
    <div className='space-y-4 px-4 p-5 md:pt-6 md:p-12'>
      <h2 className='text-2xl md:text-3xl font-bold mb-4 text-center'>
        Выберите нужный вам маршрут
      </h2>
      <p className='text-muted-foreground text-center mb-8 max-w-2xl mx-auto'>
        Выберите откуда вы хотите поехать и куда
      </p>

      <div className='relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4'>
        <FormField
          control={control}
          name='departureCityId'
          rules={{
            required: 'Выберите город отправления!',
            validate: value => {
              return !!value || 'Выберите город отправления!';
            },
          }}
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
                    setValue('arrivalCityId', '', {
                      shouldValidate: false,
                    });
                    setSearchParams(params => {
                      const query = new URLSearchParams(params.toString());
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
            disabled={!watch('departureCityId') || !watch('arrivalCityId')}
          >
            <ArrowRightLeft className='h-4 w-4' />
            <span className='sr-only'>Поменять города местами</span>
          </Button>
        </div>

        <FormField
          control={control}
          name='arrivalCityId'
          rules={{
            required: 'Выберите город прибытия!',
            validate: value => {
              return !!value || 'Выберите город прибытия!';
            },
          }}
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
                  disabled={!watch('departureCityId')}
                  onValueChange={value => {
                    onChange(value);
                    setSearchParams(params => {
                      const query = new URLSearchParams(params.toString());
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
      <div className='flex justify-center md:hidden'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='rounded-full xs:w-auto w-full'
          onClick={handleSwapCities}
          disabled={!watch('departureCityId') || !watch('arrivalCityId')}
        >
          <ArrowRightLeft className='h-4 w-4 mr-2' />
          <span>Поменять местами</span>
        </Button>
      </div>
    </div>
  );
};

export default DepartureArrivalCitiesInfo;
