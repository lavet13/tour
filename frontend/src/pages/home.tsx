import { SubmitHandler, useForm } from 'react-hook-form';
import { useLocation, useSearchParams } from 'react-router-dom';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Meteors } from '@/components/magicui/meteors';
import { LazyImageWrapper } from '@/components/lazy-image';
import { CreateBookingInput, RouteDirection } from '@/gql/graphql';
import { useCreateBooking } from '@/features/booking';
import { toast } from 'sonner';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { cn } from '@/lib/utils';
import { SparklesText } from '@/components/ui/sparkles-text';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAtom } from 'jotai';
import { breakpointsAtom } from '@/lib/atoms/tailwind';
import { useEffect, useRef } from 'react';
import { useRouteByIds } from '@/features/routes';
import { keepPreviousData } from '@tanstack/react-query';
import { activeStepAtom, containerRefAtom } from '@/lib/atoms/ui';
import { HeartHandshake, Loader2 } from 'lucide-react';
import BookingResult from '@/pages/home/__booking-result';
import DepartureArrivalCitiesInfo from '@/pages/home/__departure-arrival-cities-info';
import SchedulesInfo from '@/pages/home/__schedules-info';
import { useIsFirstRender } from '@/hooks/use-is-first-render';
import { useAuthenticateTelegramLogin, useGetMe } from '@/features/auth';
import { createdBookingAtom } from '@/lib/atoms/booking';
import { useTelegramLogin } from '@telegram-login-ultimate/react';
import NotificationForTelegram from './home/__notification-for-telegram';
import { Icons } from '@/components/icons';
import ConfirmInfo from './home/__confirm-info';
import { SonnerSpinner } from '@/components/sonner-spinner';

export type DefaultValues = {
  firstName: string;
  lastName: string;
  phones: { value: string; telegram: boolean; whatsapp: boolean }[];
  seatsCount: number;
  travelDate: Date | null;
  arrivalCityId: string;
  departureCityId: string;
};

const defaultValues: DefaultValues = {
  firstName: '',
  lastName: '',
  phones: [{ value: '', telegram: false, whatsapp: false }],
  seatsCount: 1,
  travelDate: null,
  arrivalCityId: '',
  departureCityId: '',
};

function getStepContent(step: number) {
  switch (step) {
    case 1:
      return <DepartureArrivalCitiesInfo />;
    case 2:
      return <SchedulesInfo />;
    case 3:
      return <NotificationForTelegram />;
    case 4:
      return <ConfirmInfo />;
    case 5:
      return <BookingResult />;
    default:
      return 'Unknown step';
  }
}

export default function HomePage() {
  const [, setCreatedBooking] = useAtom(createdBookingAtom);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [, setContainerRef] = useAtom(containerRefAtom);
  const isInitialRender = useIsFirstRender();

  const [breakpoints] = useAtom(breakpointsAtom);
  const isTablet = useMediaQuery(`(min-width: ${breakpoints.md}px)`);

  const [activeStep, setActiveStep] = useAtom(activeStepAtom);
  useEffect(() => {
    setContainerRef(containerRef);
    return () => setContainerRef(null);

    // eslint-disable-next-line
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  const departureCityId = searchParams.get('departureCityId')!;
  const arrivalCityId = searchParams.get('arrivalCityId')!;
  const form = useForm<DefaultValues>({
    defaultValues,
  });

  const { data: routeData } = useRouteByIds({
    arrivalCityId,
    departureCityId,
    options: {
      enabled: !!arrivalCityId && !!departureCityId,
      placeholderData: keepPreviousData,
    },
  });

  const { mutateAsync: authenticate, isPending: isTelegramAuthPending } =
    useAuthenticateTelegramLogin();
  const { refetch: refetchUser, data, isPending: isUserPending } = useGetMe();
  const { me: user } = data || {};

  const { isSubmitting, isSubmitSuccessful } = form.formState;

  const location = useLocation();

  useEffect(() => {
    if (
      (!departureCityId && !arrivalCityId) ||
      !departureCityId ||
      !arrivalCityId
    ) {
      setActiveStep(1);
    }
  }, [location.search]);

  useEffect(() => {
    if (activeStep === 1 && isSubmitSuccessful) {
      form.reset();
    }
  }, [isSubmitSuccessful, activeStep]);

  const [openTelegramPopup, { isPending: isTelegramPending }] =
    useTelegramLogin({
      botId: import.meta.env.VITE_TELEGRAM_BOT_ID,
      onSuccess: async user => {
        // The auth_date should be a Unix timestamp (number of seconds since epoch)
        await authenticate({
          input: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            photo_url: user.photo_url,
            auth_date: user.auth_date * 1000, // Keep as Unix timestamp
            hash: user.hash,
          },
        });
        await refetchUser();
        toast.success(
          'Успешный вход через Telegram, бот уведомит вас об бронировании, спасибо!',
        );
        setActiveStep(4);
      },
      onFail: () => {
        toast.error('Не удалось войти через Telegram.');
      },
    });

  const { mutateAsync: createBooking, data: receivedBooking } =
    useCreateBooking();
  const onSubmit: SubmitHandler<DefaultValues> = async ({
    phones,
    ...data
  }) => {
    try {
      const direction = routeData?.routeByIds?.direction as RouteDirection;

      const {
        value: mainPhoneNumber,
        telegram: mainTelegram,
        whatsapp: mainWhatsapp,
      } = phones[0];

      // optional phone
      const {
        value: extraPhoneNumber,
        telegram: extraTelegram,
        whatsapp: extraWhatsapp,
      } = phones[1] || [];

      const payload: CreateBookingInput = {
        ...data,
        travelDate: data.travelDate,
        phoneNumber: mainPhoneNumber,
        telegram: mainTelegram,
        whatsapp: mainWhatsapp,
        extraPhoneNumber,
        extraTelegram,
        extraWhatsapp,
        direction,
        telegramId: user?.telegram?.telegramId,
      };

      const createdBooking = await createBooking({ input: payload });

      setCreatedBooking(receivedBooking || createdBooking);

      setActiveStep(5);
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

  useEffect(() => {
    if (!isInitialRender) {
      // Now we only scroll when activeStep changes (after button clicks)
      const bounding = containerRef.current?.getBoundingClientRect();
      const top = bounding?.top ?? 0;

      window.scrollBy({
        top: top - 60,
        behavior: 'smooth',
      });
    }

    // eslint-disable-next-line
  }, [activeStep]);

  const handleComplete = () => {
    setSearchParams(p => {
      const keys = [...p.entries()].map(([key]) => key);
      const query = new URLSearchParams(p.toString());
      keys.forEach(key => query.delete(key));
      return query;
    });
    setActiveStep(1);
    setCreatedBooking(undefined);
  };

  const handleNext = async () => {
    const isStepValid = await form.trigger(undefined, { shouldFocus: true });
    if (isStepValid) {
      setActiveStep(prevActiveStep => prevActiveStep + 1);
    }
  };

  const handleSpecific = (activeStep: number) => {
    setActiveStep(activeStep);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  return (
    <div className='flex-1 flex flex-col bg-gradient-to-b from-background to-background/95 font-inter'>
      <section
        className={cn(
          'relative -top-[3.5rem] py-8 md:py-16 overflow-hidden',
          !isTablet && 'top-0',
          activeStep !== 1 && 'pt-0',
        )}
      >
        {isTablet && (
          <div className='absolute inset-0 z-0'>
            <div className='absolute inset-0 bg-gradient-to-b from-30% from-background via-background/50 via-70% to-background z-10' />
            <LazyImageWrapper
              src='/hero.png'
              fallbackSrc='/placeholder.svg'
              alt='Bus travel'
              className='grayscale object-cover w-full h-[calc(100%)]'
            />
          </div>
        )}

        <div className='container relative z-10'>
          {activeStep === 1 && (
            <div className='max-w-7xl mx-auto text-center mb-9 sm:mb-12 space-y-4'>
              <SparklesText className='flex font-normal sm:font-medium leading-none tracking-tighter font-nunito italic text-3xl md:text-6xl lg:text-7xl'>
                Пассажирские перевозки
                <span className='hidden sm:inline-block font-semibold text-4xl font-nunito sm:text-5xl md:text-6xl lg:text-7xl'>
                  в Мариуполь и на Азовское побережье
                </span>
                <span className='sm:hidden inline-block shrink justify-center flex-wrap font-bold text-4xl font-nunito md:text-6xl lg:text-7xl'>
                  в Мариуполь и на Азовское побережье
                </span>
              </SparklesText>
            </div>
          )}

          <div
            ref={containerRef}
            className='max-w-3xl mx-auto relative overflow-hidden'
          >
            <Form {...form}>
              <form
                onSubmit={e => {
                  e.preventDefault();
                }}
                noValidate
                className='space-y-6'
              >
                <div className='max-w-4xl mx-auto border bg-background rounded-2xl relative overflow-hidden z-10'>
                  <div className='absolute inset-0 z-0'>
                    <Meteors
                      tailStyles={cn(activeStep === 3 && 'from-sky-500')}
                      className={cn(
                        activeStep === 3 &&
                          'bg-sky-500 shadow-[0_0_0_1px_#00a8ff10]',
                      )}
                      key={activeStep}
                      number={5}
                    />
                  </div>
                  <div className='relative z-10 pt-5'>
                    {getStepContent(activeStep)}
                    <div className='flex flex-col-reverse flex-wrap-reverse xs:flex-row gap-2 px-4 p-5 md:p-12 md:pb-6 md:pt-3 justify-center'>
                      {activeStep !== 4 && activeStep !== 5 && (
                        <Button
                          type='button'
                          className='w-full xs:w-[100px]'
                          variant='secondary'
                          onClick={handleBack}
                          disabled={activeStep === 1}
                        >
                          Назад
                        </Button>
                      )}
                      {activeStep === 3 && !data?.me?.telegram?.telegramId ? (
                        <div className='flex items-stretch flex-col xs:flex-row gap-2'>
                          <Button
                            className='bg-sky-500 text-white leading-6 gap-2 hover:bg-sky-600 active:bg-sky-700'
                            onClick={e => {
                              e.preventDefault();
                              openTelegramPopup();
                            }}
                            disabled={
                              isTelegramPending ||
                              isTelegramAuthPending ||
                              isUserPending
                            }
                          >
                            {isTelegramPending ||
                            isTelegramAuthPending ||
                            isUserPending ? (
                              <>
                                <SonnerSpinner />
                                Ожидаем ответ от Telegram
                              </>
                            ) : (
                              <>
                                <Icons.telegram className='fill-white' />
                                Подключить уведомление к Telegram
                              </>
                            )}
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            className='text-muted-foreground'
                            onClick={handleNext}
                          >
                            Пропустить
                          </Button>
                        </div>
                      ) : activeStep === 4 ? (
                        <>
                          <Button
                            type='button'
                            className='w-full xs:max-w-[180px]'
                            variant='secondary'
                            onClick={() => handleSpecific(1)}
                          >
                            Вернуться на главную
                          </Button>
                          <Button
                            className='px-8'
                            type='submit'
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className='animate-spin' />
                                Оформляем заявку
                              </>
                            ) : (
                              <>Заказать билет</>
                            )}
                          </Button>
                        </>
                      ) : activeStep === 5 ? (
                        <Button
                          type='button'
                          className='w-auto xs:w-fit px-12'
                          onClick={handleComplete}
                        >
                          Спасибо
                          <HeartHandshake className='size-5' />
                        </Button>
                      ) : (
                        <Button
                          type='button'
                          className='w-full xs:w-[100px]'
                          onClick={() => {
                            if (
                              activeStep === 2 &&
                              data?.me?.telegram?.telegramId
                            ) {
                              return handleSpecific(4);
                            }

                            handleNext();
                          }}
                        >
                          Далее
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>
    </div>
  );
}
