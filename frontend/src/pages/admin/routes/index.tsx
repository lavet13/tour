import { SonnerSpinner } from '@/components/sonner-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
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
import { Suspense, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useImage } from 'react-image';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';

type Route = InfiniteRoutesQuery['routes']['edges'][number];

function RoutesPage() {
  const { state } = useSidebar();
  const [{ md }] = useAtom(breakpointsAtom);
  const isTablet = useMediaQuery(`(min-width: ${md}px)`);

  const [innerWidth, setInnerWidth] = useState(0);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add');

  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const isStaleSearchQuery = searchQuery !== deferredSearchQuery;

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
  const filteredData = flatData.filter(
    route =>
      route.departureCity?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.arrivalCity?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  console.log({ filteredData });

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
      <div className='flex items-center'>
        <Input
          className='max-w-[300px]'
          placeholder='Найти маршрут...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      <div className='sm:grid flex flex-col sm:grid-cols-[repeat(auto-fill,_minmax(20rem,_1fr))] gap-4 pb-2'>
        {filteredData.length !== 0 &&
          filteredData.map(route => (
            <RouteCard
              key={route.id}
              route={route}
              onEdit={handleEditRoute}
              onDelete={handleDeleteRoute}
            />
          ))}
      </div>
      {filteredData.length === 0 && (
        <p className='text-center text-sm text-muted-foreground'>
          Не найдено подходящего маршрута.
        </p>
      )}
      <Drawer
        repositionInputs
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {drawerMode === 'add'
                ? 'Добавить новый маршрут'
                : 'Изменить маршрут'}
            </DrawerTitle>
          </DrawerHeader>
          <div className='p-4'></div>
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
  const MOBILE_BREAKPOINT = 340;
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);

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
            <Tooltip delayDuration={700}>
              <TooltipTrigger asChild>
                <Button
                  className='shrink-0 w-9 h-9'
                  variant='outline'
                  size='icon'
                  asChild
                >
                  <Link to={`/admin/schedules?id=${route.id}`}>
                    <CalendarClock />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Расписание</TooltipContent>
            </Tooltip>
            <div className='flex space-x-2'>
              {isMobile && (
                <Tooltip delayDuration={700}>
                  <TooltipTrigger asChild>
                    <Button
                      className='size-9 gap-0'
                      variant='outline'
                      size='icon'
                      onClick={onEdit}
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Изменить</TooltipContent>
                </Tooltip>
              )}
              {!isMobile && (
                <Button
                  className='gap-0'
                  variant='outline'
                  size='sm'
                  onClick={onEdit}
                >
                  <Edit className='h-4 w-4 mr-2' />
                  Изменить
                </Button>
              )}
              {isMobile && (
                <Tooltip delayDuration={700}>
                  <TooltipTrigger asChild>
                    <Button
                      className='size-9 gap-0 border border-destructive/20 text-destructive hover:bg-destructive/20 hover:text-destructive focus:ring-destructive focus-visible:ring-destructive'
                      variant='outline'
                      size='sm'
                      onClick={onDelete}
                    >
                      <Trash className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent align='end'>Удалить</TooltipContent>
                </Tooltip>
              )}
              {!isMobile && (
                <Button
                  className='gap-0 border border-destructive/20 text-destructive hover:bg-destructive/20 hover:text-destructive focus:ring-destructive focus-visible:ring-destructive'
                  variant='outline'
                  size='sm'
                  onClick={onDelete}
                >
                  <Trash className='h-4 w-4 mr-2' />
                  Удалить
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RoutesPage;
