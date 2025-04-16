import RouteFilterForm from '@/components/route-filter-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { useRegions } from '@/features/region';
import { useInfiniteRoutes } from '@/features/routes';
import { useDrawerState } from '@/hooks/use-drawer-state';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { ArrowDown, Filter, FilterX, Search } from 'lucide-react';
import { FC, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RouteCard } from '@/pages/routes/route-card';
import { SonnerSpinner } from '@/components/sonner-spinner';
import { Waypoint } from 'react-waypoint';

const RoutesPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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

  const departureCityIdParams = searchParams.get('departureCityId');
  const arrivalCityIdParams = searchParams.get('arrivalCityId');
  const regionIdParams = searchParams.get('regionId');

  const filteredSearchParams = [
    departureCityIdParams,
    arrivalCityIdParams,
    regionIdParams,
  ].filter(Boolean);
  const activeSearchParamsCount = filteredSearchParams.length;

  const { data: regionsData, isPending: isRegionsPending } = useRegions();
  const regionIds = useMemo(() => {
    return [...(regionsData?.regions ?? [])].map(region => region.id);
  }, [regionsData]);

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
    initialLoading: false,
    regionIds: regionIdParams ? [regionIdParams] : regionIds,
    departureCityId: departureCityIdParams,
    arrivalCityId: arrivalCityIdParams,
  });

  const routes = useMemo(
    () => data?.pages.flatMap(page => page.infiniteRoutes.edges) ?? [],
    [data],
  );

  console.log({ routes });

  const filter = searchParams.get('filter');
  const {
    isOpen: filterIsOpen,
    mode: filterMode,
    setIsOpen: setFilterIsOpen,
    openDrawer: openFilterDrawer,
  } = useDrawerState<'idle' | 'filter'>({
    initialMode: 'idle',
    queryParams: {
      filter: 'filter',
    },
    paramValues: {
      filter: filter,
    },
  });

  const resetFilters = () => {
    setSearchParams(params => {
      const query = new URLSearchParams(params.toString());
      query.delete('departureCityId');
      query.delete('arrivalCityId');
      query.delete('regionId');
      return query;
    });
  };

  const handleOpenFilter = () => {
    openFilterDrawer('filter');
    setSearchParams(params => {
      const query = new URLSearchParams(params.toString());
      query.set('filter', 'true');
      return query;
    });
  };

  const handleFilterClose = () => {
    if (filterMode === 'filter') {
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());
        query.delete('filter');
        return query;
      });
    }
  };

  if (isError) {
    throw error;
  }

  return (
    <div className='container mx-auto py-6 px-2 md:px-6'>
      <div className='flex flex-col space-y-4'>
        <div className='flex flex-col md:flex-row md:items-center justify-start gap-4 border-b border-dashed pb-3'>
          <div className='flex items-center justify-end gap-2'>
            <Drawer
              direction={'left'}
              open={filterIsOpen}
              onOpenChange={setFilterIsOpen}
              onClose={handleFilterClose}
            >
              <Button
                size='sm'
                className='relative w-full min-[400px]:w-auto sm:px-8'
                onClick={handleOpenFilter}
              >
                <Filter />
                {activeSearchParamsCount > 0 && (
                  <span className='absolute -top-1 -left-1 bg-primary text-primary-foreground rounded-full text-xs size-4 flex items-center justify-center border border-muted/15'>
                    {activeSearchParamsCount}
                  </span>
                )}
                Фильтры
              </Button>
              <DrawerContent
                isSidebar
                showCloseButton
                showCloseButtonOnMobile
                showTheLine={false}
                direction={'left'}
              >
                <RouteFilterForm
                  includeInactiveRegion={false}
                  includeInactiveCities={false}
                />
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {isPending && (
          <div className='sm:grid flex flex-col sm:grid-cols-[repeat(auto-fill,_minmax(18.5rem,_1fr))] gap-2 pb-2'>
            <div className='col-span-full mt-4 mb-2 first:mt-0'>
              <Skeleton className='h-6 w-1/3 mb-2' />
              <Skeleton className='h-4 w-1/4' />
            </div>

            {Array.from({ length: 5 }).map((_, idx) => (
              <SkeletonRouteCard key={idx} />
            ))}
          </div>
        )}

        {!isPending && routes.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='rounded-full bg-muted p-3 mb-4'>
              <Search className='h-6 w-6 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-medium'>Маршруты не найдены</h3>
            <p className='text-muted-foreground mt-1 mb-4'>
              Попробуйте изменить параметры поиска или фильтры
            </p>
            <Button variant='outline' onClick={resetFilters}>
              <FilterX />
              Сбросить фильтры
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              'sm:grid flex flex-col sm:grid-cols-[repeat(auto-fill,_minmax(16rem,_1fr))] gap-2 pb-2',
              isFetching && 'opacity-80',
            )}
          >
            {routes.map(route => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        )}

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
                  <SonnerSpinner /> Загружаем...
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
    </div>
  );
};

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
