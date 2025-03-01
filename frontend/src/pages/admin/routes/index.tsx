import { SonnerSpinner } from '@/components/sonner-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useInfiniteRoutes } from '@/features/routes/api/queries';
import { InfiniteRoutesQuery } from '@/gql/graphql';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  CalendarClock,
  Edit,
  Loader2,
  MapPin,
  MapPinOff,
  MapPinPlus,
  MoveHorizontal,
  TicketCheck,
  TicketX,
  Trash,
} from 'lucide-react';
import { Fragment, Suspense, useDeferredValue, useMemo, useState } from 'react';
import { useImage } from 'react-image';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Waypoint } from 'react-waypoint';
import { Skeleton } from '@/components/ui/skeleton';
import { RouteForm } from '@/features/routes/components';
import { useDrawerState } from '@/hooks/use-drawer-state';
import { Separator } from '@/components/ui/separator';
import { useViewportDimensions } from '@/hooks/use-viewport-dimentions';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Route = InfiniteRoutesQuery['routes']['edges'][number];

function RoutesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('q') ?? '';
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const routeId = searchParams.get('route_id');
  const addRoute = searchParams.get('add_route');

  const { isOpen, mode, setIsOpen, openDrawer } = useDrawerState<
    'idle' | 'addRoute' | 'editRoute'
  >({
    initialMode: 'idle',
    queryParams: {
      addRoute: 'add_route',
      editRoute: 'route_id',
    },
    paramValues: {
      route_id: routeId,
      add_route: addRoute,
    },
  });

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
    query: deferredSearchQuery,
  });

  const flatData = useMemo(
    () => data?.pages.flatMap(page => page.infiniteRoutes.edges) ?? [],
    [data],
  );

  const filteredData = flatData.filter(
    route =>
      route.departureCity?.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      route.arrivalCity?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleClose = () => {
    if (mode === 'editRoute') {
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());
        query.delete('route_id');
        return query;
      });
    } else if (mode === 'addRoute') {
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());
        query.delete('add_route');
        return query;
      });
    }
  };

  const handleAddRoute = () => {
    openDrawer('addRoute');
    setSearchParams(params => {
      const query = new URLSearchParams(params.toString());
      query.set('add_route', 'true');
      return query;
    });
  };

  const handleEditRoute = (id: string) => {
    openDrawer('editRoute');
    setSearchParams(params => {
      const query = new URLSearchParams(params.toString());
      query.set('route_id', id);
      return query;
    });
  };

  const handleDeleteRoute = (id: string) => {
  };

  const MOBILE_BREAKPOINT = 400;
  const { isMobile, contentWidth, sidebarExpanded } =
    useViewportDimensions(MOBILE_BREAKPOINT);

  return (
    <div className='container px-1 sm:px-2 pt-2 mx-auto overflow-hidden flex-1 flex flex-col'>
      <div
        className={cn('relative space-y-2 flex-1', !sidebarExpanded && 'mx-0')}
        style={{
          maxWidth: `calc(${contentWidth}px)`,
        }}
      >
        <div className='flex items-center gap-2'>
          <Tooltip delayDuration={700}>
            <TooltipTrigger asChild>
              <Button
                className={cn('h-10 min-w-10', isMobile && 'h-9 min-w-9')}
                variant='outline'
                size='icon'
                onClick={() => navigate('../home')}
              >
                <ArrowLeft />
                <span className='sr-only'>Назад</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              align={!sidebarExpanded ? 'start' : 'center'}
              side='bottom'
            >
              Вернуться назад
            </TooltipContent>
          </Tooltip>
          <Input
            className={cn('max-w-full sm:max-w-[300px]', isMobile && 'h-9')}
            placeholder='Найти маршрут...'
            value={searchQuery}
            onChange={e => {
              setSearchParams(params => {
                const query = new URLSearchParams(params.toString());

                if (e.target.value.length === 0) {
                  query.delete('q');
                  return query;
                }

                query.set('q', e.target.value);
                return query;
              });
            }}
          />
          {isMobile && (
            <Tooltip delayDuration={700}>
              <TooltipTrigger asChild>
                <Button
                  className='h-9 min-w-9'
                  size={'icon'}
                  onClick={handleAddRoute}
                >
                  <MapPinPlus />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                align={!sidebarExpanded ? 'start' : 'center'}
                side='bottom'
              >
                Добавить маршрут
              </TooltipContent>
            </Tooltip>
          )}
          {!isMobile && (
            <Button onClick={handleAddRoute}>
              <MapPinPlus />
              Добавить маршрут
            </Button>
          )}
        </div>
        <div className='sm:grid flex flex-col sm:grid-cols-[repeat(auto-fill,_minmax(18.5rem,_1fr))] gap-2 pb-2'>
          {isPending &&
            Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonRouteCard key={idx} />
            ))}

          {!isPending && (
            <>
              {filteredData.length !== 0 &&
                filteredData.map((route, idx, routes) => (
                  <Fragment key={route.id}>
                    <RouteCard
                      key={route.id}
                      route={route}
                      onEdit={handleEditRoute}
                      onDelete={handleDeleteRoute}
                    />
                    {idx === routes.length - 1 && (
                      <Waypoint
                        onEnter={() =>
                          !isFetching && hasNextPage && fetchNextPage()
                        }
                      />
                    )}
                  </Fragment>
                ))}
              {isFetchingNextPage &&
                Array.from({ length: 5 }).map((_, idx) => (
                  <SkeletonRouteCard key={idx} />
                ))}
            </>
          )}
        </div>

        {deferredSearchQuery.length === 0 && filteredData.length === 0 && (
          <p className='text-center text-sm text-muted-foreground'>
            Нет данных.
          </p>
        )}

        {deferredSearchQuery.length !== 0 && filteredData.length === 0 && (
          <p className='text-center text-sm text-muted-foreground'>
            Не найдено подходящего маршрута.
          </p>
        )}

        <Drawer open={isOpen} onOpenChange={setIsOpen} onClose={handleClose}>
          {/* <DrawerContent className="inset-x-auto right-2"> */}
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                {mode === 'addRoute' && 'Добавить новый маршрут'}
                {mode === 'editRoute' && 'Изменить маршрут'}
                {mode === 'idle' && <Skeleton className='h-6 w-full' />}
              </DrawerTitle>
            </DrawerHeader>
            <Separator className='mt-2 mb-4' />
            <RouteForm
              onClose={handleClose}
              routeId={routeId}
              drawerMode={mode}
            />
          </DrawerContent>
          {/* </DrawerContent> */}
        </Drawer>
      </div>
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
            <SonnerSpinner className='bg-foreground' />
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
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const MOBILE_BREAKPOINT = 340;
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleEdit = () => {
    onEdit(route.id);
  };

  const handleDelete = () => {
    onDelete(route.id);
    setIsAlertOpen(false);
  };

  return (
    <Card className={cn('overflow-hidden transition-opacity')}>
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
            <MoveHorizontal className='inline-block size-5' />{' '}
            {route.arrivalCity?.name}
          </h2>
          <div className='mb-2'>
            <div
              className={cn(
                'flex items-center text-sm text-muted-foreground mb-2',
                !route.region?.name && 'text-destructive',
              )}
            >
              {route.region?.name ? (
                <MapPin className='mr-1 size-4' />
              ) : (
                <MapPinOff className='mr-1 size-4' />
              )}
              {route.region?.name ?? 'Не указан регион'}
            </div>
            {route.departureDate && (
              <div className='flex items-center text-sm text-muted-foreground mb-2'>
                <Calendar className='mr-1 size-4' />
                {formatDate(new Date(route.departureDate))}
              </div>
            )}
            <div className='flex items-center gap-2'>
              <span
                className={cn(
                  'text-sm text-muted-foreground inline-flex items-center gap-2',
                  !route.isActive && 'text-destructive',
                )}
              >
                {route.isActive && (
                  <>
                    <TicketCheck className='size-4' /> Доступен для бронирования
                  </>
                )}
                {!route.isActive && (
                  <>
                    <TicketX className='size-4' /> Не доступен для бронирования
                  </>
                )}
              </span>
            </div>
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
                  <Link to={`/admin/routes/${route.id}/schedules`}>
                    <CalendarClock />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side='bottom'>Расписание</TooltipContent>
            </Tooltip>
            <div className='flex space-x-2'>
              {isMobile && (
                <Tooltip delayDuration={700}>
                  <TooltipTrigger asChild>
                    <Button
                      className='size-9 gap-0'
                      variant='outline'
                      size='icon'
                      onClick={handleEdit}
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='bottom'>Изменить</TooltipContent>
                </Tooltip>
              )}
              {!isMobile && (
                <Button
                  className='gap-0 px-2'
                  variant='outline'
                  size='sm'
                  onClick={handleEdit}
                >
                  <Edit className='h-4 w-4 mr-2' />
                  Изменить
                </Button>
              )}
              <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogTrigger asChild>
                  {isMobile ? (
                    <Tooltip delayDuration={700}>
                      <TooltipTrigger asChild>
                        <Button
                          className='size-9 gap-0 border border-destructive/20 text-destructive hover:bg-destructive/20 hover:text-destructive focus:ring-destructive focus-visible:ring-destructive'
                          variant='outline'
                          size='sm'
                        >
                          <Trash className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side='bottom' align='end'>
                        Удалить
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      className='gap-0 px-2 border border-destructive/20 text-destructive hover:bg-destructive/20 hover:text-destructive focus:ring-destructive focus-visible:ring-destructive'
                      variant='outline'
                      size='sm'
                    >
                      <Trash className='h-4 w-4 mr-2' />
                      Удалить
                    </Button>
                  )}
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это действие нельзя отменить. Маршрут будет удален
                      навсегда.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <Button
                      className='gap-0'
                      variant='destructive'
                      onClick={handleDelete}
                    >
                      <Trash className='h-4 w-4 mr-2' />
                      Удалить
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonRouteCard() {
  const MOBILE_BREAKPOINT = 340;
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);

  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-0 h-full flex flex-col'>
        {/* Image skeleton */}
        <div className='relative h-48 w-full'>
          <Skeleton className='absolute inset-0 w-full h-full' />
        </div>

        {/* Content skeleton */}
        <div className='p-4 flex flex-col flex-1 justify-between gap-2'>
          {/* Title skeleton */}
          <Skeleton className='h-6 w-2/3 mb-2' />

          {/* Details skeleton */}
          <div className='space-y-2 mb-2'>
            <Skeleton className='h-4 w-1/2' />
            <Skeleton className='h-4 w-1/3' />
          </div>

          {/* Action buttons skeleton */}
          <div className='flex justify-between space-x-2'>
            <Skeleton className='h-9 w-9 rounded-md' />
            <div className='flex space-x-2'>
              {isMobile ? (
                <>
                  <Skeleton className='h-9 w-9 rounded-md' />
                  <Skeleton className='h-9 w-9 rounded-md' />
                </>
              ) : (
                <>
                  <Skeleton className='h-9 w-16 rounded-md' />
                  <Skeleton className='h-9 w-16 rounded-md' />
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RoutesPage;
