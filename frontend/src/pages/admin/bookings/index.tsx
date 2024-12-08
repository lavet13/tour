import { useInfiniteBookings } from '@/features/booking/use-infinite-bookings';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  Table as ReactTable,
  VisibilityState,
  SortingState,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import {
  BookingColumns,
  columns,
  columnTranslations,
} from '@/pages/admin/bookings/columns';
import { BookingStatus, InfiniteBookingsQuery } from '@/gql/graphql';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SonnerSpinner } from '@/components/sonner-spinner';
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type Booking = InfiniteBookingsQuery['bookings']['edges'][number];

interface TableCellSkeletonProps<TData> {
  table: ReactTable<TData>;
}

const TableCellSkeleton: FC<TableCellSkeletonProps<Booking>> = ({ table }) => {
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
            <Skeleton className='h-4 w-12 rounded-sm' />
          </TableCell>
        );
      })}
    </>
  );
};

const BookingsPage: FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  console.log({ columnFilters });

  const {
    status,
    fetchStatus,
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
    query: '',
    sorting,
    columnFilters,
  });

  const flatData = useMemo(
    () => data?.pages.flatMap(page => page.bookings.edges) ?? [],
    [data],
  );

  import.meta.env.DEV && console.log({ data, flatData });
  console.log({ fetchStatus, status });

  const table = useReactTable({
    data: flatData,
    columns,
    filterFns: {},
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
    debugColumns: true,
  });

  const { rows } = table.getRowModel();

  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? rows.length + 1 : rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 80, //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
  });

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

  return (
    <div className='container space-y-2'>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline' className='ml-auto'>
            Скрыть столбцы
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className='w-64 p-4'>
          <div className='space-y-2'>
            <h4 className='font-medium mb-4'>Выберите столбцы</h4>
            {table
              .getAllColumns()
              .filter(column => column.getCanHide())
              .map(column => (
                <div key={column.id} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`column-${column.id}`}
                    checked={column.getIsVisible()}
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                  />
                  <Label
                    htmlFor={`column-${column.id}`}
                    className='text-sm font-normal capitalize'
                  >
                    {columnTranslations[column.id as BookingColumns] ??
                      'no-name'}
                  </Label>
                </div>
              ))}
          </div>
        </PopoverContent>
      </Popover>
      <div
        ref={tableContainerRef}
        className='max-w-fit overflow-auto w-full relative max-h-[700px] rounded-md border'
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
                      className='select-none'
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        alignSelf: 'center',
                        height: 'fit-content',
                        padding: '0.2rem 1rem',
                        width: header.getSize(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
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

export default BookingsPage;
