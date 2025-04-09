import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Link, NavLink, NavLinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  FC,
  ReactNode,
  useCallback,
  useMemo,
  useState,
  useEffect,
  forwardRef,
} from 'react';
import { Icons } from '@/components/icons';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { ChevronRight, ExternalLink, Search } from 'lucide-react';
import { useGetMe } from '@/features/auth';
import {
  processCityRoutes,
  ProcessedCity,
} from '@/helpers/process-city-routes';
import { useRegionByName } from '@/features/region';
import { useRoutes } from '@/features/routes';
import { Input } from '@/components/ui/input';

type SheetLinkProps = Omit<NavLinkProps, 'className'> & {
  children: ReactNode;
  className?: string;
  onOpenChange: (open: boolean) => void;
};

const SheetLink: FC<SheetLinkProps> = forwardRef<
  HTMLAnchorElement,
  SheetLinkProps
>(({ to, children, className, onOpenChange, ...props }, ref) => {
  const handleClick = useCallback(() => {
    onOpenChange(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [onOpenChange]);

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'block py-3 text-sm transition-colors',
          isActive
            ? 'border-l-4 bg-muted/30 border-foreground pl-4 -ml-px text-foreground font-medium'
            : 'pl-4 border-l-4 -ml-px text-foreground/80 hover:text-foreground',
          className,
        )
      }
      ref={ref}
      onClick={handleClick}
      {...props}
    >
      {children}
    </NavLink>
  );
});

const MobileNav = () => {
  const [open, setOpen] = useState(false);

  const [searchRoute, setSearchRoute] = useState('');
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [expandedRegions, setExpandedRegions] = useState<string[]>([]);

  const { data, isPending } = useGetMe();
  const { me: user } = data || {};

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

  return (
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

        <ScrollArea className='my-4 h-[calc(100vh-8rem)] pb-7'>
          <div className='flex flex-col h-full'>
            <nav className='flex flex-col mb-2'>
              <SheetLink onOpenChange={setOpen} to='/bookings'>
                Показать все рейсы
              </SheetLink>
              <SheetLink onOpenChange={setOpen} to='/booking-bus'>
                Заказать билет
              </SheetLink>
            </nav>

            <div className='px-2 py-3 border-t'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  type='text'
                  placeholder='Найти город...'
                  className='pl-9 h-10 bg-muted/30 border-0'
                  value={searchRoute}
                  onChange={e => setSearchRoute(e.target.value)}
                />
              </div>
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
              {user && !isPending && (
                <Button
                  variant='ghost'
                  className='w-fit px-2 py-0 space-x-1 h-9'
                  asChild
                >
                  <Link target='_blank' to='/admin' rel='noreferrer'>
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
        </ScrollArea>
      </DrawerContent>
    </Drawer>
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
                    to={`booking-bus?departureCityId=${city.id}&arrivalCityId=${connection.id}`}
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
