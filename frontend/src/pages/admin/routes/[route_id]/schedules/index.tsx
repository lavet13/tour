import { Button } from '@/components/ui/button';
import { useSchedulesByRoute } from '@/features/schedule/api/queries';
import { ArrowLeft, CalendarPlus } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SonnerSpinner } from '@/components/sonner-spinner';
import { cn } from '@/lib/utils';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { DataTablePagination } from '@/components/data-table-pagination';
import { useViewportDimensions } from '@/hooks/use-viewport-dimentions';
import { useDrawerState } from '@/hooks/use-drawer-state';
import { ScheduleForm } from '@/features/schedule/components/schedule-form';
import { useMediaQuery } from '@/hooks/use-media-query';

export interface ScheduleParams {
  route_id: string;
}

export type Schedule = Omit<
  GetSchedulesByRouteQuery['schedulesByRoute'][number],
  '__typename'
>;

export type DrawerMode = 'idle' | 'editSchedule' | 'addSchedule';

function Schedules() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const MOBILE_BREAKPOINT = 400;
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const { sidebarExpanded, contentWidth, height } =
    useViewportDimensions(MOBILE_BREAKPOINT);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const addSchedule = searchParams.get('add_schedule');
  const scheduleId = searchParams.get('schedule_id');

  const { route_id: routeId } = useParams<
    keyof ScheduleParams
  >() as ScheduleParams;

  const { isOpen: drawerIsOpen, mode, setIsOpen: setDrawerIsOpen, openDrawer } = useDrawerState<
    'idle' | 'addSchedule' | 'editSchedule'
  >({
    initialMode: 'idle',
    queryParams: {
      editSchedule: 'schedule_id',
      addSchedule: 'add_schedule',
    },
    paramValues: {
      schedule_id: scheduleId,
      add_schedule: addSchedule,
    },
  });


  const handleAddSchedule = () => {
    openDrawer('addSchedule');
    setSearchParams(params => {
      const query = new URLSearchParams(params.toString());
      query.set('add_schedule', 'true');
      return query;
    });
  };

  const handleEditSchedule = (id: string) => {
    openDrawer('editSchedule');
    setSearchParams(params => {
      const query = new URLSearchParams(params.toString());
      query.set('schedule_id', id);
      return query;
    });
  };

  const handleClose = () => {
    if (mode === 'editSchedule') {
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());
        query.delete('schedule_id');
        return query;
      });
    } else if (mode === 'addSchedule') {
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());
        query.delete('add_schedule');
        return query;
      });
    }
  };

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
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    meta: {
      onEdit: handleEditSchedule,
    },
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

  const tableContainerRef = useRef<HTMLDivElement | null>(null);

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
          !sidebarExpanded && 'mx-0',
        )}
        style={{
          maxWidth: `calc(${contentWidth}px)`,
        }}
      >
        {scheduleInitialLoading && (
          <div className='flex-1 h-full flex items-center justify-center'>
            <SonnerSpinner className='bg-foreground' />
          </div>
        )}

        {!scheduleInitialLoading && (
          <>
            <div className='flex flex-col'>
              <div className='flex items-center gap-2'>
                <Tooltip delayDuration={700}>
                  <TooltipTrigger asChild>
                    <Button
                      className={cn(
                        'h-10 w-10 min-w-10',
                        isMobile && 'h-9 w-9 min-w-9',
                      )}
                      variant='outline'
                      size='icon'
                      onClick={() => navigate('../routes')}
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
                <Button
                  size={isMobile ? 'sm' : 'default'}
                  onClick={handleAddSchedule}
                  className='w-full sm:w-auto'
                >
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
                maxHeight: `calc(${height}px - ${isMobile ? 8 : 7.9}rem)`,
              }}
            >
              {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
              <Table
                data-bg-fetching={
                  scheduleIsFetching ||
                  (scheduleIsFetching && scheduleIsSuccess)
                }
                className='w-full caption-bottom text-sm data-[bg-fetching=true]:opacity-70'
              >
                <TableHeader className='sticky top-0 z-[1] bg-background'>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow
                      key={headerGroup.id}
                      className='relative flex w-full'
                    >
                      {headerGroup.headers.map(header => {
                        return (
                          <TableHead
                            key={header.id}
                            {...{
                              className:
                                'select-none flex items-center self-center h-fit relative',
                              colSpan: header.colSpan,
                              style: {
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
                <TableBody>
                  {rows.length !== 0 ? (
                    rows.map(row => {
                      return (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map(cell => {
                            return (
                              <TableCell
                                key={cell.id}
                                style={{
                                  width: cell.column.getSize(),
                                }}
                                className={cn(
                                  cell.column.id === 'isActive' &&
                                    'flex justify-center',
                                )}
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
                    <TableRow>
                      <TableCellSkeleton table={table} />
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className='flex w-full items-center justify-center h-12'
                      >
                        Нет данных.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* <DataTablePagination table={table} /> */}

            <div className='flex flex-col gap-4 items-start justify-between px-2 py-4'>
              <div className='text-sm text-muted-foreground order-last sm:order-first w-full sm:w-auto text-center sm:text-left'>
                {table.getFilteredSelectedRowModel().rows.length} из{' '}
                {table.getFilteredRowModel().rows.length} строк(и) выбрано.
              </div>
            </div>
          </>
        )}
      </div>

      <Drawer open={drawerIsOpen} onOpenChange={setDrawerIsOpen} onClose={handleClose}>
        {/* <DrawerContent className="inset-x-auto right-2"> */}
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {mode === 'addSchedule' && 'Добавить новое расписание'}
              {mode === 'editSchedule' && 'Изменить расписание'}
              {mode === 'idle' && <Skeleton className='h-6 w-full' />}
            </DrawerTitle>
          </DrawerHeader>
          <Separator className='mt-2 mb-4' />
          <ScheduleForm
            onClose={handleClose}
            scheduleId={scheduleId}
            routeId={routeId}
            drawerMode={mode}
          />
        </DrawerContent>
        {/* </DrawerContent> */}
      </Drawer>

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
