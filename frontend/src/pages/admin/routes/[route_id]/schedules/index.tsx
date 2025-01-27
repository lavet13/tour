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
import { useEffect, useMemo, useRef, useState } from 'react';
import { SonnerSpinner } from '@/components/sonner-spinner';
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import { breakpointsAtom } from '@/lib/atoms/tailwind';
import {
  ColumnFiltersState,
  ColumnResizeMode,
  FilterFn,
  FilterMeta,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { GetSchedulesByRouteQuery } from '@/gql/graphql';
import { rankItem } from '@tanstack/match-sorter-utils';
import { columns } from '@/pages/admin/routes/[route_id]/schedules/__columns';

interface Params {
  route_id: string;
}

export type Schedule = Omit<
  GetSchedulesByRouteQuery['schedulesByRoute'][number],
  '__typename'
>;

function Schedules() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

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
    () => scheduleData?.schedulesByRoute ?? [],
    [scheduleData],
  );

  const columnResizeModeRef = useRef<ColumnResizeMode>('onChange');

  const table = useReactTable({
    data: schedules,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    columnResizeMode: columnResizeModeRef.current,
    columnResizeDirection: 'ltr',
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(), // client side filtering
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
    manualPagination: true,
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  const { rows } = table.getRowModel();
  console.log({ rows });

  const scheduleInitialLoading =
    scheduleFetchStatus === 'fetching' && scheduleStatus === 'pending';

  if (scheduleIsError) {
    throw scheduleError;
  }

  return (
    <>
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
    </>
  );
}

function fuzzyFilter(
  row: Row<Schedule>,
  columnId: string,
  value: any,
  addMeta: (meta: FilterMeta) => void,
): ReturnType<FilterFn<Schedule>> {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({ itemRank });

  // Return if the item should be filtered in/out
  return itemRank.passed;
}

export default Schedules;
