import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ComboBox } from '@/components/combo-box';
import { ArrowRightLeft, Search } from 'lucide-react';
import { Meteors } from '@/components/magicui/meteors';
import { LazyImageWrapper } from '@/components/lazy-image';
import { useTheme } from '@/lib/atoms/theme';
import { Particles } from '@/components/magicui/particles';
import { FormButton } from '@/components/form-button';
import { useArrivalCities, useDepartureCities } from '@/features/city';
import { useRouteByIds } from '@/features/routes';
import { warn } from 'console';
import { useSchedulesByIds } from '@/features/schedule';

const FormSchema = z.object({
  departureCityId: z
    .string({
      invalid_type_error: 'Выберите город отправления!',
    })
    .min(1, { message: 'Выберите город отправления!' }),
  arrivalCityId: z
    .string({
      invalid_type_error: 'Выберите город прибытия!',
    })
    .min(1, { message: 'Выберите город прибытия!' }),
});

type FormValues = z.infer<typeof FormSchema>;

// Mock popular routes
// const popularRoutes = [
//   {
//     id: 'route1',
//     departureCity: {
//       id: 'city1',
//       name: 'Москва',
//       description: 'Центральный вокзал',
//     },
//     arrivalCity: {
//       id: 'city2',
//       name: 'Санкт-Петербург',
//       description: 'Автовокзал',
//     },
//     price: 1200,
//     photoName: null,
//     region: { name: 'Центральный регион' },
//   },
//   {
//     id: 'route2',
//     departureCity: {
//       id: 'city1',
//       name: 'Москва',
//       description: 'Центральный вокзал',
//     },
//     arrivalCity: {
//       id: 'city3',
//       name: 'Казань',
//       description: 'Центральный автовокзал',
//     },
//     price: 1500,
//     photoName: null,
//     region: { name: 'Поволжье' },
//   },
//   {
//     id: 'route3',
//     departureCity: {
//       id: 'city2',
//       name: 'Санкт-Петербург',
//       description: 'Автовокзал',
//     },
//     arrivalCity: { id: 'city6', name: 'Сочи', description: 'Автовокзал' },
//     price: 2500,
//     photoName: null,
//     region: { name: 'Южный регион' },
//   },
// ];

export default function HomePage() {
  const theme = useTheme();
  const shadowColor = theme.theme === 'dark' ? '#fff' : '#000';
  const navigate = useNavigate();

  // Search Params syncronization
  const [searchParams, setSearchParams] = useSearchParams();
  const departureCityId = searchParams.get('departureCityId')!;
  const arrivalCityId = searchParams.get('arrivalCityId')!;

  // arrivalCities
  const { data: arrivalData, isLoading: arrivalIsLoading } = useArrivalCities({
    cityId: departureCityId,
    options: { enabled: !!departureCityId },
  });
  const arrivalCities = useMemo(
    () => arrivalData?.arrivalCities || [],
    [arrivalData],
  );

  // departureCities
  const { data: departureData, isPending: departureIsPending } =
    useDepartureCities();
  const departureCities = useMemo(
    () => departureData?.departureCities || [],
    [departureData],
  );

  const { data: routeData } = useRouteByIds({
    arrivalCityId,
    departureCityId,
    options: {
      enabled: !!arrivalCityId && !!departureCityId,
    },
  });

  const route = useMemo(() => routeData?.routeByIds || null, [routeData]);
  console.log({ route });

  const { data: schedulesData, isLoading: schedulesIsLoading } =
    useSchedulesByIds({
      arrivalCityId,
      departureCityId,
      options: {
        enabled: !!arrivalCityId && !!departureCityId,
      },
    });

  // Обновим функцию сортировки расписаний, чтобы правильно обрабатывать строковые значения enum
  const schedules = useMemo(() => {
    return schedulesData?.schedulesByIds ?? [];
  }, [schedulesData]);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      departureCityId: '',
      arrivalCityId: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    // Navigate to booking page with query params
    navigate(
      `/booking-bus?departureCityId=${data.departureCityId}&arrivalCityId=${data.arrivalCityId}`,
    );
  };

  // Function to swap departure and arrival cities
  const handleSwapCities = () => {
    console.log('clicked');
    const departureCityId = form.getValues('departureCityId');
    const arrivalCityId = form.getValues('arrivalCityId');

    if (departureCityId && arrivalCityId) {
      form.setValue('departureCityId', arrivalCityId, { shouldValidate: true });
      form.setValue('arrivalCityId', departureCityId, { shouldValidate: true });
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());

        query.set('departureCityId', arrivalCityId);
        query.set('arrivalCityId', departureCityId);

        return query;
      });
    }
  };

  // New effect to handle URL parameter changes
  useEffect(() => {
    const clearFields = () => {
      form.setValue('departureCityId', '', { shouldValidate: false });
      form.setValue('arrivalCityId', '', { shouldValidate: false });
      setSearchParams(
        params => {
          const query = new URLSearchParams(params.toString());
          query.delete('departureCityId');
          query.delete('arrivalCityId');
          return query;
        },
        { replace: true },
      );
    };

    // Check if departure cities are loaded
    if (!departureCities.length || arrivalIsLoading) return;

    // Reset form if departure city is cleared
    if (!departureCityId) {
      clearFields();
      return;
    }

    // Validate and set departure city if exists in the list
    const validDepartureCity = departureCities.find(
      city => city.id === departureCityId,
    );
    if (validDepartureCity) {
      form.setValue('departureCityId', validDepartureCity.id, {
        shouldValidate: true,
      });

      // If arrival city is present, validate it
      if (arrivalCityId) {
        const validArrivalCity = arrivalCities.find(
          city => city.id === arrivalCityId,
        );

        if (validArrivalCity) {
          form.setValue('arrivalCityId', validArrivalCity.id, {
            shouldValidate: true,
          });
        } else {
          // Clear invalid arrival city
          form.setValue('arrivalCityId', '', { shouldValidate: false });
          setSearchParams(
            params => {
              const query = new URLSearchParams(params.toString());
              query.delete('arrivalCityId');
              return query;
            },
            { replace: true },
          );
        }
      } else {
        form.setValue('arrivalCityId', '', { shouldValidate: false });
        setSearchParams(
          params => {
            const query = new URLSearchParams(params.toString());
            query.delete('arrivalCityId');
            return query;
          },
          { replace: true },
        );
      }
    } else {
      // Clear invalid departure city and related arrival city
      clearFields();
    }
  }, [
    arrivalIsLoading,
    arrivalCityId,
    departureCityId,
    departureCities,
    arrivalCities,
    form,
    setSearchParams,
  ]);


  return (
    <div className='flex-1 flex flex-col bg-gradient-to-b from-background to-background/95 font-inter'>
      <section className='relative -top-[3.5rem] py-16 md:py-24 overflow-hidden'>
        <div className='absolute inset-0 z-[1]'>
          <Particles
            className='h-full'
            color={shadowColor}
            quantity={100}
            ease={80}
          />
        </div>
        <div className='absolute inset-0 z-0'>
          <div className='absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-10' />
          <LazyImageWrapper
            src='/hero.png'
            fallbackSrc='/placeholder.svg?height=600&width=1600'
            alt='Bus travel'
            className='object-cover w-full h-[calc(100%)]'
          />
        </div>

        <div className='container relative z-10 mt-[3.5rem]'>
          <div className='max-w-5xl mx-auto text-center mb-9 sm:mb-12 space-y-4'>
            <h1 className='text-5xl font-thin leading-none tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-nunito italic'>
              Пассажирские перевозки
              <span className='hidden sm:flex justify-center font-semibold text-4xl font-nunito sm:text-5xl md:text-6xl lg:text-7xl'>
                в Азовское побережье и ЛДНР
              </span>
              <span className='sm:hidden flex flex-col justify-center font-semibold text-4xl font-nunito sm:text-5xl md:text-6xl lg:text-7xl'>
                в Азовское побережье <span>и ЛДНР</span>
              </span>
            </h1>
          </div>

          <div className='max-w-3xl mx-auto relative overflow-hidden'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                <div className='max-w-4xl mx-auto bg-gradient-to-r from-primary-foreground/90 to-primary-foreground/90 rounded-2xl px-4 p-5 md:p-12 relative overflow-hidden space-y-4 z-[1000]'>
                  <div className='absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]' />
                  <div className='absolute inset-0 z-0'>
                    <Meteors number={10} className='opacity-30' />
                  </div>
                  <div className='relative z-10'>
                    <h2 className='text-2xl md:text-3xl font-bold mb-4 text-center'>
                      Выберите нужный вам маршрут
                    </h2>
                    <p className='text-muted-foreground text-center mb-8 max-w-2xl mx-auto'>
                      Выберите откуда вы хотите поехать и куда
                    </p>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10'>
                    <FormField
                      control={form.control}
                      name='departureCityId'
                      render={({ field: { onChange, ...field } }) => {
                        return (
                          <FormItem>
                            <FormLabel>Город отправления</FormLabel>
                            <ComboBox
                              inputPlaceholder={'Искать город...'}
                              emptyLabel={'Не найдено городов'}
                              label={'Выберите откуда'}
                              isLoading={departureIsPending}
                              items={departureCities}
                              onValueChange={value => {
                                onChange(value);
                                form.setValue('arrivalCityId', '', {
                                  shouldValidate: false,
                                });
                                setSearchParams(params => {
                                  const query = new URLSearchParams(
                                    params.toString(),
                                  );
                                  query.set('departureCityId', value);
                                  query.delete('arrivalCityId');
                                  return query;
                                });
                              }}
                              {...field}
                            />
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    {/* Swap button for mobile and desktop */}
                    <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 md:block hidden'>
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        className='rounded-full bg-background shadow-md hover:bg-primary/10'
                        onClick={handleSwapCities}
                        disabled={
                          !form.watch('departureCityId') ||
                          !form.watch('arrivalCityId')
                        }
                      >
                        <ArrowRightLeft className='h-4 w-4' />
                        <span className='sr-only'>Поменять города местами</span>
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name='arrivalCityId'
                      render={({ field: { onChange, ...field } }) => {
                        return (
                          <FormItem>
                            <FormLabel>Город прибытия</FormLabel>
                            <ComboBox
                              inputPlaceholder={'Искать город...'}
                              emptyLabel={'Не найдено городов'}
                              label={'Выберите куда'}
                              isLoading={arrivalIsLoading}
                              items={arrivalCities}
                              disabled={!form.watch('departureCityId')}
                              onValueChange={value => {
                                onChange(value);
                                setSearchParams(params => {
                                  const query = new URLSearchParams(
                                    params.toString(),
                                  );
                                  query.set('arrivalCityId', value);
                                  return query;
                                });
                              }}
                              {...field}
                            />
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  {/* Mobile swap button */}
                  <div className='relative z-10 flex justify-center md:hidden'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='rounded-full xs:w-auto w-full'
                      onClick={handleSwapCities}
                      disabled={
                        !form.watch('departureCityId') ||
                        !form.watch('arrivalCityId')
                      }
                    >
                      <ArrowRightLeft className='h-4 w-4 mr-2' />
                      <span>Поменять местами</span>
                    </Button>
                  </div>

                  <div className='relative z-10 flex justify-center pb-5'>
                    <FormButton
                      type='submit'
                      className='relative overflow-hidden px-10 w-full xs:w-auto'
                      size='lg'
                    >
                      <span className='relative z-10 flex items-center justify-center gap-2'>
                        <Search className='h-4 w-4' />
                        Найти маршрут
                      </span>
                      <span className='absolute inset-0 w-full h-full bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 -translate-x-full group-hover:animate-shine'></span>
                    </FormButton>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>

      {/* <section className='py-12 md:py-16 bg-gradient-to-b from-background/50 to-background'> */}
      {/*   <div className='container'> */}
      {/*     <div className='flex flex-col items-center justify-center space-y-4 text-center mb-8'> */}
      {/*       <h2 className='relative text-3xl md:text-4xl font-bold tracking-tighter'> */}
      {/*         Популярные маршруты */}
      {/*         <span className='w-[50%] mx-auto sm:w-auto absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent'></span> */}
      {/*       </h2> */}
      {/*       <p className='text-muted-foreground max-w-[700px] mt-2'> */}
      {/*         Выбирайте из самых востребованных направлений с регулярным */}
      {/*         расписанием */}
      {/*       </p> */}
      {/*     </div> */}
      {/**/}
      {/*     <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'> */}
      {/*       {popularRoutes.map(route => ( */}
      {/*         <div */}
      {/*           key={route.id} */}
      {/*           className='group relative flex flex-col overflow-hidden rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm h-full' */}
      {/*         > */}
      {/*           <div className='absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div> */}
      {/**/}
      {/*           <div className='relative w-full h-48 overflow-hidden'> */}
      {/*             <div className='absolute inset-0 bg-gradient-to-b from-transparent to-background/20 z-10'></div> */}
      {/*             <LazyImageWrapper */}
      {/*               src={ */}
      {/*                 route.photoName */}
      {/*                   ? `/uploads/images/${route.photoName}` */}
      {/*                   : `/placeholder.svg?height=200&width=400` */}
      {/*               } */}
      {/*               fallbackSrc='/placeholder.svg?height=200&width=400' */}
      {/*               alt={`Маршрут ${route.departureCity.name} - ${route.arrivalCity.name}`} */}
      {/*               className='object-cover w-full h-full transition-transform duration-700 group-hover:scale-110' */}
      {/*             /> */}
      {/*             {route.region && ( */}
      {/*               <div className='absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm text-foreground px-2 py-1 rounded-full text-xs font-medium shadow-sm'> */}
      {/*                 <MapPin className='h-3 w-3 text-primary' /> */}
      {/*                 <span>{route.region.name}</span> */}
      {/*               </div> */}
      {/*             )} */}
      {/*           </div> */}
      {/**/}
      {/*           <div className='flex-1 flex flex-col justify-between p-4'> */}
      {/*             <div className='flex flex-wrap justify-center items-center gap-2 mb-3'> */}
      {/*               <h3 className='text-lg font-bold'> */}
      {/*                 {route.departureCity.name} — {route.arrivalCity.name} */}
      {/*               </h3> */}
      {/*             </div> */}
      {/**/}
      {/*             <div className='flex flex-col gap-y-2 sm:flew-row items-center justify-between'> */}
      {/*               <div className='flex self-center items-baseline gap-1'> */}
      {/*                 <span className='text-3xl font-bold text-foreground'> */}
      {/*                   {route.price} ₽ */}
      {/*                 </span> */}
      {/*               </div> */}
      {/*               <FormButton */}
      {/*                 size='sm' */}
      {/*                 className='relative overflow-hidden w-full sm:w-auto self-end sm:self-center sm:px-12' */}
      {/*                 onClick={() => { */}
      {/*                   navigate( */}
      {/*                     `/booking-bus?departureCityId=${route.departureCity.id}&arrivalCityId=${route.arrivalCity.id}`, */}
      {/*                   ); */}
      {/*                   window.scrollTo({ top: 0, behavior: 'smooth' }); */}
      {/*                 }} */}
      {/*               > */}
      {/*                 <span className='relative z-10'>Выбрать маршрут</span> */}
      {/*               </FormButton> */}
      {/*             </div> */}
      {/*           </div> */}
      {/*         </div> */}
      {/*       ))} */}
      {/*     </div> */}
      {/**/}
      {/*     <div className='mt-8 text-center'> */}
      {/*       <Button */}
      {/*         variant='outline' */}
      {/*         className='group' */}
      {/*         onClick={() => { */}
      {/*           navigate('/routes'); */}
      {/*           window.scrollTo({ top: 0, behavior: 'smooth' }); */}
      {/*         }} */}
      {/*       > */}
      {/*         <span>Смотреть все маршруты</span> */}
      {/*         <span className='ml-2 transition-transform duration-300 group-hover:translate-x-1'> */}
      {/*           → */}
      {/*         </span> */}
      {/*       </Button> */}
      {/*     </div> */}
      {/*   </div> */}
      {/* </section> */}

      {/* CTA Section */}
      {/* <section className='py-16 md:py-20'> */}
      {/*   <div className='container'> */}
      {/*     <div className='max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-primary/5 rounded-2xl p-8 md:p-12 relative overflow-hidden'> */}
      {/*       <div className='absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]' /> */}
      {/*       <div className='absolute inset-0 z-0'> */}
      {/*         <Meteors number={10} className='opacity-30' /> */}
      {/*       </div> */}
      {/*       <div className='relative z-10'> */}
      {/*         <h2 className='text-2xl md:text-3xl font-bold mb-4 text-center'> */}
      {/*           Готовы к путешествию? */}
      {/*         </h2> */}
      {/*         <p className='text-muted-foreground text-center mb-8 max-w-2xl mx-auto'> */}
      {/*           Забронируйте билет прямо сейчас и отправляйтесь в комфортное */}
      {/*           путешествие по России с нашим сервисом */}
      {/*         </p> */}
      {/*         <div className='flex flex-col sm:flex-row gap-4 justify-center'> */}
      {/*           <FormButton */}
      {/*             size='lg' */}
      {/*             className='w-auto px-10 bg-primary hover:bg-primary/90 text-primary-foreground relative overflow-hidden group' */}
      {/*             onClick={() => { */}
      {/*               navigate('/routes'); */}
      {/*               window.scrollTo({ top: 0, behavior: 'smooth' }); */}
      {/*             }} */}
      {/*           > */}
      {/*             <Search /> */}
      {/*             <span className='relative z-10'>Найти маршрут</span> */}
      {/*           </FormButton> */}
      {/*         </div> */}
      {/*       </div> */}
      {/*     </div> */}
      {/*   </div> */}
      {/* </section> */}
    </div>
  );
}
