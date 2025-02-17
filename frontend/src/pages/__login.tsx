import { FC, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { BorderBeam } from '@/components/ui/border-beam';
import { FormButton } from '@/components/form-button';
import { SonnerSpinner } from '@/components/sonner-spinner';
import { useLogin } from '@/features/auth/api/mutations';
import { useGetMe } from '@/features/auth/api/queries';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';

const FormSchema = z.object({
  login: z.string().trim().min(1, { message: 'Логин обязателен!' }),
  password: z.string().trim().min(1, { message: 'Пароль обязателен!' }),
});

type DefaultValues = z.infer<typeof FormSchema>;

const defaultValues: DefaultValues = {
  login: '',
  password: '',
};

const LoginPage: FC = () => {
  const form = useForm<DefaultValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    form.setFocus('login');
  }, [form]);

  const formState = form.formState;
  const values = form.getValues();
  const isSubmitting = formState.isSubmitting;

  console.log({
    errors: formState.errors,
    dirtyFields: formState.dirtyFields,
    formState,
    values,
  });

  const { refetch: refetchMe } = useGetMe();
  const { mutateAsync: loginUser } = useLogin();

  const onSubmit: SubmitHandler<DefaultValues> = async data => {
    try {
      await loginUser({
        loginInput: data,
      });
      await refetchMe();

      form.reset();
      toast.success('Вход выполнен успешно', { position: 'bottom-center' });
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

  return (
    <div className='flex-1 flex items-center justify-center container mt-5 mb-10'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full sm:max-w-sm mx-auto'
        >
          <div className='relative overflow-hidden w-full h-full border rounded-xl p-6'>
            <div className='flex flex-col space-y-1.5 mb-6'>
              <h3 className='font-semibold tracking-tight text-xl'>
                Вход в аккаунт
              </h3>
              <p className='text-sm text-muted-foreground'>
                Введите свой логин и пароль для входа в аккаунт
              </p>
            </div>

            <div className='space-y-4'>
              <div className='sm:grid sm:grid-cols-[repeat(auto-fill,_minmax(17rem,_1fr))] space-y-3 sm:space-y-0 sm:gap-1 sm:gap-y-2'>
                <FormField
                  control={form.control}
                  name='login'
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Логин</FormLabel>
                        <FormControl>
                          <Input placeholder={'Логин'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Пароль</FormLabel>
                        <FormControl>
                          <Input
                            type='password'
                            placeholder={'Пароль'}
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
                      <SonnerSpinner />
                      Пожалуйста подождите
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

export default LoginPage;
