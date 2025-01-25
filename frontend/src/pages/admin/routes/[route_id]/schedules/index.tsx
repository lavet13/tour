import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { useSchedulesByRoute } from '@/features/schedule/use-schedules-by-route';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ArrowLeft, CalendarPlus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useEffect, useMemo, useState } from 'react';
import { SonnerSpinner } from '@/components/sonner-spinner';
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import { breakpointsAtom } from '@/lib/atoms/tailwind';

interface Params {
  route_id: string;
}

function Schedules() {
  const MOBILE_BREAKPOINT = 450;
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const navigate = useNavigate();
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
  const { route_id: routeId } = useParams<keyof Params>() as Params;

  // show me schedules for existing route
  const {
    data: scheduleData,
    fetchStatus: scheduleFetchStatus,
    status: scheduleStatus,
    error: scheduleError,
    isFetching: scheduleIsFetching,
    isSuccess: scheduleIsSuccess,
    isError: scheduleIsError,
  } = useSchedulesByRoute(routeId, { enabled: !!routeId });

  const schedules = useMemo(
    () => scheduleData?.schedulesByRoute,
    [scheduleData],
  );
  console.log({ schedules });

  const scheduleInitialLoading =
    scheduleFetchStatus === 'fetching' && scheduleStatus === 'pending';

  if (scheduleIsError) {
    throw scheduleError;
  }

  return (
    <div className='container px-1 sm:px-2 pt-2 mx-auto overflow-hidden flex-1 flex flex-col'>
      <div
        className={cn(
          'relative space-y-2 flex-1',
          state === 'collapsed' && 'mx-0',
        )}
        style={{
          maxWidth: `calc(${innerWidth - (isTablet && state === 'expanded' ? 256 : 0)}px)`,
        }}
      >
        {scheduleInitialLoading && (
          <div className='flex-1 h-full flex items-center justify-center'>
            <SonnerSpinner className='bg-foreground' />
          </div>
        )}

        {/* Background Updates */}
        {scheduleIsFetching && scheduleIsSuccess && (
          <div className='w-full sm:max-w-screen-sm mx-auto'>
            <div className='flex items-center justify-center mb-6 px-4 sm:px-5'>
              <SonnerSpinner className='bg-foreground' />
            </div>
          </div>
        )}
        {!scheduleInitialLoading && (
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              {!isMobile && (
                <Button variant='outline' onClick={() => navigate(-1)}>
                  <ArrowLeft />
                  Назад
                </Button>
              )}
              {isMobile && (
                <Tooltip delayDuration={700}>
                  <TooltipTrigger asChild>
                    <Button
                      className='h-9 min-w-9'
                      variant='outline'
                      size='icon'
                      onClick={() => navigate(-1)}
                    >
                      <ArrowLeft />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    align={state === 'collapsed' ? 'start' : 'center'}
                    side='bottom'
                  >
                    Вернуться назад
                  </TooltipContent>
                </Tooltip>
              )}
              <Button className='w-full sm:w-auto'>
                <CalendarPlus />
                Добавить расписание
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Schedules;
