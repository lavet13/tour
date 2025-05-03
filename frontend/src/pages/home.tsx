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
import { useEffect, useMemo, useRef } from 'react';
import { useRouteByIds } from '@/features/routes';
import { keepPreviousData } from '@tanstack/react-query';
import { activeStepAtom, containerRefAtom } from '@/lib/atoms/ui';
import { Loader2 } from 'lucide-react';
import BookingResult from '@/pages/home/__booking-result';
import DepartureArrivalCitiesInfo from '@/pages/home/__departure-arrival-cities-info';
import SchedulesInfo from '@/pages/home/__schedules-info';
import { is } from 'date-fns/locale';
import { useIsFirstRender } from '@/hooks/use-is-first-render';

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
      return <BookingResult />;
    default:
      return 'Unknown step';
  }
}

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [, setContainerRef] = useAtom(containerRefAtom);
  const isInitialRender = useIsFirstRender();

  const [breakpoints] = useAtom(breakpointsAtom);
  const isDesktop = useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
  const isTablet = useMediaQuery(`(min-width: ${breakpoints.md}px)`);
  const isMobile = useMediaQuery(`(min-width: ${breakpoints.sm}px)`);

  const [activeStep, setActiveStep] = useAtom(activeStepAtom);
  useEffect(() => {
    setContainerRef(containerRef);
    return () => setContainerRef(null);
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

  const { isSubmitting, isSubmitSuccessful, dirtyFields, errors } =
    form.formState;
  const values = form.getValues();
  console.log({ isSubmitSuccessful });
  console.log({
    errors,
    dirtyFields,
    values,
  });

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
    if (activeStep === 1) {
      form.reset();
    }
  }, [isSubmitSuccessful, activeStep]);

  const { mutateAsync: createBooking } = useCreateBooking();
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
      };
      await createBooking({ input: payload });

      setActiveStep(3);
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

  useEffect(() => {
    if (!isInitialRender) {
      // Now we only scroll when activeStep changes (after button clicks)
      const bounding = containerRef.current?.getBoundingClientRect();
      const top = bounding?.top ?? 0;

      // You can still keep specific behavior for different steps if needed
      if (activeStep !== 1) {
        window.scrollBy({
          top: top - 60,
          behavior: 'smooth',
        });
      } else {
        window.scrollBy({
          top: top - 60,
          behavior: 'smooth',
        });
      }
    }
  }, [activeStep]);

  const handleComplete = () => {
    setSearchParams(p => {
      console.log({ entries: [...p.entries()] });
      const keys = [...p.entries()].map(([key]) => key);
      const query = new URLSearchParams(p.toString());
      keys.forEach(key => query.delete(key));
      return query;
    });
    setActiveStep(1);
  };

  const handleNext = async () => {
    const isStepValid = await form.trigger(undefined, { shouldFocus: true });
    if (isStepValid) {
      setActiveStep(prevActiveStep => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  let size = 'sm' as 'sm' | 'md' | 'lg';
  if (isMobile) {
    size = 'sm' as const;
  }
  if (isTablet) {
    size = 'md' as const;
  }
  if (isDesktop) {
    size = 'lg' as const;
  }
  console.log({ size });

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
              <form noValidate className='space-y-6'>
                <div className='max-w-4xl mx-auto border bg-background rounded-2xl relative overflow-hidden z-10'>
                  <div className='absolute inset-0 z-0'>
                    <Meteors number={5} />
                  </div>
                  <div className='relative z-10 pt-5'>
                    {getStepContent(activeStep)}
                    <div className='flex flex-col-reverse xs:flex-row gap-2 px-4 p-5 md:p-12 md:pb-6 md:pt-3 justify-center'>
                      {activeStep !== 3 && (
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
                      {activeStep === 2 ? (
                        <Button
                          className='px-8'
                          type='button'
                          onClick={form.handleSubmit(onSubmit)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className='animate-spin' />
                              Принимаем заявку
                            </>
                          ) : (
                            'Заказать билет'
                          )}
                        </Button>
                      ) : activeStep === 3 ? (
                        <Button
                          type='button'
                          className='w-auto xs:w-fit'
                          onClick={handleComplete}
                        >
                          Ладно, идем дальше
                        </Button>
                      ) : (
                        <Button
                          type='button'
                          className='w-full xs:w-[100px]'
                          onClick={handleNext}
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
