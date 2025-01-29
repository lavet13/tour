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
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  Table as ReactTable,
  PaginationState,
} from '@tanstack/react-table';
import { GetSchedulesByRouteQuery } from '@/gql/graphql';
import { rankItem } from '@tanstack/match-sorter-utils';
import { columns } from '@/pages/admin/routes/[route_id]/schedules/__columns';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTablePagination } from '@/components/data-table-pagination';

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
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const MOBILE_BREAKPOINT = 450;
  const navigate = useNavigate();
  const [{ md }] = useAtom(breakpointsAtom);
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const isTablet = useMediaQuery(`(min-width: ${md}px)`);
  const { state } = useSidebar();
  const [innerWidth, setInnerWidth] = useState(0);
  const [innerHeight, setInnerHeight] = useState(0);

  useEffect(() => {
    const updateViewportSize = () => {
      setInnerWidth(window.innerWidth);
      setInnerHeight(window.innerHeight);
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
    isPending: scheduleIsPending,
    isSuccess: scheduleIsSuccess,
    isError: scheduleIsError,
  } = useSchedulesByRoute(routeId, { enabled: !!routeId });

  const scheduleInitialLoading =
    scheduleFetchStatus === 'fetching' && scheduleStatus === 'pending';

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
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getFilteredRowModel: getFilteredRowModel(), // client side filtering
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      pagination,
      sorting,
      columnVisibility,
      columnFilters,
    },
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  const { rows } = table.getRowModel();
  console.log({ rows });

  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 73, // measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
  });

  // Scroll to top when sorting changes
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({ top: 0 });
    }
  }, [sorting, columnFilters]); // Dependency: re-run when sorting changes

  if (scheduleIsError) {
    throw scheduleError;
  }

  return (
    <div className='container px-0'>
      <div
        className={cn(
          'relative px-1 space-y-2 flex-1 pt-2',
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
          <>
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
                        <span className="sr-only">Назад</span>
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

            {/* Table container */}
            <div
              ref={tableContainerRef}
              className='max-w-fit overflow-auto w-full relative rounded-md border'
              style={{
                maxHeight: `calc(${innerHeight}px - ${isMobile ? 8 : 7.9}rem)`,
              }}
            >
              {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
              <Table
                data-bg-fetching={scheduleIsFetching}
                className='w-full caption-bottom text-sm data-[bg-fetching=true]:opacity-70'
              >
                <TableHeader className='grid sticky top-0 z-[1] bg-background'>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow
                      key={headerGroup.id}
                      style={{ display: 'flex', width: '100%' }}
                    >
                      {headerGroup.headers.map(header => {
                        return (
                          <TableHead
                            key={header.id}
                            {...{
                              className: 'select-none',
                              colSpan: header.colSpan,
                              style: {
                                display: 'flex',
                                position: 'relative',
                                alignItems: 'center',
                                alignSelf: 'center',
                                height: 'fit-content',
                                padding: '0.2rem 1rem',
                                width: header.getSize(),
                              },
                            }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                            {header.column.getCanResize() ? (
                              <div
                                {...{
                                  onDoubleClick: () =>
                                    header.column.resetSize(),
                                  onMouseDown: header.getResizeHandler(),
                                  onTouchStart: header.getResizeHandler(),
                                  className: cn(
                                    `absolute right-0 rounded-sm top-0 w-1 h-full cursor-col-resize select-none touch-none ${
                                      table.options.columnResizeDirection
                                    } ${
                                      header.column.getIsResizing()
                                        ? 'bg-foreground/50'
                                        : 'hover:bg-foreground/30'
                                    }`,
                                  ),
                                  style: {
                                    transform:
                                      columnResizeModeRef.current === 'onEnd' &&
                                      header.column.getIsResizing()
                                        ? `translateX(${
                                            (table.options
                                              .columnResizeDirection === 'rtl'
                                              ? -1
                                              : 1) *
                                            (table.getState().columnSizingInfo
                                              .deltaOffset ?? 0)
                                          }px)`
                                        : '',
                                  },
                                }}
                              />
                            ) : null}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody
                  style={{
                    display: 'grid',
                    height:
                      rowVirtualizer.getTotalSize() > 0
                        ? `${rowVirtualizer.getTotalSize()}px`
                        : 'auto', //tells scrollbar how big the table is
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().length !== 0 ? (
                    rowVirtualizer.getVirtualItems().map(virtualRow => {
                      const row = rows[virtualRow.index];

                      return (
                        <TableRow
                          data-index={virtualRow.index} //needed for dynamic row height measurement
                          key={row.id}
                          ref={node => rowVirtualizer.measureElement(node)} //measure dynamic row height
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            position: 'absolute',
                            transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                            width: '100%',
                          }}
                        >
                          {row.getVisibleCells().map(cell => {
                            return (
                              <TableCell
                                key={cell.id}
                                style={{
                                  display: 'flex',
                                  width: cell.column.getSize(),
                                }}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })
                  ) : scheduleIsPending ? (
                    <TableRow
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <TableCellSkeleton table={table} />
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className='flex justify-center h-12'
                      >
                        Нет данных.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <DataTablePagination table={table} />
          </>
        )}
      </div>
    </div>
  );
}

interface TableCellSkeletonProps<TData> {
  table: ReactTable<TData>;
}

function TableCellSkeleton({ table }: TableCellSkeletonProps<Schedule>) {
  return (
    <>
      {table.getAllColumns().map((column, index) => {
        if (column.id === 'qrCode') {
          return (
            <TableCell
              className='flex'
              style={{ width: column.getSize() }}
              key={index}
            >
              <Skeleton className='h-12 w-12 rounded-sm' />
            </TableCell>
          );
        }

        return (
          <TableCell
            className='flex'
            style={{ width: column.getSize() }}
            key={index}
          >
            <Skeleton className='h-4 w-full rounded-sm' />
          </TableCell>
        );
      })}
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
