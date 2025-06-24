import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ComboBox } from '@/components/combo-box';
import { useCities } from '@/features/city/api/queries';
import { FC, memo, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SonnerSpinner } from '@/components/sonner-spinner';
import { CalendarClock, Edit, MapPinPlus } from 'lucide-react';
import { useRegions } from '@/features/region/api/queries';
import { DatePicker } from '@/components/date-picker';
import { Switch } from '@/components/ui/switch';
import { useRouteById, useRoutesGallery } from '@/features/routes/api/queries';
import {
  useCreateRoute,
  useUpdateRoute,
  useUploadPhotoRoute,
} from '@/features/routes/api/mutations';
import { toast } from 'sonner';
import { CreateRouteInput } from '@/gql/graphql';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { NumericFormat } from 'react-number-format';
import { Input } from '@/components/ui/input';
import {
  RouteFormSkeleton,
  RouteFormSchema,
  RouteFormValues,
  defaultValues,
} from '@/features/routes/components';
import { DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { FileUploader } from '@/components/file-uploader';
import RoutesGallery, { pageAtom } from './route-gallery';
import { LazyImageWrapper } from '@/components/lazy-image';
import { useAtom } from 'jotai';

interface RouteFormProps<T extends string> {
  drawerMode: T;
  routeId: string | null;
  onClose: () => void;
  sidebarExpanded: boolean;
}

export const RouteForm: FC<RouteFormProps<'addRoute' | 'editRoute' | 'idle'>> =
  memo(({ drawerMode, routeId, onClose }) => {
    const ITEMS_PER_PAGE = 8;
    const [page] = useAtom(pageAtom);
    const navigate = useNavigate();
    const {
      data: routeData,
      fetchStatus: routeFetchStatus,
      status: routeStatus,
      isSuccess: routeIsSuccess,
      isFetching: routeIsFetching,
    } = useRouteById({
      id: routeId,
      options: {
        enabled: !!routeId,
      },
    });

    const previewPhoto = routeData?.routeById?.photoName;
    const [isPhotoSelected, setIsPhotoSelected] = useState(false);
    const departureCityName = routeData?.routeById?.departureCity?.name ?? '';
    const arrivalCityName = routeData?.routeById?.arrivalCity?.name ?? '';

    const values = routeData?.routeById
      ? {
          arrivalCityId: routeData.routeById.arrivalCity?.id as string,
          departureCityId: routeData.routeById.departureCity?.id as string,
          regionId: routeData.routeById.region?.id ?? null,
          departureDate: routeData.routeById.departureDate
            ? new Date(routeData.routeById.departureDate)
            : null,
          isActive: routeData.routeById.isActive,
          price: routeData.routeById.price,
          photo: [],
        }
      : undefined;

    const routeInitialLoading =
      routeFetchStatus === 'fetching' && routeStatus === 'pending';

    const form = useForm<RouteFormValues>({
      resolver: zodResolver(RouteFormSchema),
      defaultValues,
      values,
      mode: 'onChange',
    });

    const { mutateAsync: createRoute } = useCreateRoute();
    const { mutateAsync: updateRoute } = useUpdateRoute();

    const formState = form.formState;
    const isSubmitting = formState.isSubmitting;
    const isDirty = formState.isDirty;

    const { data: regionsData, isPending: regionsIsPending } = useRegions();
    const regions = useMemo(() => regionsData?.regions ?? [], [regionsData]);

    const { data: citiesData, isPending: citiesIsPending } = useCities();
    const cities = useMemo(() => citiesData?.cities ?? [], [citiesData]);

    // Watch both city fields
    const departureCityId = useWatch({
      control: form.control,
      name: 'departureCityId',
    });
    const arrivalCityId = useWatch({
      control: form.control,
      name: 'arrivalCityId',
    });
    const photo = useWatch({
      control: form.control,
      name: 'photo',
    });

    useMemo(() => {
      if (!photo?.length) {
        setIsPhotoSelected(false);
      }
    }, [photo, form]);

    // Trigger validation when either city changes
    useMemo(() => {
      if (departureCityId) {
        form.trigger('arrivalCityId');
      }
    }, [departureCityId, form]);

    useMemo(() => {
      if (arrivalCityId) {
        form.trigger('departureCityId');
      }
    }, [arrivalCityId, form]);

    // Filter out selected arrival city from departure cities
    // const departureCities = useMemo(() => {
    //   const selectedArrivalId = form.watch('arrivalCityId');
    //   return cities.filter(city => city.id !== selectedArrivalId);
    // }, [cities, form.watch('arrivalCityId')]);

    // Filter out selected departure city from arrival cities
    // const arrivalCities = useMemo(() => {
    //   const selectedDepartureId = form.watch('departureCityId');
    //   return cities.filter(city => city.id !== selectedDepartureId);
    // }, [cities, form.watch('departureCityId')]);

    const { data, mutateAsync: uploadPhoto } = useUploadPhotoRoute();
    const { refetch: refetchGallery } = useRoutesGallery({
      limit: ITEMS_PER_PAGE,
      offset: page * ITEMS_PER_PAGE,
      options: { enabled: !!open },
    });

    const onSubmit: SubmitHandler<RouteFormValues> = async ({
      photo,
      ...data
    }) => {
      try {
        if (drawerMode === 'editRoute') {
          // editing existing route
          const payload: CreateRouteInput = {
            ...data,
          };
          await updateRoute({
            id: routeId as string,
            input: payload,
          });
          if (photo?.length && routeId) {
            await uploadPhoto({ file: photo[0], isPhotoSelected, routeId });
          }
          toast.success('Маршрут успешно обновлен!', {
            richColors: true,
            position: 'top-center',
          });
        }
        if (drawerMode === 'addRoute') {
          // adding a new route
          const payload: CreateRouteInput = {
            ...data,
          };
          const createdRoute = await createRoute({ input: payload });
          const routeId = createdRoute.createRoute.id;
          if (photo?.length) {
            await uploadPhoto({ file: photo[0], isPhotoSelected, routeId });
          }
          toast.success('Новый маршрут добавлен!', {
            richColors: true,
            position: 'top-center',
          });
          form.reset();
        }
        refetchGallery();
        setIsPhotoSelected(false);
        onClose();
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
        <DrawerHeader className='pt-4 pb-2 md:pt-8 md:pb-2 md:px-5 flex flex-wrap items-center gap-2'>
          <DrawerTitle className='flex-1'>
            {drawerMode === 'addRoute' && (
              <span className='flex justify-center flex-wrap gap-2'>
                Добавить новый маршрут
              </span>
            )}
            {drawerMode === 'editRoute' && (
              <span className='flex justify-center flex-wrap gap-2'>
                Изменить маршрут
              </span>
            )}
            {drawerMode === 'idle' && <Skeleton className='h-6 w-full' />}
          </DrawerTitle>
        </DrawerHeader>
        <Separator className='mt-2 mb-4' />
        <DrawerHeader className='pt-0 pb-0 md:pt-0 md:pb-0 md:px-5 flex flex-wrap items-center gap-2'>
          {drawerMode === 'editRoute' && (
            <>
              <DrawerTitle className='flex flex-wrap items-center w-full justify-center gap-2'>
                {!routeInitialLoading && (
                  <>
                    <span>{departureCityName}</span>⇆
                    <span>{arrivalCityName}</span>
                  </>
                )}
                {routeInitialLoading && (
                  <span className='flex items-center gap-4'>
                    <Skeleton className='h-6 w-24' />⇆
                    <Skeleton className='h-6 w-24' />
                  </span>
                )}
              </DrawerTitle>
              <div className='flex items-center justify-center w-full'>
                {routeInitialLoading ? (
                  <Button
                    variant='ghost'
                    disabled
                    className='w-full col-span-2'
                  >
                    <Skeleton className='h-5 w-[200px]' />
                  </Button>
                ) : (
                  <Button
                    className='w-auto h-7 p-3'
                    variant='ghost'
                    onClick={() =>
                      navigate(`${routeData?.routeById?.id}/schedules`)
                    }
                  >
                    <CalendarClock />
                    Посмотреть расписание
                  </Button>
                )}
              </div>
            </>
          )}
        </DrawerHeader>
        {drawerMode === 'editRoute' && <Separator className='mt-2 mb-4' />}
        {routeIsFetching && routeIsSuccess && (
          <div className='w-full sm:max-w-screen-sm mx-auto'>
            <div className='flex items-center justify-center mb-6 px-4 sm:px-5'>
              <SonnerSpinner className='bg-foreground' />
            </div>
          </div>
        )}
        {routeInitialLoading && <RouteFormSkeleton />}
        {!routeInitialLoading && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='w-full sm:max-w-screen-sm space-y-6 mx-auto pb-3'
            >
              <div className='sm:grid sm:grid-cols-[repeat(auto-fit,_minmax(14rem,_1fr))] space-y-3 sm:space-y-0 sm:gap-y-4 sm:gap-x-2 px-4 sm:px-5'>
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
                          isLoading={citiesIsPending}
                          items={cities}
                          onValueChange={onChange}
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

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
                          isLoading={citiesIsPending}
                          items={cities}
                          onValueChange={onChange}
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name='regionId'
                  render={({ field: { onChange, ...field } }) => {
                    return (
                      <FormItem>
                        <FormLabel>Регион</FormLabel>
                        <ComboBox
                          inputPlaceholder={'Искать регион...'}
                          emptyLabel={'Не найдено регионов'}
                          label={'Выберите регион'}
                          isLoading={regionsIsPending}
                          items={regions}
                          onValueChange={onChange}
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name='departureDate'
                  render={({ field: { onChange, ...field } }) => {
                    return (
                      <FormItem>
                        <FormLabel>Активация поездки</FormLabel>
                        <DatePicker
                          label={'Выберите дату поездки'}
                          onValueChange={onChange}
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name='price'
                  render={({ field: { onChange, ref, value, ...field } }) => {
                    return (
                      <FormItem>
                        <FormLabel>Цена</FormLabel>
                        <FormControl>
                          <NumericFormat
                            type='tel'
                            placeholder='Введите цену для маршрута'
                            customInput={Input}
                            thousandSeparator=' '
                            suffix=' ₽'
                            decimalScale={0}
                            allowNegative={false}
                            isAllowed={values => {
                              const floatValue = values.floatValue;
                              return (
                                typeof floatValue === 'undefined' ||
                                floatValue > 0
                              );
                            }}
                            onValueChange={values =>
                              onChange(values.floatValue)
                            }
                            value={value || ''}
                            getInputRef={ref}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {previewPhoto && (
                  <FormItem className='sm:col-span-2'>
                    <FormLabel>Превьюшка</FormLabel>
                    <div className='col-span-2'>
                      <div
                        title={previewPhoto}
                        className={`flex flex-col relative border rounded-md overflow-hidden transition-all`}
                      >
                        <LazyImageWrapper
                          className='object-cover'
                          src={`/uploads/images/${previewPhoto}`}
                          fallbackSrc='/placeholder.svg'
                          alt={previewPhoto}
                        />
                        <div className='absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-white text-xs truncate'>
                          {previewPhoto}
                        </div>
                      </div>
                    </div>
                  </FormItem>
                )}

                <FormField
                  control={form.control}
                  name='photo'
                  render={({ field: { value, onChange, ref, ...field } }) => {

                    return (
                      <FormItem className='sm:col-span-2'>
                        <FormLabel>Фотография маршрута</FormLabel>
                        <FormControl>
                          <FileUploader
                            value={value}
                            onValueChange={onChange}
                            maxSize={1024 * 1024 * 10} // 10 MB
                            innerRef={ref}
                            {...field}
                            progresses={{}}
                            // disabled={isUploading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <RoutesGallery
                  value={isPhotoSelected}
                  onValueChange={setIsPhotoSelected}
                  drawerMode={drawerMode}
                  departureCityName={departureCityName}
                  arrivalCityName={arrivalCityName}
                />

                <FormField
                  control={form.control}
                  name='isActive'
                  render={({ field: { value, onChange, ...field } }) => {
                    return (
                      <FormItem className='col-span-2 flex flex-row items-center justify-between rounded-lg border shadow-sm pr-3 gap-1 sm:gap-0'>
                        <FormLabel className='flex-1 flex flex-col gap-1 py-3 ml-3 cursor-pointer'>
                          Активировать маршрут
                          <FormDescription className='text-xs font-normal'>
                            Сделать маршрут доступным для бронирования
                          </FormDescription>
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={value}
                            onCheckedChange={onChange}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />

                <Button
                  disabled={isSubmitting || !isDirty}
                  className={`w-full col-span-2`}
                  type='submit'
                >
                  {isSubmitting ? (
                    <>
                      <SonnerSpinner />
                      Пожалуйста подождите
                    </>
                  ) : drawerMode === 'editRoute' ? (
                    <>
                      <Edit />
                      Сохранить изменения
                    </>
                  ) : drawerMode === 'addRoute' ? (
                    <>
                      <MapPinPlus />
                      Добавить новый маршрут
                    </>
                  ) : null}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </>
    );
  });
