import { useInfiniteBookings } from '@/features/booking/use-infinite-bookings';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  Table as ReactTable,
  SortingState,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
  FilterFn,
  ColumnResizeMode,
  Row,
  FilterMeta,
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';
import {
  BookingColumns,
  columns,
  columnTranslations,
} from '@/pages/admin/bookings/columns';
import { InfiniteBookingsQuery } from '@/gql/graphql';
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
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ListCollapse,
  ListFilter,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebar } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { breakpointsAtom } from '@/lib/atoms/tailwind';
import { useAtom } from 'jotai';

type Booking = InfiniteBookingsQuery['bookings']['edges'][number];

const BookingsPage: FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  console.log({ columnFilters });

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isFetching,
    isPending,
    isError,
    error,
  } = useInfiniteBookings({
    take: import.meta.env.DEV ? 5 : 30,
    sorting,
    columnFilters,
  });

  const flatData = useMemo(
    () => data?.pages.flatMap(page => page.bookings.edges) ?? [],
    [data],
  );

  import.meta.env.DEV && console.log({ data, flatData });

  const columnResizeModeRef = useRef<ColumnResizeMode>('onChange');

  const table = useReactTable({
    data: flatData,
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

  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? rows.length + 1 : rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 73, //measure dynamic row height, except in firefox because it measures table border height incorrectly
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

  if (isError) {
    throw error;
  }

  const [{ md, xl }] = useAtom(breakpointsAtom);
  const isMobile = useMediaQuery(`(max-width: ${400}px)`);
  const isFullHD = useMediaQuery(`(min-width: ${xl}px)`);
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
      <div className='grid md:grid-cols-[repeat(auto-fill,_minmax(13rem,_1fr))] items-center gap-2'>
        <div className='grid sm:col-[1_/_-1] grid-cols-[1fr_auto] min-[940px]:grid-cols-[repeat(auto-fill,_minmax(13rem,_1fr))] gap-2'>
          <HideColumns table={table} />
          {isFullHD && (
            <>
              <Button size='sm' onClick={() => table.resetSorting()}>
                <ArrowUpDown />
                Сбросить сортировку
              </Button>
              <Button
                size='sm'
                onClick={() => {
                  table.resetColumnFilters();
                }}
              >
                <ListFilter />
                Сбросить фильтр
              </Button>
            </>
          )}
          {!isFullHD && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='size-9' variant='outline' size='icon'>
                  <MoreHorizontal />
                  <span className='sr-only'>Другие операции</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={'end'}>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => table.resetSorting()}>
                    <ArrowUpDown />
                    Сбросить сортировку
                  </DropdownMenuItem>
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
          maxHeight: `calc(${innerHeight}px - ${isMobile ? 8 : 7.9}rem)`,
        }}
      >
        {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
        <Table
          data-bg-fetching={isFetching && !isFetchingNextPage}
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
                  className='flex justify-center h-12'
                >
                  Нет данных.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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

interface HideColumnsProps<TData> {
  table: ReactTable<TData>;
}

function HideColumns({ table }: HideColumnsProps<Booking>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const allColumns = table
    .getAllColumns()
    .filter(column => column.getCanHide());
  const visibleColumns = allColumns.filter(column => column.getIsVisible());
  const isAllVisible = visibleColumns.length === allColumns.length;
  const isSomeVisible = visibleColumns.length > 0 && !isAllVisible;

  const toggleAllColumns = (visible: boolean) => {
    allColumns.forEach(column => column.toggleVisibility(visible));
  };

  const renderTrigger = () => {
    return (
      <Button size='sm' variant='outline'>
        <ListCollapse />
        Скрыть столбцы
        <ChevronDown />
      </Button>
    );
  };

  const renderContent = () => {
    return (
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem
              onSelect={() => toggleAllColumns(!isAllVisible)}
              className='flex gap-[4rem]'
            >
              <span className={cn(!isAllVisible && 'opacity-70')}>
                Все столбцы
              </span>
              {isAllVisible || isSomeVisible ? (
                <Check
                  className={cn(
                    'ml-auto',
                    isAllVisible ? 'opacity-100' : 'opacity-70',
                    isSomeVisible && 'opacity-70',
                  )}
                />
              ) : null}
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <ScrollArea className='h-[calc(16rem)]'>
            <CommandGroup className='pr-3'>
              {allColumns.map(column => (
                <CommandItem
                  key={column.id}
                  onSelect={() =>
                    column.toggleVisibility(!column.getIsVisible())
                  }
                  className='flex gap-3'
                >
                  <span className={cn(!column.getIsVisible() && 'opacity-50')}>
                    {columnTranslations[column.id as BookingColumns] ??
                      'no-name'}
                  </span>
                  {column.getIsVisible() ? (
                    <Check className='ml-auto opacity-100' />
                  ) : (
                    <Check className='ml-auto opacity-0' />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </ScrollArea>
        </CommandList>
      </Command>
    );
  };

  return isDesktop ? (
    <Popover>
      <PopoverTrigger asChild>{renderTrigger()}</PopoverTrigger>
      <PopoverContent className='p-0 w-fit'>{renderContent()}</PopoverContent>
    </Popover>
  ) : (
    <Drawer>
      <DrawerTrigger asChild>{renderTrigger()}</DrawerTrigger>
      <DrawerContent>{renderContent()}</DrawerContent>
    </Drawer>
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
