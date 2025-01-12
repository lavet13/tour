import { useSchedulesByRoute } from '@/features/schedule/use-schedules-by-route';
import { Link, useSearchParams } from 'react-router-dom';
import { SonnerSpinner } from '@/components/sonner-spinner';
import { Button } from '@/components/ui/button';
import { useRouteById } from '@/features/routes/use-route-by-id';
import { useInfiniteRoutes } from '@/features/routes';
import { useDeferredValue, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import { useAtom } from 'jotai';
import { breakpointsAtom } from '@/lib/atoms/tailwind';
import { useMediaQuery } from '@/hooks/use-media-query';

function SchedulesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const routeId = searchParams.get('id')!;
  const { data: routeData, isPending, error, isError } = useRouteById(routeId);

  // show me schedules for existing route
  const {
    data: scheduleData,
    fetchStatus,
    status,
  } = useSchedulesByRoute(routeId, {
    enabled: !!routeData?.routeById,
  });

  const [{ md }] = useAtom(breakpointsAtom);
  const isTablet = useMediaQuery(`(min-width: ${md}px)`);
  const { state } = useSidebar();
  const [innerWidth, setInnerWidth] = useState(0);
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

  // show me all routes when there is no routeId specified by the user
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isFetching,
    isPending: routesIsPending,
    isError: routesIsError,
    error: routesError,
  } = useInfiniteRoutes({
    take: import.meta.env.DEV ? 5 : 30,
    query: deferredSearchQuery,
  });

  const backgroundUpdate = fetchStatus === 'fetching' && status === 'success';
  const initialLoading = fetchStatus === 'fetching' && status === 'pending';

  if (isError) {
    throw error;
  }

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
      {isPending || initialLoading ? (
        <div className='flex-1 flex items-center justify-center'>
          <SonnerSpinner className='bg-foreground' />
        </div>
      ) : !routeData.routeById ? (
        <div className='flex items-center'>
          <Input
            className='max-w-[300px]'
            placeholder='Найти маршрут...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      ) : scheduleData?.schedulesByRoute.length ? (
        <></>
      ) : (
        <p>Нету</p>
      )}
    </div>
  );
}

export default SchedulesPage;
