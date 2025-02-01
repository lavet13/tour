import { Button } from '@/components/ui/button';
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useUpdateBookingStatus } from '@/features/booking';
import { InfiniteBookingsQuery, BookingStatus } from '@/gql/graphql';
import { parseIntSafe } from '@/helpers/parse-int-safe';
import { cn } from '@/lib/utils';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { client } from '@/react-query';
import { Column, ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  CircleFadingArrowUp,
  Edit,
  List,
  LucideProps,
  MoreHorizontal,
  Trash,
} from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes, useState } from 'react';
import { toast } from 'sonner';
import { ComboBox } from '@/components/combo-box-filter';
import { DatePicker } from '@/components/date-picker-filter';

type Booking = Omit<
  InfiniteBookingsQuery['bookings']['edges'][number],
  '__typename'
>;
export type BookingColumns = Exclude<keyof Booking, '__typename'>;

export const columnTranslations = {
  id: 'ID',
  firstName: 'Имя',
  lastName: 'Фамилия',
  commentary: 'Комментарий',
  seatsCount: 'Кол-во мест',
  status: 'Статус',
  createdAt: 'Создано',
  updatedAt: 'Изменено',
  travelDate: 'Желаемая дата',
  phoneNumber: 'Телефон',
} as const satisfies Record<BookingColumns, string>;

type StatusColumns = keyof typeof BookingStatus;

const statusTranslation = {
  Pending: 'Ждёт',
  Confirmed: 'Принят',
} as const satisfies Record<StatusColumns, string>;

const statusIcons = {
  Pending: CircleFadingArrowUp,
  Confirmed: CheckCircle2,
} as const satisfies Record<
  StatusColumns,
  ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
>;

const statusColumn = Object.entries(BookingStatus).map(([key, value]) => [
  statusTranslation[key as StatusColumns],
  value,
  statusIcons[key as StatusColumns],
]);

interface CustomColumnMeta {
  filterVariant?: 'text' | 'range' | 'select';
}

export const columns: ColumnDef<Booking, CustomColumnMeta>[] = [
  {
    id: 'lastName',
    accessorKey: 'lastName',
    cell: props => (
      <span className='overflow-hidden text-ellipsis'>
        {String(props.getValue() ?? '')}
      </span>
    ),
    header: ({ column }) => {
      return <Header title='Фамилия' column={column} />;
    },
    minSize: 145,
    size: 150,
  },
  {
    size: 140,
    minSize: 120,
    cell: props => (
      <span className='overflow-hidden text-ellipsis'>
        {String(props.getValue() ?? '')}
      </span>
    ),
    id: 'firstName',
    accessorKey: 'firstName',
    header: ({ column }) => {
      return <Header title='Имя' column={column} />;
    },
  },
  {
    size: 150,
    minSize: 140,
    cell: props => (
      <span className='overflow-hidden text-ellipsis'>
        {String(props.getValue() ?? '')}
      </span>
    ),
    id: 'phoneNumber',
    accessorKey: 'phoneNumber',
    header: ({ column }) => {
      return <Header title='Телефон' column={column} />;
    },
  },
  {
    size: 160,
    minSize: 160,
    cell: props => (
      <span className='overflow-hidden text-ellipsis'>
        {String(props.getValue() ?? '')}
      </span>
    ),
    id: 'seatsCount',
    accessorKey: 'seatsCount',
    header: ({ column }) => {
      return <Header title='Кол-во мест' column={column} />;
    },
    meta: {
      filterVariant: 'range',
    },
    filterFn: 'inNumberRange',
  },
  {
    size: 160,
    minSize: 160,
    cell: props => (
      <span className='overflow-hidden text-ellipsis'>
        {String(props.getValue() ?? '')}
      </span>
    ),
    id: 'commentary',
    accessorKey: 'commentary',
    header: ({ column }) => {
      return <Header title='Комментарий' column={column} />;
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    minSize: 200,
    size: 200,
    cell: props => {
      const id = props.row.original.id;
      const status = props.row.original.status;
      const { mutateAsync, isPending } = useUpdateBookingStatus();
      const [previousStatus, setPreviousStatus] =
        useState<BookingStatus>(status);

      return (
        <ComboBox
          isLoading={isPending}
          size={'lg'}
          items={statusColumn}
          value={props.getValue() ?? ''}
          onValueChange={async value => {
            setPreviousStatus(status);

            const promise = new Promise(async (resolve, reject) => {
              try {
                const data = await mutateAsync({
                  input: { id, status: value },
                });
                await client.invalidateQueries({
                  queryKey: ['InfiniteBookings'],
                });

                resolve(data);
              } catch (error) {
                reject(error);
              }
            });
            toast.promise(promise, {
              loading: 'Обновление статуса...',
              duration: 10000,
              action: {
                label: 'Отменить',
                onClick: async () => {
                  try {
                    await mutateAsync({
                      input: { id, status: previousStatus },
                    });
                    await client.invalidateQueries({
                      queryKey: ['InfiniteBookings'],
                    });

                    toast.success('Отмена статуса выполнена успешно!');
                  } catch (error) {
                    toast.error('Не удалось отменить изменения статуса!');
                  }
                },
              },
              success: () => {
                return `Статус изменен!`;
              },
              error: error => {
                if (isGraphQLRequestError(error)) {
                  return error.response.errors[0].message;
                } else if (error instanceof Error) {
                  return error.message;
                }
                return 'Произошла ошибка!';
              },
            });
          }}
        />
      );
    },
    header: ({ column }) => {
      return <Header title='Статус' column={column} />;
    },
    meta: {
      filterVariant: 'select',
    },
  },
  {
    minSize: 160,
    size: 160,
    enableGlobalFilter: false,
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }) => <Header title='Создано' column={column} />,
    cell: props => (
      <span className='overflow-hidden text-ellipsis'>
        {format(new Date(props.getValue() as number), 'dd.MM.yyyy, HH:mm:ss', {
          locale: ru,
        })}
      </span>
    ),
    sortingFn: (rowA, rowB) =>
      rowA.original.createdAt - rowB.original.createdAt,
    filterFn: (row, columnId, filterValue) => {
      const rowValue = new Date(row.getValue(columnId));
      const [startDate, endDate] = filterValue || [];
      if (!startDate && !endDate) return true; // No filter applied
      if (startDate && endDate) {
        return rowValue >= new Date(startDate) && rowValue <= new Date(endDate);
      }
      if (startDate) return rowValue >= new Date(startDate);
      if (endDate) return rowValue <= new Date(endDate);
      return true;
    },
    meta: {
      filterVariant: 'dateRange',
    },
  },
  {
    minSize: 160,
    size: 160,
    enableGlobalFilter: false,
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: ({ column }) => <Header title='Изменено' column={column} />,
    cell: props => (
      <span className='overflow-hidden text-ellipsis'>
        {format(new Date(props.getValue() as number), 'dd.MM.yyyy, HH:mm:ss', {
          locale: ru,
        })}
      </span>
    ),
    sortingFn: (rowA, rowB) => {
      return rowA.original.updatedAt - rowB.original.updatedAt;
    },
    filterFn: (row, columnId, filterValue) => {
      const rowValue = new Date(row.getValue(columnId));
      const [startDate, endDate] = filterValue || [];
      if (!startDate && !endDate) return true; // No filter applied
      if (startDate && endDate) {
        return rowValue >= new Date(startDate) && rowValue <= new Date(endDate);
      }
      if (startDate) return rowValue >= new Date(startDate);
      if (endDate) return rowValue <= new Date(endDate);
      return true;
    },
    meta: {
      filterVariant: 'dateRange',
    },
  },
  {
    minSize: 160,
    size: 160,
    enableGlobalFilter: false,
    id: 'travelDate',
    accessorKey: 'travelDate',
    header: ({ column }) => <Header title='Дата поездки' column={column} />,
    cell: props => (
      <span className='overflow-hidden text-ellipsis'>
        {format(new Date(props.getValue() as number), 'dd.MM.yyyy, HH:mm:ss', {
          locale: ru,
        })}
      </span>
    ),
    sortingFn: (rowA, rowB) => {
      return rowA.original.travelDate - rowB.original.travelDate;
    },
    filterFn: (row, columnId, filterValue) => {
      const rowValue = new Date(row.getValue(columnId));
      const [startDate, endDate] = filterValue || [];
      if (!startDate && !endDate) return true; // No filter applied
      if (startDate && endDate) {
        return rowValue >= new Date(startDate) && rowValue <= new Date(endDate);
      }
      if (startDate) return rowValue >= new Date(startDate);
      if (endDate) return rowValue <= new Date(endDate);
      return true;
    },
    meta: {
      filterVariant: 'dateRange',
    },
  },
  {
    enableResizing: false,
    id: 'actions',
    size: 70,
    enableHiding: false,
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Открыть меню</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText('payment.id')}
            >
              <Edit />
              Изменить
            </DropdownMenuItem>
            <DropdownMenuItem className='text-destructive focus:text-destructive focus:bg-destructive/10'>
              <Trash />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface HeaderProps<TData> {
  title: string;
  column: Column<TData, unknown>;
  className?: string;
}

function Header<TData>({ title, column, className }: HeaderProps<TData>) {
  const isSorted = column.getIsSorted() as 'asc' | 'desc' | false;

  return (
    <div className='flex flex-1 flex-col space-y-1'>
      {column.getCanSort() ? (
        <Button
          className={cn('gap-0 [&_svg]:size-3.5 h-7', className)}
          size='sm'
          variant='ghost'
          onClick={column.getToggleSortingHandler()}
        >
          {title}
          {isSorted ? (
            isSorted === 'asc' ? (
              <ArrowUp className='ml-2 h-4 w-4' />
            ) : (
              <ArrowDown className='ml-2 h-4 w-4' />
            )
          ) : null}
        </Button>
      ) : (
        <span className='flex w-full justify-center items-center self-center h-9 px-3'>
          {title}
        </span>
      )}
      {column.getCanFilter() ? (
        <div className='flex flex-1'>
          <Filter column={column} />
        </div>
      ) : null}
    </div>
  );
}

interface FilterProps<TData> {
  column: Column<TData, unknown>;
}

function Filter<TData>({ column }: FilterProps<TData>) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};

  console.log({ columnFilterValue });
  return filterVariant === 'select' ? (
    <ComboBox
      // [label, value, icon]
      items={[['Весь список', '', List], ...statusColumn]}
      value={columnFilterValue?.toString() ?? ''}
      onValueChange={value => {
        column.setFilterValue(value);
      }}
    />
  ) : filterVariant === 'dateRange' ? (
    <DatePicker
      value={columnFilterValue ?? []}
      onValueChange={value => {
        column.setFilterValue(value);
      }}
    />
  ) : filterVariant === 'range' ? (
    <div className='flex flex-1 gap-1 items-center'>
      <Input
        className='p-1 w-16 h-8 flex-1'
        type='number'
        value={(columnFilterValue as [string, string])?.[0] ?? ''}
        onChange={e => {
          const number = parseIntSafe(e.target.value);
          const value = number ? `${number}` : '';
          column.setFilterValue((old: [string, string]) => [value, old?.[1]]);
        }}
        placeholder={`Мин`}
      />
      <Input
        className='p-1 w-16 h-8 flex-1'
        type='number'
        value={(columnFilterValue as [string, string])?.[1] ?? ''}
        onChange={e => {
          const number = parseIntSafe(e.target.value);
          const value = number ? `${number}` : '';
          column.setFilterValue((old: [string, string]) => [old?.[0], value]);
        }}
        placeholder={`Макс`}
      />
    </div>
  ) : (
    <Input
      className='p-1 px-2 h-8'
      placeholder={'Искать...'}
      value={(columnFilterValue ?? '') as string}
      onChange={e => {
        column.setFilterValue(e.target.value);
      }}
    />
  );
}
