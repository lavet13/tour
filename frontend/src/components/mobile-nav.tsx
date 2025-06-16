import { Button, buttonVariants } from '@/components/ui/button';
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  FC,
  ReactNode,
  useCallback,
  useMemo,
  useState,
  useEffect,
  forwardRef,
  FormEvent,
} from 'react';
import { Icons } from '@/components/icons';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  ChevronRight,
  ContactRound,
  ExternalLink,
  MessageCircleQuestion,
  Search,
  X,
} from 'lucide-react';
import { useGetMe } from '@/features/auth';
import {
  processCityRoutes,
  ProcessedCity,
} from '@/helpers/process-city-routes';
import { useRegionByName } from '@/features/region';
import { useRoutes } from '@/features/routes';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Role } from '@/gql/graphql';
import {
  NavLink as RouterLink,
  NavLinkProps as RouterLinkProps,
} from 'react-router-dom';

type NavLinkProps = Omit<RouterLinkProps, 'className'> & {
  children: ReactNode;
  className?: string;
};

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, className, onClick, ...props }, ref) => {
    // Combine the scroll behavior with any custom onClick handler
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      window.scrollTo({ top: 0 });
      onClick?.(e); // Call the custom onClick if provided
    };

    return (
      <RouterLink
        to={to}
        ref={ref}
        onClick={handleClick}
        className={({ isActive }) =>
          cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'transition-colors whitespace-nowrap',
            isActive && 'bg-accent',
            className,
          )
        }
        {...props}
      />
    );
  },
);

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const [contactIsOpen, setContactIsOpen] = useState(false);

  const [searchRoute, setSearchRoute] = useState('');
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [expandedRegions, setExpandedRegions] = useState<string[]>([]);

  const { data, isPending } = useGetMe();
  const { me: user } = data || {};
  const isAdminOrManager = user?.roles?.some(
    role => role === Role.Admin || role === Role.Manager,
  );

  const { data: ldnrRegion } = useRegionByName('ЛДНР');
  const { data: coastalRegion } = useRegionByName('Азовское побережье');

  const {
    data: ldnrData,
    isPending: ldnrIsPending,
    fetchStatus: ldnrFetchStatus,
  } = useRoutes(ldnrRegion?.regionByName?.id as string, {
    enabled: !!ldnrRegion,
  });

  const {
    data: coastalData,
    isPending: coastalIsPending,
    fetchStatus: coastalFetchStatus,
  } = useRoutes(coastalRegion?.regionByName?.id as string, {
    enabled: !!coastalRegion,
  });

  const coastalIsLoading =
    coastalFetchStatus === 'fetching' && coastalIsPending;
  const ldnrIsLoading = ldnrFetchStatus === 'fetching' && ldnrIsPending;

  const processedLDNR = processCityRoutes(ldnrData);
  const processedCoastal = processCityRoutes(coastalData);

  const routesIsLoading = ldnrIsLoading || coastalIsLoading;

  const filteredLDNR = useMemo(() => {
    return processedLDNR.filter(city =>
      city.name.toLowerCase().includes(searchRoute.toLowerCase()),
    );
  }, [processedLDNR, searchRoute]);

  const filteredCoastal = useMemo(() => {
    return processedCoastal.filter(city =>
      city.name.toLowerCase().includes(searchRoute.toLowerCase()),
    );
  }, [processedCoastal, searchRoute]);

  // Auto-expand regions when searching
  useEffect(() => {
    if (searchRoute.trim() === '') {
      // If search is cleared, collapse all regions
      setExpandedRegions([]);
    } else {
      // If searching, expand both regions
      setExpandedRegions(['ldnr', 'coastal']);
    }
  }, [searchRoute]);

  const toggleRegion = (regionId: string) => {
    setExpandedRegions(prev =>
      prev.includes(regionId)
        ? prev.filter(id => id !== regionId)
        : [...prev, regionId],
    );
  };

  // Handle search form submission
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    // This will dismiss the keyboard on mobile devices
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  // Clear search input
  const handleClearSearch = () => {
    setSearchRoute('');
  };

  return (
    <>
      <Drawer
        direction={'left'}
        open={open}
        onOpenChange={setOpen}
        onClose={() => setOpen}
      >
        <DrawerTrigger asChild>
          <Button
            className='w-8 h-8 shrink-0 md:hidden hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 [&_svg]:size-5 pr-1'
            variant='ghost'
            size='icon'
          >
            <Icons.sandwitch />
            <span className='sr-only'>Toggle menu</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent
          isSidebar
          direction='left'
          showCloseButton={false}
          showTheLine={false}
        >
          <div className='flex items-center p-4'>
            <Link
              to='/'
              onClick={() => {
                setOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={cn('flex items-center space-x-3')}
            >
              <Icons.logo className='size-6' />
              <span className='font-bold text-base'>Донбасс-Тур</span>
            </Link>
          </div>

          <div className='h-[calc(100vh-8rem)] pb-7'>
            <div className='flex flex-col h-full'>
              <nav className='flex flex-col'>
                {/* <SheetLink onOpenChange={setOpen} to='/routes'> */}
                {/*   Показать все рейсы */}
                {/* </SheetLink> */}
                {/* <SheetLink onOpenChange={setOpen} to='/booking-bus'> */}
                {/*   Заказать билет */}
                {/* </SheetLink> */}
              </nav>

              <div className='border-t'>
                <form onSubmit={handleSearchSubmit}>
                  <div className='relative flex items-center'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input
                      type='search'
                      placeholder='Найти город...'
                      className='pl-9 pr-9 h-10 bg-muted/30 rounded-none border-0'
                      value={searchRoute}
                      onChange={e => setSearchRoute(e.target.value)}
                    />
                    {searchRoute && (
                      <button
                        type='button'
                        onClick={handleClearSearch}
                        className='absolute right-3 top-1/2 transform -translate-y-1/2'
                      >
                        <X className='h-4 w-4 text-muted-foreground' />
                        <span className='sr-only'>Очистить поиск</span>
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Routes */}
              {routesIsLoading ? (
                <div className='p-4 space-y-3'>
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className='h-10 bg-muted/50 animate-pulse rounded-md'
                    />
                  ))}
                </div>
              ) : (
                <div>
                  {/* LDNR Region */}
                  <RegionSection
                    title='Рейсы ЛДНР'
                    isExpanded={expandedRegions.includes('ldnr')}
                    onToggle={() => toggleRegion('ldnr')}
                  >
                    {filteredLDNR.length === 0 ? (
                      <div className='py-2 px-4 text-sm text-muted-foreground'>
                        Не найдено городов
                      </div>
                    ) : (
                      <div>
                        {filteredLDNR.map(city => (
                          <CitySection
                            key={city.id}
                            city={city}
                            isExpanded={expandedCity === city.id}
                            onToggle={() =>
                              setExpandedCity(
                                expandedCity === city.id ? null : city.id,
                              )
                            }
                            onSelectRoute={() => setOpen(false)}
                          />
                        ))}
                      </div>
                    )}
                  </RegionSection>

                  {/* Coastal Region */}
                  <RegionSection
                    title='Рейсы Азовское побережье'
                    isExpanded={expandedRegions.includes('coastal')}
                    onToggle={() => toggleRegion('coastal')}
                  >
                    {filteredCoastal.length === 0 ? (
                      <div className='py-2 px-4 text-sm text-muted-foreground'>
                        Не найдено городов
                      </div>
                    ) : (
                      <div>
                        {filteredCoastal.map(city => (
                          <CitySection
                            key={city.id}
                            city={city}
                            isExpanded={expandedCity === city.id}
                            onToggle={() =>
                              setExpandedCity(
                                expandedCity === city.id ? null : city.id,
                              )
                            }
                            onSelectRoute={() => setOpen(false)}
                          />
                        ))}
                      </div>
                    )}
                  </RegionSection>
                </div>
              )}

              <div className='flex flex-col items-start grow justify-end space-y-1 pt-6 pl-2'>
                {!isPending && isAdminOrManager && (
                  <Button
                    variant='ghost'
                    className='w-fit px-2 py-0 space-x-1 h-9'
                    asChild
                  >
                    <Link to='/admin' rel='noreferrer'>
                      <ExternalLink />
                      <span>Админ панель</span>
                    </Link>
                  </Button>
                )}

                <Button
                  variant='ghost'
                  className='w-fit px-2 py-0 space-x-1 h-9'
                  asChild
                >
                  <NavLink
                    onClick={() => {
                      setOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    to='/question'
                  >
                    <MessageCircleQuestion />
                    <span>Задать вопрос</span>
                  </NavLink>
                </Button>

                <Drawer
                  open={contactIsOpen}
                  onOpenChange={setContactIsOpen}
                  onClose={() => setContactIsOpen(false)}
                >
                  <Button
                    className='px-2'
                    variant='ghost'
                    size='sm'
                    onClick={() => setContactIsOpen(true)}
                  >
                    <ContactRound />
                    Контакты
                  </Button>
                  <DrawerContent showCloseButton showTheLine={false}>
                    <DrawerHeader className='pt-7 pb-2 md:pt-8 md:pb-2 md:px-5 flex flex-col flex-wrap items-center gap-2'>
                      <DrawerTitle className='flex-1'>
                        <span className='flex items-center justify-center sm:justify-start flex-wrap gap-2'>
                          Контакты
                        </span>
                      </DrawerTitle>
                      <DrawerDescription>
                        Актуальные контакты для связи
                      </DrawerDescription>
                    </DrawerHeader>
                    <Separator className='mt-2 mb-4' />
                    <div className='w-full sm:max-w-screen-sm space-y-6 mx-auto pb-3'>
                      <div className='flex flex-col max-w-[250px] mx-auto'>
                        <Link
                          className={cn(
                            buttonVariants({ variant: 'link', size: 'sm' }),
                            'self-start [&_svg]:size-5',
                          )}
                          to='tel:+79493180304'
                        >
                          <Icons.phoenix />
                          <span>Феникс +7(949)318-03-04</span>
                        </Link>
                        <Link
                          className={cn(
                            buttonVariants({ variant: 'link', size: 'sm' }),
                            'self-start [&_svg]:size-5',
                          )}
                          to='tel:+7(949)439-56-16'
                        >
                          <Icons.phoenix />
                          <span>Феникс +7(949)439-56-16</span>
                        </Link>
                        <Link
                          className={cn(
                            buttonVariants({ variant: 'link', size: 'sm' }),
                            'self-start [&_svg]:size-5',
                          )}
                          target='_blank'
                          rel='noreferrer'
                          to='https://wa.me/+380713180304'
                        >
                          <Icons.whatsapp className='fill-foreground transition-colors' />
                          <span>Whatsapp +3(8071)318-03-04</span>
                        </Link>
                        <Link
                          className={cn(
                            buttonVariants({ variant: 'link', size: 'sm' }),
                            'self-start [&_svg]:size-5',
                          )}
                          target='_blank'
                          rel='noreferrer'
                          to='https://t.me/+79493180304'
                        >
                          <Icons.telegram className='fill-foreground transition-colors' />
                          <span>Telegram +7(949)318-03-04</span>
                        </Link>
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>

                <Button
                  variant='ghost'
                  className='w-fit px-2 py-0 space-x-1 h-9'
                  asChild
                >
                  <Link
                    to='https://vk.com/go_to_krym'
                    target='_blank'
                    rel='noreferrer'
                  >
                    <Icons.vkontakte className='basis-5 fill-foreground transition-colors' />
                    <span>Мы Вконтакте</span>
                  </Link>
                </Button>

                <Button
                  variant='ghost'
                  className='w-fit px-2 py-0 space-x-1 h-9'
                  asChild
                >
                  <Link
                    to='https://t.me/Donbass_Tur'
                    target='_blank'
                    rel='noreferrer'
                  >
                    <Icons.telegram className='basis-5 fill-foreground transition-colors' />
                    <span>Мы в Телеграме</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

interface RegionSectionProps {
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

const RegionSection = ({
  title,
  children,
  isExpanded,
  onToggle,
}: RegionSectionProps) => {
  return (
    <div className='border-t'>
      <button
        onClick={onToggle}
        className='flex items-center justify-between w-full px-4 py-3.5 text-left'
      >
        <span className='font-medium text-sm'>{title}</span>
        <ChevronRight
          className={cn(
            'h-5 w-5 text-muted-foreground transition-transform',
            isExpanded && 'rotate-90',
          )}
        />
      </button>
      {isExpanded && (
        <div className='border-t border-b dark:bg-muted/15 bg-muted/30'>
          {children}
        </div>
      )}
    </div>
  );
};

interface CitySectionProps {
  city: ProcessedCity;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectRoute: () => void;
}

const CitySection = ({
  city,
  isExpanded,
  onToggle,
  onSelectRoute,
}: CitySectionProps) => {
  return (
    <div className='border-t first:border-t-0'>
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center justify-between w-full px-4 py-3 text-left pl-6',
        )}
      >
        <span className='text-sm'>Из {city.name}</span>
        <ChevronRight
          className={cn(
            'h-5 w-5 text-muted-foreground transition-transform',
            isExpanded && 'rotate-90',
          )}
        />
      </button>
      {isExpanded && (
        <div className='border-t border-dashed dark:bg-muted/20 bg-muted'>
          {city.connections.map((connection, index) => {
            const isAvailable = connection.departureDate
              ? connection.departureDate <= new Date()
              : true;
            const formattedDate = connection.departureDate
              ? new Date(connection.departureDate).toLocaleDateString('ru-RU')
              : null;

            return (
              <div
                key={connection.id}
                className={cn(index !== 0 && 'border-t border-dashed')}
              >
                {isAvailable ? (
                  <Link
                    to={`/?departureCityId=${city.id}&arrivalCityId=${connection.id}`}
                    className='block px-4 pl-8 py-3 text-sm'
                    onClick={() => {
                      onSelectRoute();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    {connection.name}
                  </Link>
                ) : (
                  <div className='flex justify-between items-center px-4 py-3 text-sm text-muted-foreground pl-8'>
                    <span>{connection.name}</span>
                    {formattedDate && (
                      <span className='text-xs'>от {formattedDate}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MobileNav;
