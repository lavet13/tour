import {
  Armchair,
  BadgeRussianRuble,
  Bus,
  Calendar,
  CheckCircle,
  UserRound,
} from 'lucide-react';
import { FC, Fragment } from 'react';
import { useAtom } from 'jotai';
import { createdBookingAtom } from '@/lib/atoms/booking';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const BookingResult: FC = () => {
  const [receivedBooking] = useAtom(createdBookingAtom);
  console.log({ receivedBooking });
  const { createBooking } = receivedBooking || {};
  const {
    route,
    firstName,
    lastName,
    direction,
    seatsCount,
    travelDate,
    phoneNumber,
    telegram,
    status,
  } = createBooking || {};

  let routeName = '';
  if (route?.departureCity && route?.arrivalCity) {
    const isForward = direction === 'FORWARD';
    const isBackward = direction === 'BACKWARD';

    if (isForward) {
      routeName += `${route.departureCity.name} → ${route.arrivalCity.name}`;
    }

    if (isBackward) {
      routeName += `${route.arrivalCity?.name} → ${route.departureCity.name}`;
    }
  }

  const fullName = lastName + ' ' + firstName;

  const bookingDetails = [
    {
      icon: UserRound,
      label: 'Фамилия и имя',
      value: fullName,
    },
    {
      icon: Bus,
      label: 'Маршрут',
      value: routeName,
    },
    {
      icon: BadgeRussianRuble,
      label: 'Цена',
      value: (
        <NumericFormat
          thousandSeparator=' '
          displayType='text'
          value={route?.price}
          suffix=' ₽'
        />
      ),
    },
    {
      icon: Calendar,
      label: 'Дата поездки',
      value: travelDate
        ? format(new Date(travelDate), 'd MMMM yyyy г.', { locale: ru })
        : '',
    },
    {
      icon: Armchair,
      label: 'Количество мест',
      value: seatsCount,
    },
  ];

  return (
    <div className='flex-1'>
      <div className='px-4 p-5 max-w-[500px] md:py-6 md:p-12 flex flex-col mx-auto items-center'>
        <div className='rounded-full bg-foreground p-3 mb-4'>
          <CheckCircle className='h-8 w-8 text-background' />
        </div>
        <h2 className='text-center text-2xl font-bold text-background-700 mb-2'>
          Заявка на поездку успешно отправлена!
        </h2>
        <p className='text-foreground text-center'>
          Ваша заявка успешно получена, в ближайшее время с вами свяжется
          менеджер.
        </p>
      </div>
      <div className='text-md px-4 p-5 md:py-6 md:p-12 border-t border-dashed text-center'>
        По всем вопросам звоните по номеру
        <br />
        <Button
          className='break-words text-md inline-flex p-1.5 w-auto h-auto underline decoration-foreground/20 hover:decoration-foreground'
          variant='link'
          aria-label='Позвонить по номеру +7 949 318-03-04'
          asChild
        >
          <Link rel='nofollow' to='tel:+79493180304'>
            +7(949)318-03-04
          </Link>
        </Button>
        или
        <Button
          className='break-words text-md inline-flex p-1.5 h-auto w-auto underline decoration-foreground/20 hover:decoration-foreground'
          variant='link'
          aria-label='Написать в Telegram'
          asChild
        >
          <Link rel='nofollow' target='_blank' to='https://t.me/+79493180304'>
            напишите в Telegram
          </Link>
        </Button>
      </div>
      <div className='px-4 p-5 md:py-6 md:p-12 flex flex-col items-center border-t border-dashed'>
        <p className='text-foreground text-xl font-bold text-center mb-2'>
          Ваши данные:
        </p>
        <div className='flex flex-col gap-2 container max-w-[300px]'>
          {bookingDetails.map(detail => {
            const IconComponent = detail.icon;

            return (
              <Fragment key={detail.label}>
                <div>
                  <p className='flex items-center gap-1.5 text-foreground font-bold'>
                    <IconComponent className='size-5' />
                    {detail.label}
                  </p>
                  <p className='text-foreground'>{detail.value}</p>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BookingResult;
