import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdateBooking } from '@/features/booking/api/mutations';
import {
  InfiniteBookingsQuery,
  BookingStatus,
  RouteDirection,
} from '@/gql/graphql';
import { parseIntSafe, cn } from '@/lib/utils';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { client } from '@/react-query';
import { Column, ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ru as fnsRU } from 'date-fns/locale';
import RPNInput, {
  isPossiblePhoneNumber,
} from 'react-phone-number-input/input';
import ru from 'react-phone-number-input/locale/ru.json';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  CircleFadingArrowUp,
  Edit,
  List,
  Loader2,
  LucideProps,
} from 'lucide-react';
import {
  ForwardRefExoticComponent,
  KeyboardEvent,
  RefAttributes,
  useEffect,
  useState,
} from 'react';
import { toast } from 'sonner';
import { ComboBox } from '@/components/combo-box-filter';
import { DatePicker } from '@/components/date-picker-filter';
import { NumberFormatValues, NumericFormat } from 'react-number-format';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';

type Booking = Omit<
  InfiniteBookingsQuery['bookings']['edges'][number],
  '__typename'
>;
export type BookingColumns = Exclude<keyof Booking, '__typename'>;

export const columnTranslations = {
  id: 'ID',
  firstName: 'Имя',
  lastName: 'Фамилия',
  seatsCount: 'Кол-во мест',
  status: 'Статус',
  createdAt: 'Создано',
  updatedAt: 'Изменено',
  travelDate: 'Желаемая дата',
  phoneNumber: 'Телефон 1',
  telegram: 'Телеграм 1',
  whatsapp: 'Ватсап 1',
  extraPhoneNumber: 'Телефон 2',
  extraTelegram: 'Телеграм 2',
  extraWhatsapp: 'Ватсап 2',
  direction: 'Направление',
  route: 'Маршрут',
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

const statusOptions = Object.entries(BookingStatus).map(([key, value]) => [
  statusTranslation[key as StatusColumns],
  value,
  statusIcons[key as StatusColumns],
]);

const allStatusOptions = [['Весь список', '', List], ...statusOptions] as Array<
  [string, BookingStatus, typeof List]
>;

export const columns: ColumnDef<Booking, unknown>[] = [
  {
    id: 'lastName',
    accessorKey: 'lastName',
    header: ({ column }) => {
      return <Header title='Фамилия' column={column} />;
    },
    minSize: 120,
    size: 150,
  },
  {
    size: 140,
    minSize: 110,
    id: 'firstName',
    accessorKey: 'firstName',
    header: ({ column }) => {
      return <Header title='Имя' column={column} />;
    },
  },
  {
    size: 160,
    minSize: 120,
    id: 'phoneNumber',
    accessorKey: 'phoneNumber',
    header: ({ column }) => {
      return <Header title='Телефон 1' column={column} />;
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
      const [value, setValue] = useState(initialValue);
      const [previousValue, setPreviousValue] = useState(initialValue);

      useEffect(() => {
        setValue(initialValue);
      }, [initialValue]);

      const { mutate: updateBooking, isPending } = useUpdateBooking();

      const handleUpdate = async (newValue: string) => {
        if (newValue === initialValue) {
          return setIsEditing(false);
        }

        if (newValue.length && !isPossiblePhoneNumber(newValue)) {
          return toast.error('Проверьте правильность ввода телефона!');
        }

        setPreviousValue(initialValue);

        const promise = new Promise((resolve, reject) => {
          updateBooking(
            { input: { id: originalId, [columnId]: newValue } },
            {
              onSuccess: async data => {
                await client.invalidateQueries({
                  queryKey: ['InfiniteBookings'],
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
          loading: `Обновление поля \`${columnTranslations[columnId as BookingColumns]}\`...`,
          duration: 10000,
          action: {
            label: 'Отменить',
            onClick() {
              updateBooking(
                { input: { id: originalId, [columnId]: previousValue } },
                {
                  async onSuccess() {
                    await client.invalidateQueries({
                      queryKey: ['InfiniteBookings'],
                    });
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
        setIsEditing(false);
      };

      const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
          e.preventDefault();
          if (value !== undefined) {
            handleUpdate(value);
          }
        }
      };

      const onBlur = () => {
        if (value !== undefined) {
          handleUpdate(value);
        }
      };

      if (isEditing) {
        return (
          <RPNInput
            className='p-1 px-2 h-8'
            inputComponent={Input}
            labels={ru}
            placeholder='Номер телефона'
            value={value}
            onChange={value => setValue(value || '')}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
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
  },
  {
    size: 160,
    minSize: 120,
    id: 'telegram',
    accessorKey: 'telegram',
    header: ({ column }) => {
      return <Header title='Телеграм 1' column={column} />;
    },
    cell: ({ getValue, row }) => {
      const initialValue = getValue() as boolean;
      const phone = row.original.phoneNumber;

      return (
        <>
          {initialValue === true && (
            <Button
              className='w-full justify-start p-0 h-auto'
              variant='link'
              asChild
            >
              <Link
                className='w-full'
                target='_blank'
                to={`https://t.me/${phone}`}
              >
                <span
                  title={`https://t.me/${phone}`}
                  className='truncate block w-full'
                >
                  t.me/{phone}
                </span>
              </Link>
            </Button>
          )}
          {initialValue === false && (
            <div className='flex items-center text-muted-foreground overflow-hidden cursor-default gap-1'>
              <span title={'Не указан'} className='truncate'>
                Не указан
              </span>
            </div>
          )}
        </>
      );
    },
    enableColumnFilter: false,
  },
  {
    size: 160,
    minSize: 120,
    id: 'whatsapp',
    accessorKey: 'whatsapp',
    header: ({ column }) => {
      return <Header title='Ватсап 1' column={column} />;
    },
    cell: ({ getValue, row }) => {
      const initialValue = getValue() as boolean;
      const phone = row.original.phoneNumber;

      return (
        <>
          {initialValue === true && (
            <Button
              className='w-full justify-start p-0 h-auto'
              variant='link'
              asChild
            >
              <Link
                className='w-full'
                target='_blank'
                to={`https://wa.me/${phone}`}
              >
                <span
                  title={`https://wa.me/${phone}`}
                  className='truncate block w-full'
                >
                  wa.me/{phone}
                </span>
              </Link>
            </Button>
          )}
          {initialValue === false && (
            <div className='flex items-center text-muted-foreground overflow-hidden cursor-default gap-1'>
              <span title={'Не указан'} className='truncate'>
                Не указан
              </span>
            </div>
          )}
        </>
      );
    },
    enableColumnFilter: false,
  },
  {
    size: 160,
    minSize: 120,
    id: 'extraPhoneNumber',
    accessorFn: (row) => row.extraPhoneNumber ?? '',
    header: ({ column }) => {
      return <Header title='Телефон 2' column={column} />;
    },
    cell: ({
      getValue,
      row: {
        original: { id: originalId },
      },
      column: { id: columnId },
    }) => {
      // TODO: having null issue
      const initialValue = getValue() as string;
      const [isEditing, setIsEditing] = useState(false);
      const [value, setValue] = useState(initialValue);
      const [previousValue, setPreviousValue] = useState(initialValue);

      useEffect(() => {
        setValue(initialValue);
      }, [initialValue]);

      const { mutate: updateBooking, isPending } = useUpdateBooking();

      const handleUpdate = async (newValue: string) => {
        if (newValue === initialValue) {
          return setIsEditing(false);
        }

        if (newValue.length && !isPossiblePhoneNumber(newValue)) {
          return toast.error('Проверьте правильность ввода телефона!');
        }

        setPreviousValue(initialValue);

        const promise = new Promise((resolve, reject) => {
          updateBooking(
            { input: { id: originalId, [columnId]: newValue } },
            {
              onSuccess: async data => {
                await client.invalidateQueries({
                  queryKey: ['InfiniteBookings'],
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
          loading: `Обновление поля \`${columnTranslations[columnId as BookingColumns]}\`...`,
          duration: 10000,
          action: {
            label: 'Отменить',
            onClick() {
              updateBooking(
                { input: { id: originalId, [columnId]: previousValue } },
                {
                  async onSuccess() {
                    await client.invalidateQueries({
                      queryKey: ['InfiniteBookings'],
                    });
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
        setIsEditing(false);
      };

      const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
          e.preventDefault();
          if (value !== undefined) {
            handleUpdate(value);
          }
        }
      };

      const onBlur = () => {
        if (value !== undefined) {
          handleUpdate(value);
        }
      };

      if (isEditing) {
        return (
          <RPNInput
            className='p-1 px-2 h-8'
            inputComponent={Input}
            labels={ru}
            placeholder='Номер телефона'
            value={value}
            onChange={value => setValue(value || '')}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
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
  },
  {
    size: 160,
    minSize: 120,
    id: 'extraTelegram',
    accessorKey: 'extraTelegram',
    header: ({ column }) => {
      return <Header title='Телеграм 2' column={column} />;
    },
    cell: ({ getValue, row }) => {
      const initialValue = getValue() as boolean;
      const phone = row.original.phoneNumber;

      return (
        <>
          {initialValue === true && (
            <Button
              className='w-full justify-start p-0 h-auto'
              variant='link'
              asChild
            >
              <Link
                className='w-full'
                target='_blank'
                to={`https://t.me/${phone}`}
              >
                <span
                  title={`https://t.me/${phone}`}
                  className='truncate block w-full'
                >
                  t.me/{phone}
                </span>
              </Link>
            </Button>
          )}
          {initialValue === false && (
            <div className='flex items-center text-muted-foreground overflow-hidden cursor-default gap-1'>
              <span title={'Не указан'} className='truncate'>
                Не указан
              </span>
            </div>
          )}
        </>
      );
    },
    enableColumnFilter: false,
  },
  {
    size: 160,
    minSize: 120,
    id: 'extraWhatsapp',
    accessorKey: 'extraWhatsapp',
    header: ({ column }) => {
      return <Header title='Ватсап 2' column={column} />;
    },
    cell: ({ getValue, row }) => {
      const initialValue = getValue() as boolean;
      const phone = row.original.phoneNumber;

      return (
        <>
          {initialValue === true && (
            <Button
              className='w-full justify-start p-0 h-auto'
              variant='link'
              asChild
            >
              <Link
                className='w-full'
                target='_blank'
                to={`https://wa.me/${phone}`}
              >
                <span
                  title={`https://wa.me/${phone}`}
                  className='truncate block w-full'
                >
                  wa.me/{phone}
                </span>
              </Link>
            </Button>
          )}
          {initialValue === false && (
            <div className='flex items-center text-muted-foreground overflow-hidden cursor-default gap-1'>
              <span title={'Не указан'} className='truncate'>
                Не указан
              </span>
            </div>
          )}
        </>
      );
    },
    enableColumnFilter: false,
  },
  {
    size: 160,
    minSize: 140,
    id: 'seatsCount',
    accessorKey: 'seatsCount',
    header: ({ column }) => {
      return <Header title='Кол-во мест' column={column} />;
    },
    cell: ({
      getValue,
      row: {
        original: { id: originalId },
      },
      column: { id: columnId },
    }) => {
      const initialValue = getValue() as number;
      const [isEditing, setIsEditing] = useState(false);
      const [value, setValue] = useState<number | undefined>(initialValue);
      const [previousValue, setPreviousValue] = useState(initialValue);

      useEffect(() => {
        setValue(initialValue);
      }, [initialValue]);

      const { mutate: updateBooking, isPending } = useUpdateBooking();

      const handleValueChange = (values: NumberFormatValues) => {
        setValue(values.floatValue);
      };

      const handleUpdate = (newValue: number) => {
        if (newValue !== initialValue) {
          setPreviousValue(initialValue);
          const promise = new Promise((resolve, reject) => {
            updateBooking(
              { input: { id: originalId, [columnId]: newValue } },
              {
                onSuccess: async data => {
                  await client.invalidateQueries({
                    queryKey: ['InfiniteBookings'],
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
            loading: `Обновление поля \`${columnTranslations[columnId as BookingColumns]}\`...`,
            duration: 10000,
            action: {
              label: 'Отменить',
              onClick() {
                updateBooking(
                  { input: { id: originalId, [columnId]: previousValue } },
                  {
                    async onSuccess() {
                      await client.invalidateQueries({
                        queryKey: ['InfiniteBookings'],
                      });
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
          <NumericFormat
            type='tel'
            customInput={Input}
            className='p-1 px-2 h-8'
            value={value}
            onValueChange={handleValueChange}
            onBlur={onBlur}
            allowNegative={false}
            decimalScale={0}
            onKeyDown={onKeyDown}
            autoFocus
            isAllowed={values => {
              const floatValue = values.floatValue;
              return typeof floatValue === 'undefined' || floatValue > 0;
            }}
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
          <span title={`${initialValue}`} className='truncate'>
            {initialValue}
          </span>
        </div>
      );
    },
    meta: {
      filterVariant: 'range',
    },
    filterFn: 'inNumberRange',
  },
  // {
  //   size: 160,
  //   minSize: 160,
  //   id: 'commentary',
  //   accessorKey: 'commentary',
  //   // @ts-ignore
  //   accessorFn: row => row.commentary ?? '',
  //   header: ({ column }) => {
  //     return <Header title='Комментарий' column={column} />;
  //   },
  //   cell: ({
  //     getValue,
  //     row: {
  //       original: { id: originalId },
  //     },
  //     column: { id: columnId },
  //   }) => {
  //     const initialValue = getValue() as string;
  //     const [isEditing, setIsEditing] = useState(false);
  //     const [previousValue, setPreviousValue] = useState(initialValue);
  //
  //     const { mutate: updateBooking, isPending } = useUpdateBooking();
  //
  //     const handleUpdate = (newValue: string) => {
  //       if (newValue !== initialValue) {
  //         setPreviousValue(initialValue);
  //
  //         const promise = new Promise((resolve, reject) => {
  //           updateBooking(
  //             { input: { id: originalId, [columnId]: newValue } },
  //             {
  //               onSuccess: async data => {
  //                 await client.invalidateQueries({
  //                   queryKey: ['InfiniteBookings'],
  //                 });
  //                 resolve(data);
  //               },
  //               onError(error) {
  //                 reject(error);
  //               },
  //             },
  //           );
  //         });
  //
  //         toast.promise(promise, {
  //           loading: `Обновление поля \`${columnTranslations[columnId as BookingColumns]}\`...`,
  //           duration: 10000,
  //           action: {
  //             label: 'Отменить',
  //             onClick() {
  //               updateBooking(
  //                 { input: { id: originalId, [columnId]: previousValue } },
  //                 {
  //                   async onSuccess() {
  //                     await client.invalidateQueries({
  //                       queryKey: ['InfiniteBookings'],
  //                     });
  //                     toast.success(
  //                       `Отмена изменения поля \`${columnTranslations[columnId as BookingColumns]}\` выполненo успешно!`,
  //                     );
  //                   },
  //                   onError() {
  //                     toast.error(
  //                       `Не удалось отменить изменения поля \`${columnTranslations[columnId as BookingColumns]}\`!`,
  //                     );
  //                   },
  //                 },
  //               );
  //             },
  //           },
  //           success() {
  //             return `\`${columnTranslations[columnId as BookingColumns]}\` изменёно ${initialValue} → ${newValue}!`;
  //           },
  //           error(error) {
  //             if (isGraphQLRequestError(error)) {
  //               return error.response.errors[0].message;
  //             } else if (error instanceof Error) {
  //               return error.message;
  //             }
  //             return 'Произошла ошибка!';
  //           },
  //         });
  //       }
  //       setIsEditing(false);
  //     };
  //
  //     const onBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
  //       handleUpdate(e.target.value);
  //     };
  //
  //     const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
  //       if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
  //         e.preventDefault();
  //         handleUpdate(e.currentTarget.value);
  //       }
  //     };
  //
  //     if (isEditing) {
  //       return (
  //         <AutosizeTextarea
  //           minHeight={32}
  //           maxHeight={120}
  //           className='p-1 px-2 h-8'
  //           defaultValue={initialValue}
  //           onBlur={onBlur}
  //           onKeyDown={onKeyDown}
  //           autoFocus
  //         />
  //       );
  //     }
  //
  //     return (
  //       <>
  //         {initialValue.length ? (
  //           <div
  //             className='flex items-center overflow-hidden cursor-text gap-1'
  //             onClick={() => setIsEditing(true)}
  //           >
  //             {isPending && (
  //               <Loader2 className='min-w-4 min-h-4 size-4 animate-spin' />
  //             )}
  //             <span title={initialValue} className='truncate'>{initialValue}</span>
  //           </div>
  //         ) : (
  //           <Button
  //             className='size-8'
  //             variant='outline'
  //             onClick={() => setIsEditing(true)}
  //           >
  //             {!isPending && <Edit />}
  //             {isPending && (
  //               <Loader2 className='min-w-4 min-h-4 size-4 animate-spin' />
  //             )}
  //           </Button>
  //         )}
  //       </>
  //     );
  //   },
  // },
  {
    id: 'status',
    accessorKey: 'status',
    minSize: 200,
    size: 200,
    cell: props => {
      const id = props.row.original.id;
      const status = props.row.original.status;
      const { mutate, isPending } = useUpdateBooking();
      const [previousStatus, setPreviousStatus] =
        useState<BookingStatus>(status);

      const columnWidth = props.column.getSize();

      return (
        <ComboBox
          isLoading={isPending}
          size={'lg'}
          width={columnWidth}
          items={statusOptions}
          value={props.getValue() ?? ''}
          onValueChange={async value => {
            setPreviousStatus(status);

            const promise = new Promise((resolve, reject) => {
              mutate(
                { input: { id, status: value } },
                {
                  async onSuccess(data) {
                    await client.invalidateQueries({
                      queryKey: ['InfiniteBookings'],
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
              loading: 'Обновление статуса...',
              duration: 10000,
              action: {
                label: 'Отменить',
                onClick() {
                  mutate(
                    { input: { id, status: previousStatus } },
                    {
                      async onSuccess() {
                        await client.invalidateQueries({
                          queryKey: ['InfiniteBookings'],
                        });
                        toast.success('Отмена статуса выполнена успешно!');
                      },
                      onError() {
                        toast.error('Не удалось отменить изменения статуса!');
                      },
                    },
                  );
                },
              },
              success() {
                return 'Статус изменён!';
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
          }}
        />
      );
    },
    header: ({ column }) => {
      return <Header title='Статус' column={column} />;
    },
    meta: {
      filterVariant: 'combobox',
      items: allStatusOptions,
    },
  },
  {
    id: 'direction',
    accessorKey: 'direction',
    cell: props => {
      const initialValue = props.getValue() as
        | RouteDirection.Forward
        | RouteDirection.Backward;

      let content = null;

      if (initialValue === 'FORWARD') {
        content = <ArrowRight className='size-4' />;
      }

      if (initialValue === 'BACKWARD') {
        content = <ArrowLeft className='size-4' />;
      }

      return (
        <div className='flex justify-center items-center overflow-hidden gap-1'>
          {content}
        </div>
      );
    },
    header: ({ column }) => {
      return <Header title='Направление' column={column} />;
    },
    enableColumnFilter: false,
  },
  {
    id: 'route',
    accessorKey: 'route',
    minSize: 200,
    size: 200,
    enableSorting: false,
    cell: props => {
      const routeId = props.row.original.route?.id;
      const arrivalCity = props.row.original.route?.arrivalCity?.name;
      const departureCity = props.row.original.route?.departureCity?.name;
      const direction = props.row.original.direction;
      console.log({ direction });

      return (
        <Button
          className='w-full justify-start p-0 h-auto'
          variant='link'
          asChild
        >
          <Link className='w-full' to={`../routes/?route_id=${routeId}`}>
            <span
              title={`${departureCity} ⇆ ${arrivalCity}`}
              className='truncate block w-full'
            >
              {direction === 'FORWARD' && (
                <>
                  <span>{departureCity}</span> → <span>{arrivalCity}</span>
                </>
              )}
              {direction === 'BACKWARD' && (
                <>
                  <span>{arrivalCity}</span> → <span>{departureCity}</span>
                </>
              )}
            </span>
          </Link>
        </Button>
      );
    },
    header: ({ column }) => {
      return <Header title='Маршрут' column={column} />;
    },
  },
  {
    minSize: 155,
    size: 155,
    enableGlobalFilter: false,
    id: 'travelDate',
    accessorKey: 'travelDate',
    header: ({ column }) => <Header title='Дата поездки' column={column} />,
    cell: props => (
      <span className='overflow-hidden text-ellipsis'>
        {format(new Date(props.getValue() as number), 'dd.MM.yyyy', {
          locale: fnsRU,
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
    minSize: 140,
    size: 140,
    enableGlobalFilter: false,
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }) => <Header title='Создано' column={column} />,
    cell: props => (
      <span className='overflow-hidden text-ellipsis'>
        {format(new Date(props.getValue() as number), 'dd.MM.yyyy, HH:mm:ss', {
          locale: fnsRU,
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
    minSize: 140,
    size: 140,
    enableGlobalFilter: false,
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: ({ column }) => <Header title='Изменено' column={column} />,
    cell: props => (
      <span className='overflow-hidden text-ellipsis'>
        {format(new Date(props.getValue() as number), 'dd.MM.yyyy, HH:mm:ss', {
          locale: fnsRU,
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
];

interface HeaderProps<TData> {
  title: string;
  column: Column<TData, unknown>;
  className?: string;
}

function Header<TData>({ title, column, className }: HeaderProps<TData>) {
  const isSorted = column.getIsSorted();

  return (
    <div className='flex flex-1 flex-col space-y-0.5'>
      {column.getCanSort() ? (
        <Button
          className={cn('gap-0 [&_svg]:size-3.5 h-7', className)}
          size='sm'
          variant='ghost'
          onClick={column.getToggleSortingHandler()}
          title={
            column.getCanSort()
              ? column.getNextSortingOrder() === 'asc'
                ? 'Сортировать по возростанию'
                : column.getNextSortingOrder() === 'desc'
                  ? 'Сортировать по убыванию'
                  : 'Очистить сортировку'
              : undefined
          }
        >
          {title}
          {isSorted ? (
            isSorted === 'asc' ? (
              <ArrowUp className='ml-2 h-4 w-4' />
            ) : isSorted === 'desc' ? (
              <ArrowDown className='ml-2 h-4 w-4' />
            ) : null
          ) : null}
        </Button>
      ) : (
        <span className='flex w-full justify-center items-center self-center h-7 px-3'>
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

  const columnWidth = column.getSize();

  return filterVariant === 'combobox' ? (
    <ComboBox
      // [label, value, icon]
      items={items ?? []}
      value={columnFilterValue?.toString() ?? ''}
      onValueChange={value => {
        column.setFilterValue(value);
      }}
      width={columnWidth}
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
