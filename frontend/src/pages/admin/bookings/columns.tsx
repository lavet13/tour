import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InfiniteBookingsQuery, BookingStatus } from '@/gql/graphql';
import { parseIntSafe } from '@/helpers/parse-int-safe';
import { useControllableState } from '@/hooks/use-controllable-state';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { Column, ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  ArrowDown,
  ArrowUp,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Edit,
  MoreHorizontal,
  Trash,
} from 'lucide-react';
import { forwardRef, useState } from 'react';

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

interface CustomColumnMeta {
  filterVariant?: 'text' | 'range' | 'select';
}

export const columns: ColumnDef<Booking, CustomColumnMeta>[] = [
  {
    accessorKey: 'lastName',
    header: ({ column }) => {
      return <Header title='Фамилия' column={column} />;
    },
  },
  {
    accessorKey: 'firstName',
    header: ({ column }) => {
      return <Header title='Имя' column={column} />;
    },
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => {
      return <Header title='Телефон' column={column} />;
    },
  },
  {
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
    accessorKey: 'commentary',
    header: ({ column }) => {
      return <Header title='Комментарий' column={column} />;
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return <Header title='Статус' column={column} />;
    },
    meta: {
      filterVariant: 'select',
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <Header title='Создано' column={column} />,
    cell: props =>
      format(new Date(props.getValue() as number), 'dd.MM.yyyy, HH:mm:ss', {
        locale: ru,
      }),
    sortingFn: (rowA, rowB) =>
      rowA.original.createdAt - rowB.original.createdAt,
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => <Header title='Изменено' column={column} />,
    cell: props =>
      format(new Date(props.getValue() as number), 'dd.MM.yyyy, HH:mm:ss', {
        locale: ru,
      }),
    sortingFn: (rowA, rowB) => {
      return rowA.original.updatedAt - rowB.original.updatedAt;
    },
  },
  {
    accessorKey: 'travelDate',
    header: ({ column }) => <Header title='Желаемая дата' column={column} />,
    cell: props =>
      format(new Date(props.getValue() as number), 'dd.MM.yyyy, HH:mm:ss', {
        locale: ru,
      }),
    sortingFn: (rowA, rowB) => {
      return rowA.original.travelDate - rowB.original.travelDate;
    },
  },
  {
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
          className={cn('gap-0 [&_svg]:size-3.5', className)}
          size='sm'
          variant='ghost'
          onClick={() => column.toggleSorting(isSorted === 'asc')}
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

type DatePickerProps = {
  name: string;
  value?: any;
  onValueChange?: (value: any) => void;
  disabled?: boolean;
};

const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  ({ value: valueProp, onValueChange, disabled }, ref) => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
    });

    const [open, setOpen] = useState(false);

    const renderTrigger = () => {
      return (
        <Button
          ref={ref}
          variant='outline'
          size='sm'
          className={cn(
            'flex w-full',
            'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
          disabled={disabled}
        >
          <CalendarIcon className='mr-2 size-4' />
          {value ? (
            <span className={cn('font-semibold')}>
              {format(value, 'PPP', {
                locale: ru,
              })}
            </span>
          ) : (
            <span className='whitespace-pre leading-3 text-center'>
              Выберите дату
            </span>
          )}
        </Button>
      );
    };

    const renderContent = () => {
      return (
        <Calendar
          className='w-fit mx-auto'
          locale={ru}
          mode='single'
          selected={value}
          onSelect={date => setValue(date)}
          initialFocus
        />
      );
    };

    return isDesktop ? (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{renderTrigger()}</PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
          {renderContent()}
        </PopoverContent>
      </Popover>
    ) : (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{renderTrigger()}</DrawerTrigger>
        <DrawerContent className='min-h-[380px]'>
          {renderContent()}
        </DrawerContent>
      </Drawer>
    );
  },
);

interface ComboBoxProps {
  value?: any;
  onValueChange?: (value: any) => void;
  items: any[];
  disabled?: boolean;
}

const ComboBox = forwardRef<HTMLButtonElement, ComboBoxProps>(
  (
    { value: valueProp, onValueChange, items, disabled }: ComboBoxProps,
    ref,
  ) => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
    });

    const [open, setOpen] = useState(false);

    const handleItemSelect = (item: any) => {
      console.log({ item });
      setValue(item[1]);
      setOpen(false); // Close the popover or drawer
    };

    const renderTrigger = () => {
      return (
        <Button
          ref={ref}
          variant='outline'
          role='combobox'
          size='sm'
          disabled={disabled}
          className={cn(
            'flex w-full justify-between h-8',
            'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            !value && 'text-muted-foreground',
          )}
        >
          {items.find(item => item[1] === value)?.[0] ?? 'Выберите куда'}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      );
    };

    const renderContent = () => {
      return (
        <Command>
          <CommandList>
            <CommandEmpty>Не найдено</CommandEmpty>
            <CommandGroup>
              <ScrollArea
                className={cn(
                  items.length >= 7 && 'h-[calc(14rem)] -mr-px pr-3',
                )}
              >
                {items.map(item => (
                  <CommandItem
                    key={item[1]}
                    onSelect={() => handleItemSelect(item)}
                  >
                    {item[0]}
                    <Check
                      className={cn(
                        'ml-auto',
                        item[1] === value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      );
    };

    return isDesktop ? (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{renderTrigger()}</PopoverTrigger>
        <PopoverContent className='p-0 w-[140px]'>
          {renderContent()}
        </PopoverContent>
      </Popover>
    ) : (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{renderTrigger()}</DrawerTrigger>
        <DrawerContent>{renderContent()}</DrawerContent>
      </Drawer>
    );
  },
);

interface FilterProps<TData> {
  column: Column<TData, unknown>;
}

function Filter<TData>({ column }: FilterProps<TData>) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};

  const statusColumn = Object.entries(BookingStatus).map(([key, value]) => [
    statusTranslation[key as StatusColumns],
    value,
  ]);
  return filterVariant === 'select' ? (
    <ComboBox
      items={[['Весь список', ''], ...statusColumn]}
      value={columnFilterValue?.toString() ?? ''}
      onValueChange={value => {
        console.log({ selectValue: value });
        column.setFilterValue(value);
      }}
    />
  ) : filterVariant === 'date' ? null : filterVariant === 'range' ? (
    <div className='flex gap-1 items-center'>
      <Input
        className='p-1 w-16 h-8'
        type='number'
        value={(columnFilterValue as [string, string])?.[0] ?? ''}
        onChange={e => {
          const number = parseIntSafe(e.target.value);
          const value = number ? `${number}` : '';
          column.setFilterValue((old: [string, string]) => [
            value,
            old?.[1],
          ]);
        }}
        placeholder={`Мин`}
      />
      <Input
        className='p-1 w-16 h-8'
        type='number'
        value={(columnFilterValue as [string, string])?.[1] ?? ''}
        onChange={e => {
          const number = parseIntSafe(e.target.value);
          const value = number ? `${number}` : '';
          column.setFilterValue((old: [string, string]) => [
            old?.[0],
            value,
          ])
        }
        }
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
