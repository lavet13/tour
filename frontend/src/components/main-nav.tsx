import { cn } from '@/lib/utils';
import {
  FC,
  forwardRef,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Link, LinkProps, useNavigate } from 'react-router-dom';
import {
  NavLink as RouterLink,
  NavLinkProps as RouterLinkProps,
} from 'react-router-dom';
import { Icons } from '@/components/icons';
import AnimatedGradientText from './ui/animated-gradient-text';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Button, buttonVariants } from './ui/button';
import { ChevronDown, ChevronRight, LogOut, Shield } from 'lucide-react';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import {
  NavigationMenuSub as RadixNavigationMenuSub,
  NavigationMenuViewport as RadixNavigationMenuViewport,
  NavigationMenuTrigger as RadixNavigationMenuTrigger,
} from '@radix-ui/react-navigation-menu';
import { useRoutesByRegion } from '@/features/routes/use-routes-by-region';
import { GetRoutesByRegionQuery } from '@/gql/graphql';
import { useRegionByName } from '@/features/region/use-region-by-name';
import { navigationMenuStateAtom } from '@/lib/atoms/navigation-menu';
import { useAtom } from 'jotai';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useGetMe, useLogout } from '@/features/auth';
import { Input } from '@/components/ui/input';

type NavLinkProps = Omit<RouterLinkProps, 'className'> & {
  children: ReactNode;
  className?: string;
};

export const NavLink: FC<NavLinkProps> = ({
  to,
  children,
  className,
  ...props
}) => {
  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <RouterLink
      to={to}
      className={({ isActive }) =>
        cn(
          'transition-colors font-semibold whitespace-nowrap',
          isActive
            ? 'text-foreground hover:text-foreground/90'
            : 'hover:text-foreground/80 text-foreground/60',
          className,
        )
      }
      onClick={handleClick}
      {...props}
    >
      {children}
    </RouterLink>
  );
};

function onNavChange() {
  setTimeout(() => {
    const triggers = document.querySelectorAll(
      '.submenu-trigger[data-state="open"]',
    );
    if (triggers.length === 0) return;

    const firstTrigger = triggers[0] as HTMLElement;

    document.documentElement.style.setProperty(
      '--menu-left-position',
      `${firstTrigger.offsetLeft}px`,
    );
  });
}

const MainNav: FC = () => {
  const [open, setOpen] = useAtom(navigationMenuStateAtom);
  const { data: ldnrRegion } = useRegionByName('ЛДНР');
  const { data: coastalRegion } = useRegionByName('Азовское побережье');

  const { data, isPending } = useGetMe();
  const { me: user } = data || {};

  const {
    data: ldnrData,
    isPending: ldnrIsPending,
    fetchStatus: ldnrFetchStatus,
  } = useRoutesByRegion(ldnrRegion?.regionByName?.id as string, {
    enabled: !!ldnrRegion,
  });

  const {
    data: coastalData,
    isPending: coastalIsPending,
    fetchStatus: coastalFetchStatus,
  } = useRoutesByRegion(coastalRegion?.regionByName?.id as string, {
    enabled: !!coastalRegion,
  });

  const coastalIsLoading =
    coastalFetchStatus === 'fetching' && coastalIsPending;
  const ldnrIsLoading = ldnrFetchStatus === 'fetching' && ldnrIsPending;

  const ldnrRoutes = ldnrData?.routesByRegion ?? [];
  const coastalRoutes = coastalData?.routesByRegion ?? [];

  const routesIsLoading = ldnrIsLoading || coastalIsLoading;
  if (routesIsLoading) {
    return <NavSkeleton />;
  }

  return (
    <div className='hidden md:flex'>
      <Link
        to='/'
        className={cn('mr-2 flex items-center space-x-2 lg:mr-3 xl:mr-6')}
        onClick={() => window.scrollTo({ top: 0 })}
      >
        <Icons.logo className='h-6 w-6' />
        <span className='hidden font-bold xl:inline-block'>Донбасс-Тур</span>
      </Link>

      <NavigationMenu
        value={open}
        onValueChange={value => {
          setOpen(value);
          onNavChange();
        }}
      >
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={cn(
                'submenu-trigger bg-transparent',
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'gap-1',
              )}
            >
              Рейсы
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <RadixNavigationMenuSub className='flex'>
                <ScrollArea className='h-fit'>
                  <NavigationMenuList className='space-x-0 items-start flex-col w-fit mr-1 pt-2 pl-2 pb-2'>
                    <Button
                      className='px-3 underline decoration-dotted hover:decoration-solid h-fit'
                      variant='link'
                      asChild
                    >
                      <Link to={'/bookings'}>Показать все</Link>
                    </Button>
                    <NavigationMenuItem>
                      <NavigationRoutes title='ЛДНР' routes={ldnrRoutes} />
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationRoutes
                        title='Азовское побережье'
                        routes={coastalRoutes}
                      />
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </ScrollArea>

                <RadixNavigationMenuViewport
                  className='overflow-hidden transform origin-right-center relative top-0 right-0'
                  style={{
                    width: 'var(--radix-navigation-menu-viewport-width)',
                    height: 'var(--radix-navigation-menu-viewport-height)',
                  }}
                />
              </RadixNavigationMenuSub>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {user && !isPending && (
            <NavigationMenuItem>
              <NavigationMenuLink
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                )}
                asChild
              >
                <Link to={'/admin'}>
                  <Shield />
                  Админ панель
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>

        <NavigationMenuViewport />
      </NavigationMenu>
    </div>
  );
};

interface ListItemProps extends Omit<LinkProps, 'title'> {
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

const NavSkeleton = () => {
  // Create an array of 8 items for skeleton loading
  const skeletonItems = Array(8).fill(null);

  return (
    <div className='hidden md:flex'>
      {/* Logo skeleton */}
      <div className='mr-2 flex items-center space-x-2 lg:mr-3 xl:mr-6'>
        <div className='h-6 w-6 animate-pulse rounded-md bg-muted' />
        <div className='hidden xl:block h-4 w-24 animate-pulse rounded-md bg-muted' />
      </div>

      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <div className='h-4 w-20 animate-pulse rounded-md bg-muted' />
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <RadixNavigationMenuSub className='flex'>
                <ScrollArea className='h-96 border-r'>
                  <NavigationMenuList className='space-x-0 items-start flex-col w-fit mr-1 p-2'>
                    {skeletonItems.map((_, index) => (
                      <NavigationMenuItem key={index} className='flex w-full'>
                        <div className='flex-1 p-2'>
                          <div className='h-8 w-32 animate-pulse rounded-md bg-muted' />
                        </div>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </ScrollArea>

                <RadixNavigationMenuViewport
                  className='overflow-hidden transform origin-right-center relative top-0 right-0'
                  style={{
                    width: 'var(--radix-navigation-menu-viewport-width)',
                    height: 'var(--radix-navigation-menu-viewport-height)',
                  }}
                >
                  <ScrollArea className='h-96'>
                    <div className='flex flex-col p-4 pb-2'>
                      <div className='h-5 w-40 animate-pulse rounded-md bg-muted mb-2' />
                      <Separator className='mb-4' />
                      <div className='grid gap-2'>
                        {Array(7)
                          .fill(null)
                          .map((_, index) => (
                            <div
                              key={index}
                              className='h-9 w-full animate-pulse rounded-md bg-muted'
                            />
                          ))}
                      </div>
                    </div>
                  </ScrollArea>
                </RadixNavigationMenuViewport>
              </RadixNavigationMenuSub>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <div className='h-9 w-24 animate-pulse rounded-md bg-muted' />
          </NavigationMenuItem>
        </NavigationMenuList>

        <NavigationMenuViewport />
      </NavigationMenu>
    </div>
  );
};

const ListItem = forwardRef<HTMLAnchorElement, ListItemProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            ref={ref}
            className={cn(
              'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              className,
            )}
            {...props}
          >
            {title && (
              <div className='text-sm font-medium leading-none'>{title}</div>
            )}
            {children && (
              <p className='line-clamp-2 text-sm leading-snug text-muted-foreground'>
                {children}
              </p>
            )}
          </Link>
        </NavigationMenuLink>
      </li>
    );
  },
);

type Route = GetRoutesByRegionQuery['routesByRegion'][number];
interface NavigationRoutesProps {
  routes: Route[];
  title: string;
}

const NavigationRoutes = ({ routes, title }: NavigationRoutesProps) => {
  const [, setOpen] = useAtom(navigationMenuStateAtom);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRoutes = useMemo(() => {
    return routes.filter(route =>
      route.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [routes, searchTerm]);

  return (
    <>
      <RadixNavigationMenuTrigger
        className='submenu-trigger bg-background/20'
        asChild
      >
        <Button
          className={cn(
            'flex-1 group data-[state=open]:bg-accent data-[state=open]:text-accent-foreground space-y-1 space-x-0 cursor-auto gap-1',
          )}
          variant='ghost'
          size={'sm'}
        >
          Рейсы {title}
          <ChevronDown className='transition-transform duration-200 group-data-[state=open]:-rotate-90' />
        </Button>
      </RadixNavigationMenuTrigger>
      <NavigationMenuContent>
        <RadixNavigationMenuSub className='flex'>
          <NavigationMenuList
            className={cn(
              routes.length === 0 ? 'w-full flex-1' : 'w-fit',
              'space-x-0 items-stretch flex-col p-2 pl-1 pr-0 overflow-hidden',
            )}
          >
            <>
              <Input
                type='text'
                placeholder='Найти город...'
                className='self-center max-w-[150px] mr-2 ml-1 mb-2'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <ScrollArea
                className={cn(routes.length === 0 && 'w-52', 'h-[22rem]')}
              >
                {filteredRoutes.map(route => (
                  <NavigationMenuItem
                    className={cn('flex w-full')}
                    key={route.id}
                    value={route.name}
                  >
                    <RadixNavigationMenuTrigger asChild>
                      <Button
                        className={cn(
                          'flex-1 group data-[state=open]:bg-accent data-[state=open]:text-accent-foreground space-y-1 space-x-0 cursor-auto gap-1 mr-2 ml-2',
                        )}
                        variant='ghost'
                        size='sm'
                      >
                        Из {route.name}
                        <ChevronDown className='h-4 w-4 transition-transform duration-200 group-data-[state=open]:-rotate-90' />
                      </Button>
                    </RadixNavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className='flex flex-col p-4 pl-1 pr-2 pb-2'>
                        <h4 className='font-medium mb-2'>
                          Маршруты из {route.name}:
                        </h4>
                        <Separator className='mb-4' />
                        <ScrollArea
                          className={cn(
                            'h-[16rem] min-w-[200px] min-[860px]:min-w-[300px]',
                          )}
                        >
                          <div className='grid gap-2'>
                            {route.departureTrips.map(trip => {
                              const isAvailable = trip.departureDate
                                ? trip.departureDate <= new Date()
                                : true;
                              const formattedDate = trip.departureDate
                                ? new Date(
                                    trip.departureDate,
                                  ).toLocaleDateString('ru-RU')
                                : null;

                              let content: ReactNode = null;

                              const handleClick = () => {
                                window.scrollTo({ top: 0 });
                              };

                              content = isAvailable ? (
                                <Button
                                  asChild={isAvailable}
                                  key={trip.id}
                                  size='sm'
                                  variant='ghost'
                                  className={cn('w-full justify-between')}
                                  onClick={() => setOpen('')}
                                >
                                  <Link
                                    onClick={handleClick}
                                    to={`booking-bus?departureCityId=${route.id}&arrivalCityId=${trip.arrivalCity?.id}`}
                                  >
                                    {trip.arrivalCity?.name}
                                  </Link>
                                </Button>
                              ) : (
                                <Button
                                  key={trip.id}
                                  asChild={isAvailable}
                                  size='sm'
                                  variant='ghost'
                                  className={cn(
                                    'w-full justify-between',
                                    !isAvailable && 'opacity-50',
                                  )}
                                >
                                  {trip.arrivalCity?.name}
                                  {!isAvailable && formattedDate && (
                                    <span className='text-xs text-muted-foreground'>
                                      {`от ${formattedDate}`}
                                    </span>
                                  )}
                                </Button>
                              );

                              return content;
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
                {routes.length !== 0 && filteredRoutes.length === 0 && (
                  <NavigationMenuItem className='text-center self-center'>
                    <span className='text-sm text-muted-foreground'>
                      Не найдено.
                    </span>
                  </NavigationMenuItem>
                )}
                {routes.length === 0 && (
                  <NavigationMenuItem className='text-center self-center'>
                    <span className='text-sm text-muted-foreground'>
                      Нет данных
                    </span>
                  </NavigationMenuItem>
                )}
              </ScrollArea>
            </>
          </NavigationMenuList>

          <RadixNavigationMenuViewport
            className='overflow-hidden transform origin-top-center relative top-0 left-0 w-full overflow-hidden rounded-md bg-popover text-popover-foreground data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-105'
            style={{
              width: 'var(--radix-navigation-menu-viewport-width)',
              height: 'var(--radix-navigation-menu-viewport-height)',
            }}
          />
        </RadixNavigationMenuSub>
      </NavigationMenuContent>
    </>
  );
};

export default MainNav;
