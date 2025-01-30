import { Column, ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, MoreHorizontal, List, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ComboBox } from '@/components/combo-box-filter';
import { DatePicker } from '@/components/date-picker-filter';

import { type Schedule } from '.';
interface CustomColumnMeta {
  filterVariant?: 'text' | 'range' | 'select';
}

export const columns: ColumnDef<Schedule, CustomColumnMeta>[] = [
  {
    minSize: 160,
    size: 160,
    enableGlobalFilter: false,
    id: 'travelDate',
    accessorKey: 'travelDate',
    header: ({ column }) => <Header title='Желаемая дата' column={column} />,
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
    enableResizing: false,
    id: 'actions',
    size: 70,
    enableHiding: false,
    cell: ({ row }) => {
      const { id } = row.original;
      console.log({ id });

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
      items={[['Весь список', '', List]]}
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
