import { DrawerMode } from '@/hooks/use-drawer-state';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { SonnerSpinner } from '@/components/sonner-spinner';
import { CalendarPlus, Edit } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { CreateScheduleInput, UpdateScheduleInput } from '@/gql/graphql';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { client } from '@/react-query';
import { Input } from '@/components/ui/input';
import {
  ScheduleFormSkeleton,
  ScheduleFormSchema,
  ScheduleFormValues,
  defaultValues,
} from '@/features/schedule/components';
import { useScheduleById } from '@/features/schedule/api/queries';
import {
  Select,
  SelectLabel,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { daysOfWeekRu } from '@/pages/admin/routes/[route_id]/schedules/__columns';
import { useCreateSchedule, useUpdateSchedule } from '../api/mutations';

interface ScheduleFormProps {
  drawerMode: Extract<DrawerMode, 'addSchedule' | 'editSchedule' | 'idle'>;
  scheduleId: string | null;
  routeId: string;
  onClose: () => void;
}

export function ScheduleForm({
  drawerMode,
  scheduleId,
  routeId,
  onClose,
}: ScheduleFormProps) {
  const {
    data: scheduleData,
    fetchStatus: scheduleFetchStatus,
    status: scheduleStatus,
    isSuccess: scheduleIsSuccess,
    isFetching: scheduleIsFetching,
  } = useScheduleById(scheduleId, {
    enabled: !!scheduleId,
  });

  const values = scheduleData?.scheduleById
    ? {
        startTime: scheduleData.scheduleById.startTime as string,
        endTime: scheduleData.scheduleById.endTime as string,
        dayOfWeek: scheduleData.scheduleById.dayOfWeek,
        isActive: scheduleData.scheduleById.isActive,
      }
    : undefined;

  const scheduleInitialLoading =
    scheduleFetchStatus === 'fetching' && scheduleStatus === 'pending';

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(ScheduleFormSchema),
    defaultValues,
    values,
    mode: 'onChange',
  });

  const { mutateAsync: createSchedule } = useCreateSchedule();
  const { mutateAsync: updateSchedule } = useUpdateSchedule();

  const formState = form.formState;
  const isSubmitting = formState.isSubmitting;
  const isDirty = formState.isDirty;

  const onSubmit: SubmitHandler<ScheduleFormValues> = async data => {
    try {
      if (drawerMode === 'editSchedule') {
        const payload: UpdateScheduleInput = {
          id: scheduleId as string,
          ...data,
        };
        await updateSchedule({
          input: payload,
        });
        toast.success('Запись в расписании успешно обновлена!', {
          richColors: true,
          position: 'bottom-center',
        });
      }
      if (drawerMode === 'addSchedule') {
        const payload: CreateScheduleInput = {
          ...data,
          routeId,
        };
        await createSchedule({ input: payload });
        toast.success('Новая запись добавлена к расписанию!', {
          richColors: true,
          position: 'bottom-center',
        });
      }
      client.invalidateQueries({ queryKey: ['GetSchedulesByRoute'] });
      form.reset();
      onClose();
    } catch (error) {
      console.error(error);
      if (isGraphQLRequestError(error)) {
        toast.error(error.response.errors[0].message, {
          position: 'bottom-center',
          richColors: true,
        });
      } else if (error instanceof Error) {
        toast.error(error.message, {
          position: 'bottom-center',
          richColors: true,
        });
      }
    }
  };

  return (
    <>
      {scheduleIsFetching && scheduleIsSuccess && (
        <div className='w-full sm:max-w-screen-sm mx-auto'>
          <div className='flex items-center justify-center mb-6 px-4 sm:px-5'>
            <SonnerSpinner className='bg-foreground' />
          </div>
        </div>
      )}
      {scheduleInitialLoading && <ScheduleFormSkeleton />}
      {!scheduleInitialLoading && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='w-full sm:max-w-screen-sm space-y-6 mx-auto pb-3'
          >
            <div className='sm:grid sm:grid-cols-[repeat(auto-fit,_minmax(14rem,_1fr))] space-y-3 sm:space-y-0 sm:gap-y-4 sm:gap-x-2 px-4 sm:px-5'>
              <FormField
                control={form.control}
                name='startTime'
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Время отправления</FormLabel>
                      <FormControl>
                        <Input
                          type='time'
                          placeholder={'Время отправления'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name='endTime'
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Время прибытия</FormLabel>
                      <FormControl>
                        <Input
                          type='time'
                          placeholder={'Время прибытия'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name='dayOfWeek'
                render={({ field: { onChange, value } }) => {
                  return (
                    <FormItem>
                      <FormLabel>День недели</FormLabel>
                      <Select value={value ?? undefined} onValueChange={onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={'Выберите день недели'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Дни недели</SelectLabel>
                            {Object.entries(daysOfWeekRu)?.map(
                              ([key, value]) => (
                                <SelectItem key={key} value={key}>
                                  {value}
                                </SelectItem>
                              ),
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name='isActive'
                render={({ field: { value, onChange, ...field } }) => {
                  return (
                    <FormItem className='col-span-2 flex flex-row items-center justify-between rounded-lg border shadow-sm pr-3 gap-1 sm:gap-0'>
                      <FormLabel className='flex-1 flex flex-col gap-1 py-3 ml-3 cursor-pointer'>
                        Активировать расписание
                        <FormDescription className='text-xs font-normal'>
                          Сделать расписание доступным
                        </FormDescription>
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={value}
                          onCheckedChange={onChange}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />

              <Button
                disabled={isSubmitting || !isDirty}
                className={`w-full col-span-2`}
                type='submit'
              >
                {isSubmitting ? (
                  <>
                    <SonnerSpinner />
                    Пожалуйста подождите
                  </>
                ) : drawerMode === 'editSchedule' ? (
                  <>
                    <Edit />
                    Сохранить изменения
                  </>
                ) : drawerMode === 'addSchedule' ? (
                  <>
                    <CalendarPlus />
                    Добавить новое расписание
                  </>
                ) : null}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
}
