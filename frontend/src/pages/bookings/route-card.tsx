import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { LazyImageWrapper } from '@/components/lazy-image';
import type { Route } from '@/pages/bookings/types';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowLeftRight } from 'lucide-react';

type RouteCardProps = {
  route: Route;
};

export function RouteCard({ route }: RouteCardProps) {
  const isAvailable = route.departureDate
    ? new Date(route.departureDate) <= new Date()
    : true;
  const formattedDate = route.departureDate
    ? new Date(route.departureDate).toLocaleDateString('ru-RU')
    : null;

  return (
    <Card
      className={cn(
        'relative overflow-hidden h-full border rounded-xl transition-all duration-200',
        isAvailable
          ? 'hover:border-emerald-500/30 hover:shadow-sm'
          : 'opacity-95',
      )}
    >
      <div className='flex flex-col h-full'>
        {/* Top section with route info */}
        <div className='p-4'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-1.5'>
              <MapPin className='h-3.5 w-3.5 text-primary' />
              <span className='text-xs font-medium'>{route.region?.name}</span>
            </div>

            <div className='text-base font-bold'>{route.price} ₽</div>
          </div>

          {/* Route cities */}
          <div className='flex justify-center flex-wrap gap-2 items-center mb-2'>
            <div>
              <div className='text-base font-medium'>
                {route.departureCity?.name}
              </div>
            </div>

            <ArrowLeftRight className='inline size-5 text-muted-foreground' />

            <div>
              <div className='text-base text-right font-medium'>
                {route.arrivalCity?.name}
              </div>
            </div>
          </div>
        </div>

        {/* Image section */}
        <div className='relative mt-auto overflow-hidden'>
          <LazyImageWrapper
            src={`/uploads/images/${route.photoName}`}
            fallbackSrc={'/placeholder.svg'}
            alt={`Route from ${route.departureCity?.name} to ${route.arrivalCity?.name}`}
            className='object-cover h-48 w-full dark:grayscale-[0.5]'
          />

          {!isAvailable && (
            <div className='absolute inset-0 bg-black/20 flex items-center justify-center'>
              <Badge
                variant='secondary'
                className='text-sm px-4 py-1.5 font-medium bg-background/90 backdrop-blur-[2px]'
              >
                Недоступно
              </Badge>
            </div>
          )}
        </div>

        {/* Bottom status section */}
        <div
          className={cn(
            'p-3 text-sm font-medium',
            isAvailable
              ? 'bg-emerald-500 text-white'
              : 'bg-secondary text-muted-foreground',
          )}
        >
          {isAvailable ? (
            <div className='flex items-center gap-2'>
              <span className='h-2 w-2 rounded-full bg-white animate-pulse'></span>
              <span>Доступно сейчас</span>
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <svg
                className='size-4'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <rect
                  x='3'
                  y='6'
                  width='18'
                  height='15'
                  rx='2'
                  stroke='currentColor'
                  strokeWidth='2'
                />
                <path d='M3 10H21' stroke='currentColor' strokeWidth='2' />
                <path
                  d='M8 3V7'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <path
                  d='M16 3V7'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
              </svg>
              <span>Доступно с {formattedDate}</span>
            </div>
          )}
        </div>
      </div>

      {isAvailable && (
        <Link
          title={`${route.region?.name} - ${route.departureCity?.name} ${route.arrivalCity?.name}`}
          to={`/booking-bus?departureCityId=${route.departureCity?.id}&arrivalCityId=${route.arrivalCity?.id}`}
          className='absolute inset-0 z-10'
          onClick={() => window.scrollTo({ top: 0 })}
        >
          <span className='sr-only'>
            {route.region?.name} - {route.departureCity?.name}{' '}
            {route.arrivalCity?.name}
          </span>
        </Link>
      )}
    </Card>
  );
}
