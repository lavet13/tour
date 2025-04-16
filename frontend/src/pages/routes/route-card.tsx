import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRightLeft, Calendar } from 'lucide-react';
import { LazyImageWrapper } from '@/components/lazy-image';
import type { Route } from '@/pages/routes/types';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
        'relative overflow-hidden h-full border transition-all duration-200 flex flex-col',
        isAvailable
          ? 'hover:border-primary/50 hover:shadow-md'
          : 'opacity-90',
      )}
    >
      {/* Image section at the top */}
      <div className="relative overflow-hidden">
        <LazyImageWrapper
          src={route.photoName ? `/uploads/images/${route.photoName}`: `/placeholder.svg`}
          fallbackSrc={'/placeholder.svg'}
          alt={`Route from ${route.departureCity?.name} to ${route.arrivalCity?.name}`}
          className="object-cover w-full h-44 dark:brightness-90"
        />

        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-background/80 dark:bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">{route.region?.name}</span>
        </div>

        <div className="absolute bottom-3 right-3 bg-background/80 dark:bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="font-bold">{route.price} ₽</span>
        </div>

        {!isAvailable && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[1px]">
            <Badge
              variant="secondary"
              className="text-sm px-4 py-1.5 font-medium bg-background/90"
            >
              Недоступно
            </Badge>
          </div>
        )}
      </div>

      {/* Route information */}
      <div className="flex-1 flex flex-col p-4 justify-between">
        {/* Route cities */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-base font-medium">
            {route.departureCity?.name}
          </div>

          <ArrowRightLeft className="inline size-4 text-muted-foreground mx-2" />

          <div className="text-base font-medium">
            {route.arrivalCity?.name}
          </div>
        </div>

        {/* Availability status */}
        <div
          className={cn(
            'mt-2 py-2 px-3 rounded-md text-sm font-medium flex items-center gap-2',
            isAvailable
              ? 'bg-primary/10 text-primary'
              : 'bg-secondary text-muted-foreground',
          )}
        >
          {isAvailable ? (
            <>
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span>Доступно сейчас</span>
            </>
          ) : (
            <>
              <Calendar className="size-4" />
              <span>Доступно с {formattedDate}</span>
            </>
          )}
        </div>
      </div>

      {isAvailable && (
        <Link
          title={`${route.region?.name} - ${route.departureCity?.name} ${route.arrivalCity?.name}`}
          to={`/booking-bus?departureCityId=${route.departureCity?.id}&arrivalCityId=${route.arrivalCity?.id}`}
          className="absolute inset-0 z-10"
          onClick={() => window.scrollTo({ top: 0 })}
        >
          <span className="sr-only">
            {route.region?.name} - {route.departureCity?.name}{' '}
            {route.arrivalCity?.name}
          </span>
        </Link>
      )}
    </Card>
  );
}
