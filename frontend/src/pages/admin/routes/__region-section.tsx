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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useInfiniteRoutes } from '@/features/routes';
import { InfiniteRoutesQuery } from '@/gql/graphql';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ArrowDown,
  ArrowLeftRight,
  Calendar,
  CalendarClock,
  Edit,
  Loader2,
  MapPin,
  MapPinOff,
  TicketCheck,
  TicketX,
  Trash,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Waypoint } from 'react-waypoint';
import { Link } from 'react-router-dom';
import { LazyImageWrapper } from '@/components/lazy-image';
import { SonnerSpinner } from '@/components/sonner-spinner';

interface RegionSectionProps {
  regionId?: string | null;
  regionName?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

type Route = Omit<
  InfiniteRoutesQuery['infiniteRoutes']['edges'][number],
  '__typename'
>;

function RegionSection({
  onEdit,
  onDelete,
  regionId,
  regionName,
}: RegionSectionProps) {
  const take = import.meta.env.DEV ? 15 : 30;
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(true);

  const handleLoadMore = () => {
    fetchNextPage();
    setShowLoadMoreButton(false); // Hide the button after first click
  };

  const handleWaypointEnter = () => {
    if (hasNextPage && !isFetchingNextPage && !showLoadMoreButton) {
      fetchNextPage();
    }
  };

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isPending,
    isFetching,
    isError,
    error,
  } = useInfiniteRoutes({
    take,
    initialLoading: true,
    regionId,
  });

  const routes = useMemo(
    () => data?.pages.flatMap(page => page.infiniteRoutes.edges) ?? [],
    [data],
  );

  // Determine route count text
  const routeCountText = useMemo(() => {
    const count = routes.length;
    if (count === 1) return '1 маршрут';
    if (count >= 2 && count <= 4) return `${count} маршрута`;
    return `${count} маршрутов`;
  }, [routes.length]);

  if (isPending && !routes.length) {
    // @TODO: change the skeleton view
    return (
      <div className='sm:grid flex flex-col sm:grid-cols-[repeat(auto-fill,_minmax(18.5rem,_1fr))] gap-2 pb-2'>
        <div className='col-span-full mt-4 mb-2 first:mt-0'>
          <Skeleton className='h-6 w-1/3 mb-2' />
          <Skeleton className='h-4 w-1/4' />
        </div>

        {Array.from({ length: 3 }).map((_, idx) => (
          <SkeletonRouteCard key={idx} />
        ))}
      </div>
    );
  }

  // Render nothing if no routes and not pending
  if (!isPending && routes.length === 0) {
    return null;
  }

  if (isError) {
    throw error;
  }

  return (
    <div
      className={cn(
        'sm:grid flex flex-col sm:grid-cols-[repeat(auto-fill,_minmax(17rem,_1fr))] gap-2 pb-4',
        isFetching && 'opacity-80',
      )}
    >
      {/* Region header with routes count */}
      {routes.length > 0 && (
        <div className='col-span-full mt-4 mb-2 first:mt-0'>
          {regionName && (
            <h3 className='text-lg font-medium text-foreground'>
              {regionName}
            </h3>
          )}
          <p className='text-sm text-muted-foreground'>{routeCountText}</p>
        </div>
      )}

      {routes.map(route => (
        <RouteCard
          key={route.id}
          route={route}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {isFetchingNextPage && (
        <div className='col-span-full flex flex-col justify-center items-center'>
          <SonnerSpinner className='bg-foreground' />
        </div>
      )}

      {/* Load more button - only shown initially */}
      {hasNextPage && showLoadMoreButton && (
        <div className='col-span-full flex flex-col justify-center items-center'>
          <Button
            variant='ghost'
            className='h-8'
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
          >
            {!isFetchingNextPage && (
              <>
                Посмотреть еще <ArrowDown />
              </>
            )}
            {isFetchingNextPage && (
              <>
                <Loader2 className='animate-spin' /> Загружаем...
              </>
            )}
          </Button>
        </div>
      )}

      {/* Waypoint for automatic loading after button click */}
      {hasNextPage && !showLoadMoreButton && !isFetchingNextPage && (
        <div className='col-span-full'>
          <Waypoint onEnter={handleWaypointEnter} bottomOffset={'-200px'} />
        </div>
      )}
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
            <ArrowLeftRight className='inline-block size-4' />{' '}
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

function formatDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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

export default RegionSection;
