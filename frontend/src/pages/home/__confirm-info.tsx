import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useArrivalCities, useDepartureCities } from '@/features/city';
import { formatRussianDate } from '@/helpers/russian-date';
import { DefaultValues } from '@/pages/home';
import { BadgeInfo, Calendar, MapPin, Phone, User, Users } from 'lucide-react';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

const ConfirmInfo = () => {
  const form = useFormContext<DefaultValues>();
  const values = form.getValues();
  const [searchParams] = useSearchParams();
  const departureCityId = searchParams.get('departureCityId')!;
  const arrivalCityId = searchParams.get('arrivalCityId')!;

  const { data: arrivalData } = useArrivalCities({
    cityId: departureCityId,
    options: { enabled: !!departureCityId },
  });
  const arrivalCities = useMemo(
    () => arrivalData?.arrivalCities || [],
    [arrivalData],
  );

  const { data: departureData } = useDepartureCities();
  const departureCities = useMemo(
    () => departureData?.departureCities || [],
    [departureData],
  );

  const arrivalCity = arrivalCities.find(a => a.id === arrivalCityId);
  const departureCity = departureCities.find(d => d.id === departureCityId);

  let routeName = '';
  if (departureCity && arrivalCity) {
    routeName += `${departureCity.name} → ${arrivalCity.name}`;
  }

  console.log({ routeName });

  return (
    <div className='flex flex-col max-w-[600px] mx-auto gap-2 px-4'>
      <div className='flex items-center gap-3 rounded-full self-center bg-foreground pl-5 p-3 pr-4 mb-4'>
        <BadgeInfo className='shrink-0 h-8 w-8 text-background' />
        <h2 className='text-center text-3xl font-bold text-background leading-none'>
          Ваши введенные данные
        </h2>
      </div>
      {/* Личные данные */}
      <div>
        <div className='flex items-center gap-2 mb-2'>
          <User className='h-5 w-5 text-muted-foreground' />
          <h3 className='text-lg font-semibold'>Личные данные</h3>
        </div>
        <div className='grid grid-cols-2 gap-4 pl-7'>
          <div>
            <p className='text-base text-muted-foreground'>Фамилия</p>
            <p className='font-medium'>{values.lastName || 'Не указано'}</p>
          </div>
          <div>
            <p className='text-base text-muted-foreground'>Имя</p>
            <p className='font-medium'>{values.firstName || 'Не указано'}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Маршрут */}
      <div>
        <div className='flex items-center gap-2 mb-2'>
          <MapPin className='h-5 w-5 text-muted-foreground' />
          <h3 className='text-lg font-semibold'>Маршрут</h3>
        </div>
        <p className='text-base font-medium pl-7'>
          {routeName || 'Маршрут не выбран'}
        </p>
      </div>

      <Separator />

      {/* Дата поездки */}
      <div>
        <div className='flex items-center gap-2 mb-1'>
          <Calendar className='h-5 w-5 text-muted-foreground' />
          <h3 className='text-lg font-semibold'>Дата поездки</h3>
        </div>
        <p className='font-medium pl-7 text-base'>
          {values.travelDate
            ? formatRussianDate(values.travelDate)
            : 'Не указана'}
        </p>
      </div>

      <Separator />

      {/* Количество мест */}
      <div>
        <div className='flex items-center gap-2 mb-2'>
          <Users className='h-5 w-5 text-muted-foreground' />
          <h3 className='text-lg font-semibold'>Количество мест</h3>
        </div>
        <p className='font-medium pl-7 text-base'>
          {values.seatsCount || 0}{' '}
          {values.seatsCount === 1
            ? 'место'
            : values.seatsCount >= 5 || values.seatsCount === 0
              ? 'мест'
              : 'места'}
        </p>
      </div>

      <Separator />

      {/* Контактные номера */}
      <div>
        <div className='flex items-center gap-2 mb-2'>
          <Phone className='h-5 w-5 text-muted-foreground' />
          <h3 className='text-lg font-semibold'>Контактные номера</h3>
        </div>
        <div className='space-y-1.5 pl-7'>
          {values.phones && values.phones.length > 0 ? (
            values.phones.map((phone, index) => (
              <div key={index} className='flex items-center gap-2'>
                <p className='font-medium text-base'>
                  {phone.value || 'Не указан'}
                </p>
                <div className='flex gap-1'>
                  {phone.telegram && (
                    <Badge variant='secondary' className='text-xs'>
                      Telegram
                    </Badge>
                  )}
                  {phone.whatsapp && (
                    <Badge variant='secondary' className='text-xs'>
                      WhatsApp
                    </Badge>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className='text-muted-foreground'>Номера не указаны</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmInfo;
