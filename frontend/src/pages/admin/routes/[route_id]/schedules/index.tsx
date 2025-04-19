import { Button } from '@/components/ui/button';
import { useSchedulesByRoute } from '@/features/schedule/api/queries';
import { CalendarPlus, Edit, Loader2 } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { SonnerSpinner } from '@/components/sonner-spinner';
import { cn } from '@/lib/utils';
import {
  ColumnFiltersState,
  ColumnResizeMode,
  FilterFn,
  FilterMeta,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  Table as ReactTable,
  ColumnDef,
} from '@tanstack/react-table';
import { GetSchedulesByRouteQuery } from '@/gql/graphql';
import { rankItem } from '@tanstack/match-sorter-utils';
import {
  columns,
  columnTranslations,
} from '@/pages/admin/routes/[route_id]/schedules/__columns';
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
import { useViewportDimensions } from '@/hooks/use-viewport-dimentions';
import { useDrawerState } from '@/hooks/use-drawer-state';
import { ScheduleForm } from '@/features/schedule/components/schedule-form';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useRouteById } from '@/features/routes';
import { toast } from 'sonner';

export interface ScheduleParams {
  route_id: string;
}

export type Schedule = Omit<
  GetSchedulesByRouteQuery['schedulesByRoute'][number],
  '__typename'
>;

import { ScheduleColumns } from '@/pages/admin/routes/[route_id]/schedules/__columns';
import { useUpdateSchedule } from '@/features/schedule';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { AutosizeTextarea } from '@/components/autosize-textarea';

export type DrawerMode = 'idle' | 'editSchedule' | 'addSchedule';

function Schedules() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const MOBILE_BREAKPOINT = 400;
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const { sidebarExpanded, contentWidth, height } = useViewportDimensions();

  const [searchParams, setSearchParams] = useSearchParams();

  const addSchedule = searchParams.get('add_schedule');
  const scheduleId = searchParams.get('schedule_id');

  const { route_id: routeId } = useParams<
    keyof ScheduleParams
  >() as ScheduleParams;

  const {
    isOpen: drawerIsOpen,
    mode,
    setIsOpen: setDrawerIsOpen,
    openDrawer,
  } = useDrawerState<'idle' | 'addSchedule' | 'editSchedule'>({
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
    refetch: refetchSchedules,
  } = useSchedulesByRoute({
    routeId,
    options: { enabled: !!routeId },
  });

  const { data: routeData } = useRouteById({
    id: routeId,
    options: { enabled: !!routeId },
  });
  const departureCityName = routeData?.routeById?.departureCity?.name ?? '';
  const arrivalCityName = routeData?.routeById?.arrivalCity?.name ?? '';

  const scheduleInitialLoading =
    scheduleFetchStatus === 'fetching' && scheduleStatus === 'pending';

  const schedules = useMemo(
    () => scheduleData?.schedulesByRoute ?? [],
    [scheduleData],
  );

  const columnResizeModeRef = useRef<ColumnResizeMode>('onChange');

  const defaultColumn: Partial<ColumnDef<Schedule>> = {
    cell: ({
      getValue,
      row: {
        original: { id: originalId },
      },
      column: { id: columnId },
    }) => {
      const initialValue = getValue() as string;
      const [isEditing, setIsEditing] = useState(false);
      const [previousValue, setPreviousValue] = useState(initialValue);

      const { mutate: updateSchedule, isPending } = useUpdateSchedule();

      const handleUpdate = (newValue: string) => {
        if (newValue !== initialValue) {
          setPreviousValue(initialValue);

          const promise = new Promise((resolve, reject) => {
            updateSchedule(
              { input: { id: originalId, [columnId]: newValue } },
              {
                onSuccess: async data => {
                  await refetchSchedules();
                  resolve(data);
                },
                onError(error) {
                  reject(error);
                },
              },
            );
          });

          toast.promise(promise, {
            loading: `Обновление поля \`${columnTranslations[columnId as ScheduleColumns]}\`...`,
            duration: 10000,
            action: {
              label: 'Отменить',
              onClick() {
                updateSchedule(
                  { input: { id: originalId, [columnId]: previousValue } },
                  {
                    async onSuccess() {
                      refetchSchedules();
                      toast.success(
                        `Отмена изменения поля \`${columnTranslations[columnId as ScheduleColumns]}\` выполненo успешно!`,
                      );
                    },
                    onError() {
                      toast.error(
                        `Не удалось отменить изменения поля \`${columnTranslations[columnId as ScheduleColumns]}\`!`,
                      );
                    },
                  },
                );
              },
            },
            success() {
              return `\`${columnTranslations[columnId as ScheduleColumns]}\` изменёно ${initialValue} → ${newValue}!`;
            },
            error(error) {
              if (isGraphQLRequestError(error)) {
                return error.response.errors[0].message;
              } else if (error instanceof Error) {
                return error.message;
              }
              return 'Произошла ошибка!';
            },
          });
        }
        setIsEditing(false);
      };

      const onBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        handleUpdate(e.target.value);
      };

      const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
          e.preventDefault();
          handleUpdate(e.currentTarget.value);
        }
      };

      if (isEditing) {
        return (
          <AutosizeTextarea
            minHeight={32}
            maxHeight={120}
            className='p-1 px-2 h-8'
            defaultValue={initialValue}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            autoFocus
          />
        );
      }

      return (
        <>
          {initialValue.length ? (
            <div
              className='flex items-center overflow-hidden cursor-text gap-1'
              onClick={() => setIsEditing(true)}
            >
              {isPending && (
                <Loader2 className='min-w-4 min-h-4 size-4 animate-spin' />
              )}
              <span title={initialValue} className='truncate'>
                {initialValue}
              </span>
            </div>
          ) : (
            <Button
              className='size-8'
              variant='outline'
              onClick={() => setIsEditing(true)}
            >
              {!isPending && <Edit />}
              {isPending && (
                <Loader2 className='min-w-4 min-h-4 size-4 animate-spin' />
              )}
            </Button>
          )}
        </>
      );
    },
  };

  const table = useReactTable({
    data: schedules,
    defaultColumn,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    columnResizeMode: columnResizeModeRef.current,
    columnResizeDirection: 'ltr',
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    meta: {
      onEdit: handleEditSchedule,
    },
    state: {
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
            <Breadcrumb className='px-2 py-2'>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      className='flex items-center gap-2'
                      to={`/admin/home`}
                    >
                      Главная
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      className='flex items-center gap-2'
                      to={`/admin/routes`}
                    >
                      Маршруты
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      className='flex items-center gap-2'
                      to={`/admin/routes/?route_id=${routeData?.routeById?.id}`}
                    >
                      <span>{departureCityName}</span>⇆
                      <span>{arrivalCityName}</span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Расписание</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className='flex flex-col'>
              <div className='flex items-center gap-2'>
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
                maxHeight: `calc(${height}px - ${isMobile ? 11.9 : 10.9}rem)`,
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
          </>
        )}
      </div>

      <Drawer
        open={drawerIsOpen}
        onOpenChange={setDrawerIsOpen}
        onClose={handleClose}
      >
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
