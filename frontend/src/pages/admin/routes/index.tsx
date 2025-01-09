import { SonnerSpinner } from '@/components/sonner-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useSidebar } from '@/components/ui/sidebar';
import { useInfiniteRoutes } from '@/features/routes';
import { InfiniteRoutesQuery } from '@/gql/graphql';
import { useMediaQuery } from '@/hooks/use-media-query';
import { breakpointsAtom } from '@/lib/atoms/tailwind';
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import {
  ArrowRight,
  Calendar,
  CalendarClock,
  Edit,
  MapPin,
  Trash,
} from 'lucide-react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useImage } from 'react-image';
import { Link } from 'react-router-dom';

type Route = InfiniteRoutesQuery['routes']['edges'][number];

function RoutesPage() {
  const { state } = useSidebar();
  const [{ md }] = useAtom(breakpointsAtom);
  const isTablet = useMediaQuery(`(min-width: ${md}px)`);
  const [innerWidth, setInnerWidth] = useState(0);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add')

  useEffect(() => {
    const updateViewportSize = () => {
      setInnerWidth(window.innerWidth);
    };

    updateViewportSize();

    window.addEventListener('resize', updateViewportSize);

    return () => {
      window.removeEventListener('resize', updateViewportSize);
    };
  }, []);

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isFetching,
    isPending,
    isError,
    error,
  } = useInfiniteRoutes({
    take: import.meta.env.DEV ? 5 : 30,
  });

  const flatData = useMemo(
    () => data?.pages.flatMap(page => page.routes.edges) ?? [],
    [data],
  );

  const handleEditRoute = () => {
    setDrawerMode('edit');
    setIsDrawerOpen(true);
  };

  const handleDeleteRoute = () => {};

  console.log({ flatData });

  return (
    <div
      className={cn(
        'relative container px-1 sm:px-4 mx-auto overflow-hidden space-y-2 flex-1 pt-2',
        state === 'collapsed' && 'mx-0',
      )}
      style={{
        maxWidth: `calc(${innerWidth - (isTablet && state === 'expanded' ? 256 : 0)}px)`,
      }}
    >
      <div className='sm:grid flex flex-col sm:grid-cols-[repeat(auto-fill,_minmax(18rem,_1fr))] gap-4 pb-2'>
        {flatData.map(route => (
          <RouteCard
            route={route}
            onEdit={handleEditRoute}
            onDelete={handleDeleteRoute}
          />
        ))}
      </div>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {drawerMode === 'add' ? 'Добавить новый маршрут' : 'Изменить маршрут'}
            </DrawerTitle>
          </DrawerHeader>
          <div className='p-4'>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string; // The primary image URL
  fallbackSrc: string; // URL for the fallback image if the primary fails
}

function LazyImage({ src, fallbackSrc, alt, style, ...rest }: LazyImageProps) {
  const { src: loadedSrc } = useImage({
    srcList: [src, fallbackSrc], // Tries `src` first, then `fallbackSrc`
    useSuspense: true, // Suspense for waiting until the image loads
  });

  return (
    <img
      src={loadedSrc}
      alt={alt}
      style={{
        ...style,
        opacity: 1,
        transition: 'opacity 0.3s ease-in-out',
      }}
      {...rest}
    />
  );
}

function LazyImageWrapper({ className, ...props }: LazyImageProps) {
  return (
    <div className='relative h-48 overflow-hidden'>
      <Suspense
        fallback={
          <div
            className='flex items-center justify-center w-full h-full'
            aria-busy='true'
            aria-label='Loading image'
          >
            <SonnerSpinner />
          </div>
        }
      >
        <LazyImage
          className={cn('w-full h-48 object-cover', className)}
          {...props}
        />
      </Suspense>
    </div>
  );
}

function RouteCard({
  route,
  onEdit,
  onDelete,
}: {
  route: Route;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-0 h-full flex flex-col'>
        <LazyImageWrapper
          className='basis-2'
          src='/placeholder.svg'
          fallbackSrc='/placeholder.svg'
          alt='Изображение города'
        />
        <div className='p-4 flex flex-col flex-1 justify-between gap-2'>
          <h2 className='inline items-center gap-2 text-xl font-semibold mb-2'>
            {route.departureCity?.name}{' '}
            <ArrowRight className='inline-block size-4' />{' '}
            {route.arrivalCity?.name}
          </h2>
          <div className='mb-2'>
            <div className='flex items-center text-sm text-muted-foreground mb-2'>
              <MapPin className='mr-1 h-4 w-4' />
              {route.region?.name}
            </div>
            {route.departureDate && (
              <div className='flex items-center text-sm text-muted-foreground mb-2'>
                <Calendar className='mr-1 h-4 w-4' />
                {formatDate(new Date(route.departureDate))}
              </div>
            )}
          </div>
          <div className='flex justify-between space-x-2'>
            <Button
              className='min-w-7 h-9'
              variant='outline'
              size='icon'
              asChild
            >
              <Link to={`/admin/schedules?id=${route.id}`}>
                <CalendarClock />
              </Link>
            </Button>
            <div className='flex space-x-2'>
              <Button
                className='gap-0'
                variant='outline'
                size='sm'
                onClick={onEdit}
              >
                <Edit className='h-4 w-4 mr-2' />
                Изменить
              </Button>
              <Button
                className='gap-0 border border-destructive/20 text-destructive hover:bg-destructive/20 hover:text-destructive focus:ring-destructive focus-visible:ring-destructive'
                variant='outline'
                size='sm'
                onClick={onDelete}
              >
                <Trash className='h-4 w-4 mr-2' />
                Удалить
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RoutesPage;
