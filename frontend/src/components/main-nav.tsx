import { cn } from '@/lib/utils';
import { FC, forwardRef, ReactNode, useCallback } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import {
  NavLink as RouterLink,
  NavLinkProps as RouterLinkProps,
} from 'react-router-dom';
import { Icons } from '@/components/icons';
import AnimatedGradientText from './ui/animated-gradient-text';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Button } from './ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import {
  NavigationMenuSub as RadixNavigationMenuSub,
  NavigationMenuViewport as RadixNavigationMenuViewport,
  NavigationMenuTrigger as RadixNavigationMenuTrigger,
} from '@radix-ui/react-navigation-menu';
import { Slottable } from '@radix-ui/react-slot';

type NavLinkProps = Omit<RouterLinkProps, 'className'> & {
  children: ReactNode;
  className?: string;
};

const cities = [
  'Горловка',
  'Енакиево',
  'Юнокомунарск',
  'Ждановка',
  'Кировское',
  'Кр. Луч',
  'Снежное',
  'Шахтерск',
  'Зугрэс',
  'Торез',
  'Харцызск',
  'Макеевка',
  'Донецк',
];

const destinations = [
  { name: 'Мариуполь', available: true },
  { name: 'Урзуф', availableFrom: '2025-05-01' },
  { name: 'Юрьевка', availableFrom: '2025-05-01' },
  { name: 'Ялта (азов)', availableFrom: '2025-05-01' },
  { name: 'Белосарайская коса', availableFrom: '2025-05-01' },
  { name: 'Мелекино', availableFrom: '2025-05-01' },
  { name: 'Мангуш', availableFrom: '2025-05-01' },
];

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

const MainNav: FC = () => {
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

      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Рейсы ЛДНР</NavigationMenuTrigger>
            <NavigationMenuContent>
              <RadixNavigationMenuSub className='flex'>
                <ScrollArea className='h-96 border-r'>
                  <NavigationMenuList className='space-x-0 items-start flex-col w-fit mr-1 p-2 overflow-hidden'>
                    {cities.map(city => (
                      <NavigationMenuItem
                        className='flex w-full'
                        key={city}
                        value={city.toLowerCase()}
                      >
                        <RadixNavigationMenuTrigger asChild>
                          <Button
                            className='flex-1 group data-[state=open]:bg-accent data-[state=open]:text-accent-foreground space-y-1 space-x-0'
                            variant='ghost'
                          >
                            Из {city}
                            <ChevronDown className='h-4 w-4 transition-transform duration-200 group-data-[state=open]:-rotate-90' />
                          </Button>
                        </RadixNavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ScrollArea className='h-96'>
                            <div className='flex flex-col p-4 pb-2'>
                              <h4 className='font-medium mb-2'>
                                Маршруты из {city}:
                              </h4>
                              <Separator className='mb-4' />
                              <div className='grid gap-2'>
                                {destinations.map(dest => {
                                  const isAvailable =
                                    dest.available ||
                                    (dest.availableFrom &&
                                      new Date(dest.availableFrom) <= new Date());

                                  return (
                                    <Button
                                      key={dest.name}
                                      variant='ghost'
                                      className={cn(
                                        'w-full justify-between',
                                        !isAvailable && 'opacity-50',
                                      )}
                                    >
                                      {dest.name}
                                      {dest.availableFrom && (
                                        <span className='text-xs text-muted-foreground'>
                                          с 01.05.2025
                                        </span>
                                      )}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          </ScrollArea>
                        </NavigationMenuContent>
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
                />
              </RadixNavigationMenuSub>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link className={navigationMenuTriggerStyle()} to='/'>
                Documentation
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

interface ListItemProps extends Omit<LinkProps, 'title'> {
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

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

export default MainNav;
