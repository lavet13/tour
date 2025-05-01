import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { useLocation, useSearchParams } from 'react-router-dom';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Meteors } from '@/components/magicui/meteors';
import { LazyImageWrapper } from '@/components/lazy-image';
import { CreateBookingInput, RouteDirection } from '@/gql/graphql';
import { useCreateBooking } from '@/features/booking';
import { toast } from 'sonner';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import DepartureArrivalCitiesInfo from '@/pages/__departure-arrival-cities-info';
import SchedulesInfo from './__schedules-info';
import { cn } from '@/lib/utils';
import { SparklesText } from '@/components/ui/sparkles-text';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAtom } from 'jotai';
import { breakpointsAtom } from '@/lib/atoms/tailwind';
import { useEffect, useState } from 'react';
import { useRouteByIds } from '@/features/routes';
import { keepPreviousData } from '@tanstack/react-query';

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
  seatsCount: 0,
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
    default:
      return 'Unknown step';
  }
}

export default function HomePage() {
  const [breakpoints] = useAtom(breakpointsAtom);
  const isTablet = useMediaQuery(`(min-width: ${breakpoints.md}px)`);

  const [activeStep, setActiveStep] = useState(1);

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

  const { isSubmitting, dirtyFields, errors } = form.formState;
  const values = form.getValues();
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
    setTimeout(() => {
      if (activeStep === 1) {
        form.reset({
          phones: [{ value: '', telegram: false, whatsapp: false }],
        });
      }
    }, 100);
  }, [activeStep]);

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

      setSearchParams(p => {
        const keys = [...p.entries()].map(([key]) => key);
        const query = new URLSearchParams(p.toString());
        keys.forEach(key => query.delete(key));
        return query;
      });

      toast.success('Заявка оформлена!', {
        richColors: true,
        position: 'top-center',
      });
      setActiveStep(1);
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

  const handleNext = async () => {
    const isStepValid = await form.trigger(undefined, { shouldFocus: true });
    if (isStepValid) {
      setActiveStep(prevActiveStep => prevActiveStep + 1);
    }
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
          <div className='max-w-7xl mx-auto text-center mb-9 sm:mb-12 space-y-4'>
            <SparklesText className='flex font-normal sm:font-medium leading-none tracking-tighter font-nunito italic text-5xl md:text-6xl lg:text-7xl'>
              Пассажирские перевозки
              <span className='hidden sm:inline-block font-semibold text-4xl font-nunito sm:text-5xl md:text-6xl lg:text-7xl'>
                в Мариуполь и на Азовское побережье
              </span>
              <span className='sm:hidden inline-block shrink justify-center flex-wrap font-semibold text-2xl font-nunito md:text-6xl lg:text-7xl'>
                в Мариуполь и на Азовское побережье
              </span>
            </SparklesText>
          </div>

          <div className='max-w-3xl mx-auto relative overflow-hidden'>
            <Form {...form}>
              <form noValidate className='space-y-6'>
                <div className='max-w-4xl mx-auto border bg-background rounded-2xl relative overflow-hidden z-10'>
                  <div className='absolute inset-0 z-0'>
                    <Meteors number={5} />
                  </div>
                  <div className='relative z-10 pt-3'>
                    {getStepContent(activeStep)}
                    <div className='flex flex-col-reverse xs:flex-row gap-2 px-4 p-5 md:p-12 md:pb-6 md:pt-3 justify-center'>
                      <Button
                        type='button'
                        className='w-full xs:w-[100px]'
                        variant='secondary'
                        onClick={handleBack}
                        disabled={activeStep === 1}
                      >
                        Назад
                      </Button>
                      {activeStep === 2 ? (
                        <Button
                          className='px-8'
                          type='button'
                          onClick={form.handleSubmit(onSubmit)}
                          disabled={isSubmitting}
                        >
                          Заказать билет
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
