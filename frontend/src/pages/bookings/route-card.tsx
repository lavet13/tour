import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeftRight, ArrowRight, Calendar, MapPin } from 'lucide-react';
import { LazyImageWrapper } from '@/components/lazy-image';
import { formatDate } from '@/lib/utils';
import { Route } from '@/pages/bookings/types';
import { useMemo } from 'react';
import { PonyfillFile } from '@/types/file-types';
import { Image } from '@/features/routes/components/route-gallery';
import { Buffer } from 'buffer';
import { Link } from 'react-router-dom';

type RouteCardProps = {
  route: Route;
};

export function RouteCard({ route }: RouteCardProps) {
  // Generate a placeholder image URL if no photo is available
  const photo: Image | null = useMemo(() => {
    if (!route?.photo) return null;
    const { name, lastModified, type, encoding, _size, blobParts } =
      route.photo as PonyfillFile;
    const buffer = Buffer.from(blobParts);
    const image = new Blob([buffer], { type });
    const imageUrl = URL.createObjectURL(image);

    return {
      name,
      type,
      encoding,
      _size,
      imageUrl,
      buffer,
      lastModified,
    };
  }, [route]);

  return (
    <Card className='relative flex flex-col overflow-hidden h-full transition-all hover:shadow-md'>
      <div className='relative h-40 w-full overflow-hidden bg-muted'>
        <LazyImageWrapper
          src={photo ? photo.imageUrl : '/placeholder.svg'}
          fallbackSrc={'/placeholder.svg'}
          alt={`Route from ${route.departureCity?.name} to ${route.arrivalCity?.name}`}
          // className='object-cover'
          className='basis-2'
        />
        {/* {route.isActive ? ( */}
        {/*   <div className='absolute right-2 top-2'> */}
        {/*     <Badge variant='default' className='font-medium'> */}
        {/*       Активный */}
        {/*     </Badge> */}
        {/*   </div> */}
        {/* ) : ( */}
        {/*   <div className='absolute right-2 top-2'> */}
        {/*     <Badge variant='destructive' className='font-medium'> */}
        {/*       Неактивный */}
        {/*     </Badge> */}
        {/*   </div> */}
        {/* )} */}
      </div>

      <CardContent className='flex-1 flex flex-col p-4'>
        <div className='flex items-center gap-1 text-sm text-muted-foreground mb-2'>
          <MapPin className='h-3.5 w-3.5' />
          <span>{route.region?.name}</span>
          <Link
            title={`${route.region?.name} - ${route.departureCity?.name} ${route.arrivalCity?.name}`}
            to={`/booking-bus?departureCityId=${route.departureCity?.id}&arrivalCityId=${route.arrivalCity?.id}`}
            className={'absolute inset-0'}
          >
            <span className='sr-only'>
              {route.region?.name} - {route.departureCity?.name}{' '}
              {route.arrivalCity?.name}
            </span>
          </Link>
        </div>

        <div className='flex items-center justify-between mb-3'>
          <div className='flex flex-wrap items-center gap-2 text-base font-medium'>
            <div>{route.departureCity?.name}</div>
            <ArrowLeftRight className='h-3.5 w-3.5 text-muted-foreground' />
            <div>{route.arrivalCity?.name}</div>
          </div>
        </div>

        <Separator className='my-3 mt-auto' />

        <div className='flex items-center justify-between'>
          <div className='text-lg font-bold'>{route.price} ₽</div>

          {/* {route.departureDate && ( */}
          {/*   <div className='flex items-center gap-1 text-xs text-muted-foreground'> */}
          {/*     <Calendar className='h-3.5 w-3.5' /> */}
          {/*     <span>{formatDate(new Date(route.departureDate))}</span> */}
          {/*   </div> */}
          {/* )} */}
        </div>
      </CardContent>
    </Card>
  );
}
