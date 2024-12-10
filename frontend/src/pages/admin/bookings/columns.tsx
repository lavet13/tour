import { Button, buttonVariants } from '@/components/ui/button';
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
import { VariantProps } from 'class-variance-authority';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpCircle,
  CalendarIcon,
  Check,
  CheckCircle2,
  ChevronsUpDown,
  CircleFadingArrowUp,
  Edit,
  List,
  LucideProps,
  MoreHorizontal,
  Trash,
} from 'lucide-react';
import {
  forwardRef,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
  useState,
} from 'react';

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
    size: 180,
    cell: props => {
      return (
        <ComboBox
          size={'lg'}
          items={statusColumn}
          value={props.getValue() ?? ''}
          onValueChange={value => {
            // TODO: add graphql request for modifying the status of booking
            console.log({ value });
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
    accessorKey: 'createdAt',
    header: ({ column }) => <Header title='Создано' column={column} />,
    cell: props =>
      format(new Date(props.getValue() as number), 'dd.MM.yyyy, HH:mm:ss', {
        locale: ru,
      }),
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
    accessorKey: 'updatedAt',
    header: ({ column }) => <Header title='Изменено' column={column} />,
    cell: props =>
      format(new Date(props.getValue() as number), 'dd.MM.yyyy, HH:mm:ss', {
        locale: ru,
      }),
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
    accessorKey: 'travelDate',
    header: ({ column }) => <Header title='Желаемая дата' column={column} />,
    cell: props =>
      format(new Date(props.getValue() as number), 'dd.MM.yyyy, HH:mm:ss', {
        locale: ru,
      }),
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

    const [from, to] = value || [];
    console.log({ from, to });

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
          <CalendarIcon className='size-4' />
          {value?.length ? (
            <span className={cn('font-semibold')}>
              {from ? (
                to ? (
                  <>
                    {format(from, 'dd/MM')} - {format(to, 'dd/MM')}
                  </>
                ) : (
                  format(from, 'dd/MM')
                )
              ) : (
                <span className='whitespace-pre leading-3 text-center'>
                  Дата
                </span>
              )}
            </span>
          ) : (
            <span className='whitespace-pre leading-3 text-center'>Дата</span>
          )}
        </Button>
      );
    };

    const renderContent = () => {
      return (
        <Calendar
          className='w-fit mx-auto'
          locale={ru}
          mode='range'
          selected={{
            from,
            to,
          }}
          onSelect={date => {
            setValue([date?.from, date?.to]);
          }}
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

interface ComboBoxProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  value?: any;
  onValueChange?: (value: any) => void;
  items: any[];
  disabled?: boolean;
}

const ComboBox = forwardRef<HTMLButtonElement, ComboBoxProps>(
  (
    { value: valueProp, onValueChange, items, disabled, variant, size }: ComboBoxProps,
    ref,
  ) => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
    });

    const [open, setOpen] = useState(false);

    const handleItemSelect = (item: any) => {
      const selectedValue = item[1];
      setValue(selectedValue);
      setOpen(false); // Close the popover or drawer
    };
    const selectedItem = items.find(item => {
      return item[1] === value;
    });
    const label = selectedItem?.[0] ?? 'Выбрать';
    const Icon = selectedItem?.[2] as React.ElementType | undefined;
    const renderTrigger = () => {
      return (
        <Button
          ref={ref}
          variant={variant || 'outline'}
          role='combobox'
          size={size || 'sm'}
          disabled={disabled}
          className={cn(
            'flex w-full justify-between h-8',
            'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            !value && 'text-muted-foreground',
          )}
        >
          {Icon && <Icon />}
          {label}
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
                {items.map(item => {
                  const Icon = item[2] as React.ElementType | undefined;
                  const label = item[0];
                  const selectedValue = item[1];

                  return (
                    <CommandItem
                      key={selectedValue}
                      onSelect={() => handleItemSelect(item)}
                      className='flex items-center gap-3'
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            'h-4 w-4 text-muted-foreground',
                            value === selectedValue
                              ? 'opacity-100'
                              : 'opacity-40',
                          )}
                        />
                      )}
                      {label}
                      <Check
                        className={cn(
                          'ml-auto',
                          selectedValue === value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      );
    };

    return isDesktop ? (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{renderTrigger()}</PopoverTrigger>
        <PopoverContent className='p-0 w-fit'>{renderContent()}</PopoverContent>
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

  console.log({ columnFilterValue });
  return filterVariant === 'select' ? (
    <ComboBox
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
    <div className='flex gap-1 items-center'>
      <Input
        className='p-1 w-16 h-8'
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
        className='p-1 w-16 h-8'
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
