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
};

const defaultValues: DefaultValues = {
  reason: '',
  message: '',
};

const QuestionPage: FC = () => {
  const form = useForm({
    defaultValues,
  });

  const onSubmit: SubmitHandler<DefaultValues> = async data => {
    console.log({ data });
  };

  return (
    <div className='container relative z-10'>
      <div className='max-w-3xl px-2 mx-auto relative overflow-hidden'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-2'>
              <div className='flex flex-col gap-3.5'>
                <FormField
                  control={form.control}
                  name='reason'
                  render={({ field: { onChange, value } }) => (
                    <FormItem>
                      <FormLabel>Причина</FormLabel>
                      <Select onValueChange={onChange} value={value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Выберите причину' />
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
                  name='message'
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Сообщение</FormLabel>
                      <FormControl>
                        <AutosizeTextarea onValueChange={onChange} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button className='self-start' type='submit'>
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
