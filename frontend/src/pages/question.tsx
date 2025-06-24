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
import { FC, useEffect, useRef } from 'react';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import ru from 'react-phone-number-input/locale/ru.json';
import { isPossiblePhoneNumber } from 'react-phone-number-input/input';
import { PhoneInput } from '@/components/phone-input';
import { useCreateFeedback } from '@/features/feedback';
import {
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  Loader2,
  Wrench,
} from 'lucide-react';

export type DefaultValues = {
  reason: string;
  message: string;
  contactType: 'phone' | 'email' | 'telegram';
  phone?: string;
  email?: string;
  telegram?: string;
};

const defaultValues: DefaultValues = {
  reason: '',
  contactType: 'telegram',
  message: '',
  phone: '',
  email: '',
  telegram: '',
};

const QuestionPage: FC = () => {
  const form = useForm({
    defaultValues,
  });

  const contactType = useWatch({
    control: form.control,
    name: 'contactType',
  });
  const previousContactTypeRef = useRef(contactType);

  const { mutateAsync: createFeedback } = useCreateFeedback();
  const onSubmit: SubmitHandler<DefaultValues> = async data => {
    let replyTo = '';
    const { reason, message } = data;

    switch (data.contactType) {
      case 'email':
        replyTo = data.email!;
        break;
      case 'telegram':
        replyTo = data.telegram!;
        break;
      case 'phone':
        replyTo = data.phone!;
        break;
    }

    const payload = {
      reason,
      message,
      replyTo,
    };

    await createFeedback({
      input: {
        ...payload,
      },
    });

    form.reset();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (previousContactTypeRef.current !== contactType) {
      timer = setTimeout(() => {
        form.setFocus(contactType);
      }, 0);
    }

    previousContactTypeRef.current = contactType;
    return () => clearTimeout(timer);
  }, [contactType]);

  return (
    <div className='container relative z-10'>
      <h1 className='text-center text-3xl md:text-4xl lg:text-5xl font-bold mb-4'>
        Задать вопрос
      </h1>
      <div className='max-w-3xl px-2 mx-auto relative overflow-hidden'>
        <Form {...form}>
          <form className='mb-6' onSubmit={form.handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-2'>
              <div className='flex flex-col gap-3.5'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
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
                            <SelectItem value='Вопрос'>
                              <span className='flex items-center gap-1.5'>
                                <HelpCircle className='size-3.5' />
                                Вопрос
                              </span>
                            </SelectItem>
                            <SelectItem value='Жалоба'>
                              <span className='flex items-center gap-1.5'>
                                <AlertTriangle className='size-3.5' />
                                Жалоба
                              </span>
                            </SelectItem>
                            <SelectItem value='Предложение'>
                              <span className='flex items-center gap-1.5'>
                                <Lightbulb className='size-3.5' />
                                Предложение
                              </span>
                            </SelectItem>
                            <SelectItem value='Техническая проблема'>
                              <span className='flex items-center gap-1.5'>
                                <Wrench className='size-3.5' />
                                Техническая проблема
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='contactType'
                    render={({ field: { onChange, value } }) => (
                      <FormItem className='flex-1'>
                        <FormLabel>Способ связи</FormLabel>
                        <Select
                          onValueChange={value => {
                            onChange(value);
                          }}
                          value={value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Выберите способ связи' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='email'>E-mail</SelectItem>
                            <SelectItem value='telegram'>Telegram</SelectItem>
                            <SelectItem value='phone'>Телефон</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <>
                  {contactType === 'email' && (
                    <div className='grid grid-cols-1 gap-2'>
                      <FormField
                        control={form.control}
                        name='email'
                        rules={{
                          required: 'Укажите электронный адрес',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Неверный формат email адреса',
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input
                                type='email'
                                placeholder='example@email.com'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  {contactType === 'phone' && (
                    <div className='grid grid-cols-1 gap-2'>
                      <FormField
                        control={form.control}
                        name='phone'
                        rules={{
                          required: 'Телефон обязателен к заполнению!',
                          validate: value =>
                            isPossiblePhoneNumber(value ?? '') ||
                            'Проверьте правильность ввода телефона!',
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Телефон</FormLabel>
                            <FormControl>
                              <PhoneInput
                                placeholder='Введите номер телефона'
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
                        )}
                      />
                    </div>
                  )}
                  {contactType === 'telegram' && (
                    <div className='grid grid-cols-1 gap-2'>
                      <FormField
                        control={form.control}
                        name='telegram'
                        rules={{
                          required: 'Telegram обязателен к заполнению!',
                          pattern: {
                            value: /^@[a-zA-Z0-9_]{4,32}$/,
                            message:
                              'Имя пользователя должно начинаться с @ и содержать только буквы, цифры и _ (от 4 до 32 символов после @)',
                          },
                        }}
                        render={({ field: { value, onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>Telegram</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='@username'
                                value={value}
                                onChange={e => {
                                  let inputValue = e.target.value;

                                  // Ensure it always starts with @
                                  if (!inputValue.startsWith('@')) {
                                    inputValue =
                                      '@' + inputValue.replace(/^@+/, '');
                                  }

                                  // Remove invalid characters (keep only alphanumeric and underscore after @)
                                  inputValue =
                                    '@' +
                                    inputValue
                                      .slice(1)
                                      .replace(/[^a-zA-Z0-9_]/g, '');

                                  // Limit length (Telegram usernames are max 32 chars + @)
                                  if (inputValue.length > 33) {
                                    inputValue = inputValue.slice(0, 33);
                                  }

                                  onChange(inputValue);
                                }}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </>

                <FormField
                  control={form.control}
                  name='message'
                  rules={{
                    required: 'Укажите сообщение',
                    minLength: {
                      message: 'Сообщение слишком короткое (минимум 4 символа)',
                      value: 4,
                    },
                  }}
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Сообщение</FormLabel>
                      <FormControl>
                        <AutosizeTextarea
                          placeholder='Сообщение...'
                          onValueChange={onChange}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                className='px-12 self-stretch xs:self-center'
                type='submit'
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className='animate-spin' />
                    Подтверждается...
                  </>
                ) : (
                  <>Отправить</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default QuestionPage;
