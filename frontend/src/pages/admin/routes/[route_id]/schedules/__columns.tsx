import { Column, ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowDown,
  ArrowUp,
  MoreHorizontal,
  List,
  Trash,
  CirclePlus,
  CircleMinus,
  Loader2,
} from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { KeyboardEvent, useEffect, useState } from 'react';
import { useUpdateSchedule } from '@/features/schedule/api/mutations';
import { client as queryClient } from '@/react-query';
import { toast } from 'sonner';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { DaysOfWeek } from '@/gql/graphql';
import { client } from '@/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ScheduleColumns = Exclude<keyof Schedule, '__typename' | 'route'>;
export const columnTranslations = {
  id: 'ID',
  dayOfWeek: 'День недели',
  startTime: 'Время отправления',
  endTime: 'Время прибытия',
  isActive: 'Активный рейс',
  createdAt: 'Создано',
  updatedAt: 'Обновлено',
} as const satisfies Record<ScheduleColumns, string>;

const daysOfWeekRu = {
  [DaysOfWeek.Monday]: 'Понедельник',
  [DaysOfWeek.Tuesday]: 'Вторник',
  [DaysOfWeek.Wednesday]: 'Среда',
  [DaysOfWeek.Thursday]: 'Четверг',
  [DaysOfWeek.Friday]: 'Пятница',
  [DaysOfWeek.Saturday]: 'Суббота',
  [DaysOfWeek.Sunday]: 'Воскресенье',
};

const allIsActiveOptions = [
  ['Все', '', List],
  ['Активно', true, CirclePlus],
  ['Не активно', false, CircleMinus],
] as Array<[string, boolean | string, typeof List]>;

export const columns: ColumnDef<Schedule, unknown>[] = [
  {
    minSize: 170,
    size: 170,
    id: 'dayOfWeek',
    accessorKey: 'dayOfWeek',
    header: ({ column }) => {
      return <Header title={columnTranslations['dayOfWeek']} column={column} />;
    },
    cell({
      getValue,
      row: {
        original: { id: originalId },
      },
      column: { id: columnId },
    }) {
      const enumValue = getValue() as string;
      const [isEditing, setIsEditing] = useState(false);
      const [value, setValue] = useState(enumValue);
      const [previousValue, setPreviousValue] = useState(enumValue);

      const { mutate: updateSchedule, isPending } = useUpdateSchedule();

      useEffect(() => {
        setValue(enumValue);
      }, [enumValue]);

      const handleUpdate = async (newValue: string) => {
        if (newValue === enumValue) {
          return setIsEditing(false);
        }

        setPreviousValue(enumValue);

        const promise = new Promise((resolve, reject) => {
          updateSchedule(
            { input: { id: originalId, [columnId]: newValue } },
            {
              onSuccess: async data => {
                await client.invalidateQueries({
                  queryKey: ['GetSchedulesByRoute'],
                });
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
                    await client.invalidateQueries({
                      queryKey: ['GetSchedulesByRoute'],
                    });
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
            return `\`${columnTranslations[columnId as ScheduleColumns]}\` изменёно ${daysOfWeekRu[enumValue as DaysOfWeek]} → ${daysOfWeekRu[newValue as DaysOfWeek]}`;
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
        setIsEditing(false);
      };

      return (
        <Select value={value} onValueChange={handleUpdate}>
          <SelectTrigger className='h-8'>
            <SelectValue placeholder='Выберите день' />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(daysOfWeekRu)?.map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
    meta: {
      filterVariant: 'select',
      items: [['ALL', 'Все дни'], ...Object.entries(daysOfWeekRu)],
    },
  },
  {
    minSize: 190,
    size: 190,
    id: 'startTime',
    accessorKey: 'startTime',
    header: ({ column }) => {
      console.log({ column });
      return <Header title={columnTranslations['startTime']} column={column} />;
    },
    cell: ({
      getValue,
      row: {
        original: { id: originalId },
      },
      column: { id: columnId },
    }) => {
      const initialValue = getValue() as string;
      const [isEditing, setIsEditing] = useState(false);
      const [value, setValue] = useState<string | undefined>(initialValue);
      const [previousValue, setPreviousValue] = useState(initialValue);

      useEffect(() => {
        setValue(initialValue);
      }, [initialValue]);

      const { mutate: updateSchedule, isPending } = useUpdateSchedule();

      const handleUpdate = (newValue: string) => {
        if (newValue !== initialValue) {
          setPreviousValue(initialValue);
          const promise = new Promise((resolve, reject) => {
            updateSchedule(
              { input: { id: originalId, [columnId]: newValue } },
              {
                onSuccess: async data => {
                  await client.invalidateQueries({
                    queryKey: ['GetSchedulesByRoute'],
                  });
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
                      await client.invalidateQueries({
                        queryKey: ['GetSchedulesByRoute'],
                      });
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

      const onBlur = () => {
        if (value === undefined) {
          return toast.error('Укажите кол-во мест!');
        }
        handleUpdate(value);
      };

      const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
          e.preventDefault();
          if (value === undefined) {
            return toast.error('Укажите кол-во мест!');
          }
          handleUpdate(value);
        }
      };

      if (isEditing) {
        return (
          <Input
            type='time'
            className='p-1 px-2 h-8'
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            autoFocus
          />
        );
      }

      return (
        <div
          className='flex items-center overflow-hidden cursor-text gap-1'
          onClick={() => setIsEditing(true)}
        >
          {isPending && (
            <Loader2 className='min-w-4 min-h-4 size-4 animate-spin' />
          )}
          <span className='truncate'>{initialValue}</span>
        </div>
      );
    },
  },
  {
    minSize: 180,
    size: 180,
    id: 'endTime',
    accessorKey: 'endTime',
    header: ({ column }) => {
      console.log({ column });
      return <Header title={columnTranslations['endTime']} column={column} />;
    },
    cell: ({
      getValue,
      row: {
        original: { id: originalId },
      },
      column: { id: columnId },
    }) => {
      const initialValue = getValue() as string;
      const [isEditing, setIsEditing] = useState(false);
      const [value, setValue] = useState<string | undefined>(initialValue);
      const [previousValue, setPreviousValue] = useState(initialValue);

      useEffect(() => {
        setValue(initialValue);
      }, [initialValue]);

      const { mutate: updateSchedule, isPending } = useUpdateSchedule();

      const handleUpdate = (newValue: string) => {
        if (newValue !== initialValue) {
          setPreviousValue(initialValue);
          const promise = new Promise((resolve, reject) => {
            updateSchedule(
              { input: { id: originalId, [columnId]: newValue } },
              {
                onSuccess: async data => {
                  await client.invalidateQueries({
                    queryKey: ['GetSchedulesByRoute'],
                  });
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
                      await client.invalidateQueries({
                        queryKey: ['GetSchedulesByRoute'],
                      });
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

      const onBlur = () => {
        if (value === undefined) {
          return toast.error('Укажите кол-во мест!');
        }
        handleUpdate(value);
      };

      const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
          e.preventDefault();
          if (value === undefined) {
            return toast.error('Укажите кол-во мест!');
          }
          handleUpdate(value);
        }
      };

      if (isEditing) {
        return (
          <Input
            type='time'
            className='p-1 px-2 h-8'
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            autoFocus
          />
        );
      }

      return (
        <div
          className='flex items-center overflow-hidden cursor-text gap-1'
          onClick={() => setIsEditing(true)}
        >
          {isPending && (
            <Loader2 className='min-w-4 min-h-4 size-4 animate-spin' />
          )}
          <span className='truncate'>{initialValue}</span>
        </div>
      );
    },
  },
  {
    minSize: 160,
    size: 160,
    enableGlobalFilter: false,
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <Header title={columnTranslations['createdAt']} column={column} />
    ),
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
    header: ({ column }) => (
      <Header title={columnTranslations['updatedAt']} column={column} />
    ),
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
    id: 'isActive',
    accessorKey: 'isActive',
    minSize: 190,
    size: 190,
    header: ({ column }) => (
      <Header title={columnTranslations['isActive']} column={column} />
    ),
    cell: props => {
      const id = props.row.original.id;
      const isActive = props.row.original.isActive;
      const [previousIsActive, setPreviousIsActive] = useState(isActive);
      const { mutateAsync, isPending } = useUpdateSchedule();

      return (
        <Switch
          disabled={isPending}
          checked={!!props.getValue()}
          onCheckedChange={async checked => {
            setPreviousIsActive(isActive);

            const promise = new Promise(async (resolve, reject) => {
              try {
                const data = await mutateAsync({
                  input: { id, isActive: checked },
                });
                await queryClient.invalidateQueries({
                  queryKey: ['GetSchedulesByRoute'],
                });

                resolve(data);
              } catch (error) {
                reject(error);
              }
            });

            toast.promise(promise, {
              loading: 'Обновление доступа...',
              duration: 10000,
              action: {
                label: 'Отменить',
                onClick: async () => {
                  try {
                    await mutateAsync({
                      input: { id, isActive: previousIsActive },
                    });
                    await queryClient.invalidateQueries({
                      queryKey: ['GetSchedulesByRoute'],
                    });

                    toast.success('Отмена доступа выполнена успешно!');
                  } catch (error) {
                    toast.error('Не удалось отменить изменения доступа!');
                  }
                },
              },
              success: () => {
                return `Доступ изменен!`;
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
    meta: {
      filterVariant: 'combobox',
      items: allIsActiveOptions,
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
  const { filterVariant, items } = column.columnDef.meta ?? {};

  switch (filterVariant) {
    case 'select':
      return (
        <Select
          value={(columnFilterValue as string) ?? 'ALL'}
          onValueChange={value =>
            column.setFilterValue(value === 'ALL' ? '' : value)
          }
        >
          <SelectTrigger className='h-8'>
            <SelectValue placeholder='Выберите день' />
          </SelectTrigger>
          <SelectContent>
            {items?.map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'combobox':
      return (
        <ComboBox
          items={items ?? []}
          value={columnFilterValue ?? ''}
          onValueChange={value => {
            column.setFilterValue(value);
          }}
        />
      );
    case 'dateRange':
      return (
        <DatePicker
          value={columnFilterValue ?? []}
          onValueChange={value => {
            column.setFilterValue(value);
          }}
        />
      );
    default:
      return (
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
}
