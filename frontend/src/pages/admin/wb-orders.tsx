import { useInfiniteWbOrders } from '@/features/wb-orders';
import { FC, useMemo, useRef } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  Row,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { WbOrdersQuery } from '@/gql/graphql';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SonnerSpinner } from '@/components/sonner-spinner';

type WbOrder = WbOrdersQuery['wbOrders']['edges'][number];

const WbOrders: FC = () => {
  const { data, fetchNextPage, isFetching, isLoading } = useInfiniteWbOrders({
    take: 10,
    query: '',
  });

  const columns = useMemo<ColumnDef<WbOrder>[]>(() => {
    return [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 60,
      },
      {
        accessorKey: 'name',
        header: 'ФИО',
      },
      {
        accessorKey: 'phone',
        header: 'Телефон',
      },
      {
        accessorKey: 'qrCode',
        cell: props => {
          const qrCodeURL = props.getValue();
          const img = (
            <img
              className='w-12 rounded-sm'
              src={
                qrCodeURL
                  ? `/assets/qr-codes/${qrCodeURL}`
                  : `/images/no-preview.webp`
              }
              alt='qr-code'
            />
          );
          return img;
        },
      },
      {
        accessorKey: 'orderCode',
        header: 'Код заказа',
      },
      {
        accessorKey: 'wbPhone',
        header: 'Телефон WB',
      },
      {
        accessorKey: 'status',
        header: 'Статус',
      },
      {
        accessorKey: 'createdAt',
        header: 'Создано',
        cell: props =>
          format(new Date(props.getValue() as number), 'dd.MM.yyyy, HH:mm:ss', {
            locale: ru,
          }),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Изменено',
        cell: props =>
          format(new Date(props.getValue() as number), 'dd.MM.yyyy, HH:mm:ss', {
            locale: ru,
          }),
      },
    ];
  }, []);

  const flatData = useMemo(
    () => data?.pages.flatMap(page => page.wbOrders.edges) ?? [],
    [data],
  );

  console.log({ data, flatData });

  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    debugTable: true,
  });

  const { rows } = table.getRowModel();
  console.log({ rows });

  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 50,
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
  });

  if (isLoading) {
    return <SonnerSpinner />;
  }

  return (
    <>
    <div
        className="container"
        ref={tableContainerRef}
        style={{
          overflow: 'auto', //our scrollable table container
          position: 'relative', //needed for sticky header
          height: '300px', //should be a fixed height
        }}
      >
        {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
        <table style={{ display: 'grid' }}>
          <thead
            style={{
              display: 'grid',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}
          >
            {table.getHeaderGroups().map(headerGroup => (
              <tr
                key={headerGroup.id}
                style={{ display: 'flex', width: '100%' }}
              >
                {headerGroup.headers.map(header => {
                  return (
                    <th
                      key={header.id}
                      style={{
                        display: 'flex',
                        width: header.getSize(),
                      }}
                    >
                      {/* <div */}
                      {/*   {...{ */}
                      {/*     className: header.column.getCanSort() */}
                      {/*       ? 'cursor-pointer select-none' */}
                      {/*       : '', */}
                      {/*     onClick: header.column.getToggleSortingHandler(), */}
                      {/*   }} */}
                      {/* > */}
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {/* {{ */}
                        {/*   asc: ' 🔼', */}
                        {/*   desc: ' 🔽', */}
                        {/* }[header.column.getIsSorted() as string] ?? null} */}
                      {/* </div> */}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody
            style={{
              display: 'grid',
              height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
              position: 'relative', //needed for absolute positioning of rows
            }}
          >
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              const row = rows[virtualRow.index];

              return (
                <tr
                  data-index={virtualRow.index} //needed for dynamic row height measurement
                  ref={rowVirtualizer.measureElement} //measure dynamic row height
                  key={row.id}
                  style={{
                    display: 'flex',
                    position: 'absolute',
                    transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                    width: '100%',
                  }}
                >
                  {row.getVisibleCells().map(cell => {
                    return (
                      <td
                        key={cell.id}
                        style={{
                          display: 'flex',
                          width: cell.column.getSize(),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {isFetching && <div>Fetching More...</div>}
    </>
  );
};

export default WbOrders;
