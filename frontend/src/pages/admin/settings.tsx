import { Icons } from '@/components/icons';
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';
import TelegramLogin from '@/components/telegram-login';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  useGetMe,
  useTelegramChatIds,
  useUpdateTelegramChatIds,
} from '@/features/auth';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { Loader2, Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { Fragment } from 'react/jsx-runtime';
import { toast } from 'sonner';

export type DefaultValues = {
  telegramChatIds: { value: string }[];
};

const defaultValues: DefaultValues = {
  telegramChatIds: [{ value: '' }],
};

function SettingsPage() {
  const {
    data: meData,
    isPending: meIsPending,
  } = useGetMe();
  const { me: user } = meData || {};

  const {
    data,
    isPending,
    refetch: refetchTelegramChats,
  } = useTelegramChatIds();
  const { mutateAsync: updateTelegramChatIds } = useUpdateTelegramChatIds();

  const chatIds =
    data?.telegramChats.map(chat => ({ value: chat.chatId })) ?? [];
  console.log({ chatIds });

  const form = useForm({
    defaultValues,
    values: {
      telegramChatIds: chatIds,
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const isDirty = form.formState.isDirty;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'telegramChatIds',
  });

  useEffect(() => {
    form.reset({
      telegramChatIds: chatIds.length === 0 ? undefined : chatIds,
    });
  }, []);

  const onSubmit: SubmitHandler<DefaultValues> = async data => {
    const telegramChatIds = data.telegramChatIds.map(chatId => chatId.value);
    try {
      await updateTelegramChatIds({
        input: {
          telegramChatIds,
        },
      });

      form.reset({
        telegramChatIds: data.telegramChatIds,
      });
      await refetchTelegramChats();
    } catch (error) {
      console.error(error);
      if (isGraphQLRequestError(error)) {
        toast.error(error.response.errors[0].message, {
          position: 'top-center',
          richColors: true,
        });
      } else if (error instanceof Error) {
        toast.error(error.message, {
          position: 'top-center',
          richColors: true,
        });
      }
    }
  };

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Настройки аккаунта</PageHeaderHeading>
        <PageHeaderDescription>
          Можете настроить ваш аватар, уведомления и т.д.
        </PageHeaderDescription>
      </PageHeader>
      <div className='container'>
        <div className='px-3 py-4 max-w-md'>
          <h2 className='scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0'>
            Telegram
          </h2>
          {!isPending && (
            <Form {...form}>
              <form
                className='space-y-3'
                onSubmit={form.handleSubmit(onSubmit)}
              >
                {fields.map((_field, index) => {
                  return (
                    <Fragment key={_field.id}>
                      <FormField
                        control={form.control}
                        name={`telegramChatIds.${index}.value`}
                        rules={{
                          required: 'Не указан Chat ID!',
                        }}
                        render={({ field: { value, ...field } }) => {
                          console.log({ field });
                          return (
                            <FormItem className='gap-y-0 sm:gap-y-0'>
                              <div className='flex flex-col gap-y-1.5'>
                                <FormLabel className='flex justify-between'>
                                  <span>Chat ID для Telegram бота</span>
                                  {index === 0 ? (
                                    <Button
                                      onClick={() => {
                                        append({
                                          value: '',
                                        });
                                      }}
                                      type='button'
                                      className='size-fit p-0 m-0 leading-none text-xs underline-offset-2'
                                      variant='link'
                                    >
                                      Добавить Chat ID
                                    </Button>
                                  ) : null}
                                </FormLabel>

                                <div className='relative'>
                                  {index !== 0 && (
                                    <Button
                                      onClick={() => remove(index)}
                                      type='button'
                                      className='absolute -top-2 -right-2 [&_svg]:size-3 size-5 rounded-sm'
                                      variant='outline'
                                      size='icon'
                                    >
                                      <X />
                                      <span className='sr-only'>
                                        Удалить Chat ID
                                      </span>
                                    </Button>
                                  )}
                                  <FormControl>
                                    <Input
                                      placeholder='Введите Chat ID'
                                      value={value || ''}
                                      {...field}
                                    />
                                  </FormControl>
                                </div>
                                <FormMessage />
                              </div>
                            </FormItem>
                          );
                        }}
                      />
                    </Fragment>
                  );
                })}
                <div className='flex gap-2 sm:flex-row flex-col'>
                  <Button
                    type='submit'
                    className='w-full'
                    disabled={isSubmitting || !isDirty}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className='animate-spin' /> Сохраняется
                      </>
                    ) : (
                      <>
                        <Save />
                        Сохранить
                      </>
                    )}
                  </Button>
                  {isDirty && (
                    <Button
                      type='button'
                      onClick={() => {
                        form.reset({
                          telegramChatIds:
                            chatIds.length === 0 ? undefined : chatIds,
                        });
                      }}
                      variant='secondary'
                    >
                      Сбросить
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
      {!meIsPending && import.meta.env.PROD && !user?.telegram && (
        <>
          <Separator />
          <div className='container'>
            <div className='px-3 py-4 max-w-md'>
              <h2 className='flex items-center gap-1 scroll-m-20 pb-2 text-3xl font-semibold leading-none tracking-tight first:mt-0'>
                Привязать Telegram
              </h2>
              <div className='relative flex flex-col justify-center items-start gap-2'>
                <TelegramLogin
                  botName={'DonbassTourBot'}
                  buttonSize='medium'
                  canSendMessages
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default SettingsPage;
