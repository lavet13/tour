import { AutosizeTextarea } from '@/components/autosize-textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FC } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

export type DefaultValues = {
  reason: string;
  message: string;
  contact: string;
};

const defaultValues: DefaultValues = {
  reason: '',
  contact: '',
  message: '',
};

const QuestionPage: FC = () => {
  const form = useForm({
    defaultValues,
  });

  const onSubmit: SubmitHandler<DefaultValues> = async data => {
    console.log({ data });
    form.reset();
  };

  return (
    <div className='container relative z-10'>
      <h1 className='text-center text-2xl font-bold mb-4'>Жалоба/Вопрос</h1>
      <div className='max-w-3xl px-2 mx-auto relative overflow-hidden'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-2'>
              <div className='flex flex-col gap-3.5'>
                <div className='flex flex-col sm:flex-row gap-2'>
                  <FormField
                    control={form.control}
                    name='reason'
                    rules={{
                      required: 'Укажите категорию(вопрос или жалоба)',
                    }}
                    render={({ field: { onChange, value } }) => (
                      <FormItem className='flex-1'>
                        <FormLabel>Категория</FormLabel>
                        <Select onValueChange={onChange} value={value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Выберите категорию' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='Вопрос'>Вопрос</SelectItem>
                            <SelectItem value='Жалоба'>Жалоба</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='contact'
                    rules={{
                      required: 'Укажите контакт(телефон, Telegram, электронный адрес)',
                    }}
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormLabel>Контакт для связи</FormLabel>
                        <FormControl>
                          <Input
                            className='h-9'
                            placeholder='Телефон, E-mail, Telegram'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='message'
                  rules={{
                    required: 'Укажите сообщение',
                  }}
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Сообщение</FormLabel>
                      <FormControl>
                        <AutosizeTextarea placeholder="Сообщение..." onValueChange={onChange} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                className='px-12 self-stretch xs:self-center'
                type='submit'
              >
                Отправить
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default QuestionPage;
