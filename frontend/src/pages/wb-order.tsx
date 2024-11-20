import { FC, useEffect, useState } from 'react';

import { toast } from 'sonner';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import ru from 'react-phone-number-input/locale/ru.json';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { useCreateWbOrder } from '@/features/wb-order-by-id';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/phone-input';
import { FileUploader } from '@/components/file-uploader';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useNewWbOrderSubscriber } from '@/hooks/use-new-wb-order-subscriber';
import { isGraphQLRequestError } from '@/types/is-graphql-request-error';
import CircularProgress from '@/components/circular-progress';
import { cn } from '@/lib/utils';
import { BorderBeam } from '@/components/ui/border-beam';
import { FormButton } from '@/components/form-button';
import { SonnerSpinner } from '@/components/sonner-spinner';

const FormSchema = z
  .object({
    FLP: z
      .string({ required_error: 'ФИО обязательно к заполнению!' })
      .refine(value => {
        const parts = value.trim().split(/\s+/);
        const namePattern = /^[a-zа-я]+$/i;
        return (
          parts.length === 3 && parts.every(part => namePattern.test(part))
        );
      }, 'Необходимо заполнить Фамилию, Имя и Отчество!'),
    phone: z
      .string({ required_error: 'Телефон обязателен к заполнению!' })
      .refine(
        value => isPossiblePhoneNumber(value),
        'Проверьте пожалуйста еще раз! Телефон не заполнен до конца!',
      ),
    wbPhone: z
      .string({ required_error: 'Телефон обязателен к заполнению!' })
      .optional()
      .refine(
        value => value === undefined || isPossiblePhoneNumber(value),
        'Проверьте пожалуйста еще раз! Телефон не заполнен до конца!',
      )
      .or(z.literal('')),
    orderCode: z
      .string({ required_error: 'Код заказа обязателен к заполнению!' })
      .length(5, 'Код должен содержать 5 символов!')
      .optional()
      .or(z.literal('')),
    QR: z.array(z.instanceof(File)),
  })
  .superRefine((val, ctx) => {
    const isWbEmpty = !val.wbPhone && !val.orderCode;
    const isWbFilled = !!val.wbPhone && !!val.orderCode;
    // const isNotWbFilled = !val.wbPhone || !val.orderCode;
    // const isNotWbFilled = !(val.wbPhone && val.orderCode);
    const isQRFilled = !!val.QR && val.QR.length > 0;

    if (isQRFilled && isWbEmpty) {
      return z.NEVER;
    }

    if (!isQRFilled && isWbFilled) {
      return z.NEVER;
    }

    if (!isQRFilled) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['QR'],
        message:
          'Прикрепите QR-код заказа или укажите `Телефон WB` и `Код подтверждения заказа`',
      });
    }

    if (!isWbFilled && !val.wbPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['wbPhone'],
        message: 'Заполните Телефон WB',
      });
    }

    if (!isWbFilled && !val.orderCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['orderCode'],
        message: 'Заполните Код подтверждения заказа',
      });
    }
  });

type DefaultValues = z.infer<typeof FormSchema>;

const defaultValues: DefaultValues = {
  phone: '',
  wbPhone: '',
  FLP: '',
  orderCode: '',
  QR: [],
};

const WbOrderPage: FC = () => {
  const form = useForm<DefaultValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const formState = form.formState;
  const values = form.getValues();
  const isSubmitting = formState.isSubmitting;

  console.log({
    errors: formState.errors,
    dirtyFields: formState.dirtyFields,
    formState,
    values,
  });

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log({ value, name, type });

      if (name === 'QR') {
        form.trigger(['orderCode', 'wbPhone']);
      }
      if (name === 'orderCode') {
        form.trigger('wbPhone');
        form.trigger('QR');
      }
      if (name === 'wbPhone') {
        form.trigger('orderCode');
        form.trigger('QR');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [form.watch, form.trigger]);

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  console.log({ qrCodeUrl });

  const {
    mutateAsync: createOrder,
    data,
    uploadProgress,
    isAborting,
  } = useCreateWbOrder();
  console.log({ uploadProgress });

  useEffect(() => {
    if (data?.saveWbOrder.qrCodeFile) {
      const type = data.saveWbOrder.qrCodeFile.type as string;
      const buffer = data.saveWbOrder.qrCodeFile.buffer;
      import.meta.env.DEV && console.log({ type, buffer });

      if (typeof buffer === 'object' && 'data' in buffer) {
        const uint8Array = new Uint8Array(buffer.data);

        const base64 = btoa(
          uint8Array.reduce(
            (data, byte) => data + String.fromCharCode(byte),
            '',
          ),
        );

        const dataUrl = `data:${type};base64,${base64}`;
        setQrCodeUrl(dataUrl);
      } else {
        console.error('Received buffer is not in the expected format');
      }
    }
  }, [data]);

  const onSubmit: SubmitHandler<DefaultValues> = async data => {
    try {
      await createOrder({
        input: {
          ...data,
          QR: data.QR?.[0] ?? null,
        },
      });

      form.reset();

      toast.success('Заявка оформлена!', { position: 'bottom-center' });
    } catch (error) {
      console.error(error);
      if (isGraphQLRequestError(error)) {
        toast.error(error.response.errors[0].message, {
          position: 'bottom-center',
        });
      } else if (error instanceof Error) {
        toast.error(error.message, { position: 'bottom-center' });
      }
    }
  };

  const { newOrder, error } = useNewWbOrderSubscriber();
  console.log({ newOrder, error });

  return (
    <div className='container mt-5 mb-10'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full sm:max-w-screen-sm space-y-6 mx-auto'
        >
          <div className='relative overflow-hidden w-full h-full border rounded-xl p-6'>
            <div className='flex flex-col space-y-1.5 mb-6'>
              <h3 className='font-semibold tracking-tight text-xl'>
                Wildberries
              </h3>
              <p className='text-sm text-muted-foreground'>
                Введите информацию для оформления заказа.
              </p>
            </div>

            <div className='space-y-4'>
              <div className='sm:grid sm:grid-cols-[repeat(auto-fill,_minmax(17rem,_1fr))] space-y-3 sm:space-y-0 sm:gap-1 sm:gap-y-2'>
                <FormField
                  control={form.control}
                  name='FLP'
                  render={({ field: { onChange, ...field } }) => {
                    return (
                      <FormItem>
                        <FormLabel>ФИО</FormLabel>
                        <FormControl>
                          <Input
                            onChange={e => {
                              const capitalizeFirstChars = (value: string) => {
                                const words = value.split(' ');
                                const capitalizedWorlds = words
                                  .map(w =>
                                    w.replace(
                                      /^./,
                                      (w.at(0) as string)?.toUpperCase(),
                                    ),
                                  )
                                  .join(' ');
                                return capitalizedWorlds;
                              };

                              onChange(capitalizeFirstChars(e.target.value));
                            }}
                            placeholder={'Иванов Иван Иванович'}
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
                  name='phone'
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Телефон</FormLabel>
                        <FormControl>
                          <PhoneInput
                            countries={['RU']}
                            international
                            labels={ru}
                            countryCallingCodeEditable={false}
                            defaultCountry={'RU'}
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
                  name='QR'
                  render={({ field: { value, onChange, ref, ...field } }) => {
                    return (
                      <FormItem className='sm:col-span-2'>
                        <FormLabel>QR-код для получения заказа</FormLabel>
                        <FormControl>
                          <FileUploader
                            value={value}
                            onValueChange={onChange}
                            maxSize={1024 * 1024 * 10} // 10 MB
                            innerRef={ref}
                            {...field}
                            // progresses={progresses}
                            // pass the onUpload function here for direct upload
                            // onUpload={uploadFiles}
                            // disabled={isUploading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      // {uploadedFiles.length > 0 ? (
                      //   <UploadedFilesCard uploadedFiles={uploadedFiles} />
                      // ) : null}
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name='orderCode'
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Код для получения заказа</FormLabel>
                        <FormControl>
                          <InputOTP {...field} maxLength={5}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name='wbPhone'
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Телефон Wildberries</FormLabel>
                        <FormControl>
                          <PhoneInput
                            countries={['RU']}
                            international
                            labels={ru}
                            countryCallingCodeEditable={false}
                            defaultCountry={'RU'}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div className='sm:grid sm:grid-cols-[repeat(auto-fill,_minmax(17rem,_1fr))] gap-1 gap-y-2'>
                <FormButton
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto col-start-1 col-end-2`}
                  type='submit'
                >
                  {isSubmitting ? (
                    <>
                      {isAborting ? <CircularProgress
                        value={uploadProgress.percent}
                        strokeWidth={3}
                        className={cn(
                          'transition-all duration-300 h-4',
                          !uploadProgress.isComplete
                            ? 'w-4 mr-2 scale-1'
                            : 'w-4 scale-1 mr-2 animate-slow-pulse',
                        )}
                      /> : <SonnerSpinner />}
                      {!uploadProgress.isComplete
                        ? 'Пожалуйста подождите'
                        : <span className="animate-slow-pulse transition-all duration-300">Подтверждение</span>}
                    </>
                  ) : (
                    'Зарегестрировать'
                  )}
                </FormButton>
              </div>
            </div>
            <BorderBeam className='border rounded-xl' />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default WbOrderPage;
