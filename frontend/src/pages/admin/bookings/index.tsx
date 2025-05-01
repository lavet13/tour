import React, {
  FC,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  flexRender,
  getCoreRowModel,
  Table as ReactTable,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  FilterFn,
  ColumnResizeMode,
  Row,
  FilterMeta,
  ColumnDef,
  VisibilityState,
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';
import {
  BookingColumns,
  columns,
  columnTranslations,
} from '@/pages/admin/bookings/__columns';
import { InfiniteBookingsQuery } from '@/gql/graphql';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Edit, ListFilter, Loader2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { Waypoint } from 'react-waypoint';
import { useUpdateBooking } from '@/features/booking/api/mutations';
import { useInfiniteBookings } from '@/features/booking/api/queries';
import { AutosizeTextarea } from '@/components/autosize-textarea';
import { toast } from 'sonner';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { useViewportDimensions } from '@/hooks/use-viewport-dimentions';
import { DataTableViewOptions } from '@/components/data-table-column-toggle';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAtom } from 'jotai';
import { breakpointsAtom } from '@/lib/atoms/tailwind';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useVirtualizer } from '@tanstack/react-virtual';

type Booking = InfiniteBookingsQuery['bookings']['edges'][number];

const BookingsPage: FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    direction: false,
    createdAt: false,
    updatedAt: false,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isFetching,
    isPending,
    isError,
    error,
    refetch: refetchBookings,
  } = useInfiniteBookings({
    sorting,
    columnFilters,
  });

  const flatData = useMemo(
    () => data?.pages.flatMap(page => page.bookings.edges) ?? [],
    [data],
  );

  import.meta.env.DEV && console.log({ data, flatData });

  const columnResizeModeRef = useRef<ColumnResizeMode>('onEnd');

  const defaultColumn: Partial<ColumnDef<Booking>> = {
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

      const { mutate: updateBooking, isPending } = useUpdateBooking();

      const handleUpdate = (newValue: string) => {
        if (newValue !== initialValue) {
          setPreviousValue(initialValue);

          const promise = new Promise((resolve, reject) => {
            updateBooking(
              { input: { id: originalId, [columnId]: newValue } },
              {
                onSuccess: async data => {
                  await refetchBookings();
                  resolve(data);
                },
                onError(error) {
                  reject(error);
                },
              },
            );
          });

          toast.promise(promise, {
            loading: `Обновление поля \`${columnTranslations[columnId as BookingColumns]}\`...`,
            duration: 10000,
            action: {
              label: 'Отменить',
              onClick() {
                updateBooking(
                  { input: { id: originalId, [columnId]: previousValue } },
                  {
                    async onSuccess() {
                      refetchBookings();
                      toast.success(
                        `Отмена изменения поля \`${columnTranslations[columnId as BookingColumns]}\` выполненo успешно!`,
                      );
                    },
                    onError() {
                      toast.error(
                        `Не удалось отменить изменения поля \`${columnTranslations[columnId as BookingColumns]}\`!`,
                      );
                    },
                  },
                );
              },
            },
            success() {
              return `\`${columnTranslations[columnId as BookingColumns]}\` изменёно ${initialValue} → ${newValue}!`;
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
    data: flatData,
    columns,
    defaultColumn,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    columnResizeMode: columnResizeModeRef.current,
    columnResizeDirection: 'ltr',
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  const { rows } = table.getRowModel();

  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? rows.length + 1 : rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 50, //measure dynamic row height, except in firefox because it measures table border height incorrectly
    overscan: 5,
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

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= rows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    rows.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  const MOBILE_BREAKPOINT = 400;
  const [{ xl }] = useAtom(breakpointsAtom);
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const isFullHD = useMediaQuery(`(min-width: ${xl}px)`);

  const { sidebarExpanded, contentWidth, height } = useViewportDimensions();

  if (isError) {
    throw error;
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
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link className='flex items-center gap-2' to={`/admin/home`}>
                  Главная
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Бронирования</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className='grid md:grid-cols-[repeat(auto-fill,_minmax(13rem,_1fr))] items-center gap-2'>
          <div className='flex items-center sm:col-[1_/_-1] min-[940px]:grid-cols-[repeat(auto-fill,_minmax(13rem,_1fr))] gap-2'>
            <DataTableViewOptions
              table={table}
              isMobile={isMobile}
              columnTranslations={columnTranslations}
            />
            {isFullHD && (
              <Button
                onClick={() => {
                  table.resetColumnFilters();
                }}
              >
                <ListFilter />
                Сбросить фильтр
              </Button>
            )}
            {!isFullHD && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className={cn(
                      'h-10 w-10 min-w-10',
                      isMobile && 'h-9 w-9 min-w-9',
                    )}
                    variant='outline'
                    size='icon'
                  >
                    <MoreHorizontal />
                    <span className='sr-only'>Другие операции</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={'end'}>
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => {
                        table.resetColumnFilters();
                      }}
                    >
                      <ListFilter />
                      Сбросить фильтр
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <div
          ref={tableContainerRef}
          className='max-w-fit overflow-auto w-full relative rounded-md border'
          style={{
            maxHeight: `calc(${height}px - ${isMobile ? 9.5 : 9.9}rem)`,
          }}
        >
          {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
          <Table
            data-bg-fetching={isFetching && !isFetchingNextPage}
            className='w-full caption-bottom text-sm data-[bg-fetching=true]:opacity-70'
          >
            <TableHeader className='sticky top-0 z-[1] bg-background'>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className='relative flex w-full'>
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead
                        key={header.id}
                        {...{
                          className:
                            'select-none flex items-center self-start relative h-fit',
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
                              onDoubleClick: () => header.column.resetSize(),
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
                                        (table.options.columnResizeDirection ===
                                        'rtl'
                                          ? -1
                                          : 1) *
                                        (table.getState().columnSizingInfo
                                          .deltaOffset ?? 0)
                                      }px)`
                                    : '',
                                zIndex: 50,
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
                  const isLoaderRow = virtualRow.index > rows.length - 1;

                  if (isLoaderRow) {
                    return (
                      <TableRow
                        key='loader-row'
                        data-index={virtualRow.index}
                        ref={node => rowVirtualizer.measureElement(node)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          position: 'absolute',
                          transform: `translateY(${virtualRow.start}px)`,
                          width: '100%',
                        }}
                      >
                        <TableCellSkeleton table={table} />
                      </TableRow>
                    );
                  }

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
              ) : isPending ? (
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
                    className='flex w-full items-center justify-center h-12'
                  >
                    Нет данных.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

interface TableCellSkeletonProps<TData> {
  table: ReactTable<TData>;
}

function TableCellSkeleton({ table }: TableCellSkeletonProps<Booking>) {
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
  row: Row<Booking>,
  columnId: string,
  value: any,
  addMeta: (meta: FilterMeta) => void,
): ReturnType<FilterFn<Booking>> {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({ itemRank });

  // Return if the item should be filtered in/out
  return itemRank.passed;
}

export default BookingsPage;
