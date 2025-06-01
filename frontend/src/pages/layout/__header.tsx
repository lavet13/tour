import { ModeToggle } from '@/components/mode-toggle';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { FC, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import MobileNav from '@/components/mobile-nav';
import MainNav from '@/components/main-nav';
import { Icons } from '@/components/icons';
import TelegramLogin from '@/components/telegram-login';
import { useGetMe, useLogout } from '@/features/auth';
import { Loader2, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMediaQuery } from '@/hooks/use-media-query';

// Custom AvatarImage component to handle 404 errors
const CustomAvatarImage = ({ src, alt, ...props }: { src: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false); // Reset error state when src changes
    const img = new Image();
    img.src = src;
    img.onload = () => setHasError(false);
    img.onerror = () => setHasError(true);
  }, [src]);

  if (hasError) {
    return null; // Return null to trigger fallback
  }

  return <AvatarImage src={src} alt={alt} {...props} />;
};

const Header: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const isBelow2xl = useMediaQuery(`(max-width: 1640px)`);
  const { data, isPending: meIsPending, refetch: refetchUser } = useGetMe();
  const { me: user } = data || {};
  const { mutateAsync: logout } = useLogout();

  const getShortNaming = (
    firstName?: string | null,
    lastName?: string | null,
  ) => {
    const firstChar = firstName?.at(0)?.toUpperCase() ?? '';
    const secondChar = lastName?.at(0)?.toUpperCase() ?? '';

    let shortName = `${firstChar}${secondChar}`;

    if (!shortName.length) {
      return undefined;
    }

    return shortName;
  };

  return (
    <header className='sticky top-0 z-50 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container px-2 h-14 flex items-center'>
        <MainNav />
        <MobileNav />
        <div className='flex flex-1 items-center justify-between space-x-2 sm:justify-end'>
          <nav className='ml-auto flex items-center'>
            <Link
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'w-8 h-8',
              )}
              target='_blank'
              rel='noreferrer'
              to='https://vk.com/go_to_krym'
            >
              <Icons.vkontakte />
              <span className='sr-only'>VKontakte</span>
            </Link>
            <Link
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'w-8 h-8',
              )}
              target='_blank'
              rel='noreferrer'
              to='https://t.me/+79493180304'
            >
              <Icons.telegram />
              <span className='sr-only'>Telegram</span>
            </Link>
            <ModeToggle />
            {!meIsPending && !user && import.meta.env.PROD && (
              <TelegramLogin
                className='ml-2'
                botName={'DonbassTourBot'}
                buttonSize='small'
                canSendMessages
              />
            )}
            {!meIsPending && user && (
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger className='hover:cursor-pointer' asChild>
                  <Avatar className='ml-2 size-8'>
                    <CustomAvatarImage src={user.telegram?.photoUrl!} alt='Avatar' />
                    <AvatarFallback className='text-sm'>
                      {user.telegram
                        ? getShortNaming(
                            user?.telegram?.firstName,
                            user?.telegram?.lastName,
                          )
                        : getShortNaming(...user.name.split(' '))}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className='w-40'
                  {...(isBelow2xl ? { align: 'end' } : {})}
                >
                  <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={isLoading}
                    onClick={async event => {
                      event.preventDefault();
                      setIsLoading(true);

                      try {
                        await logout();
                        await refetchUser();
                      } catch (error) {
                        console.error('Logout failed:', error);
                      } finally {
                        setIsLoading(false);
                        setOpen(false);
                      }
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className='animate-spin' />
                        Выходим...
                      </>
                    ) : (
                      <>
                        <LogOut />
                        Выйти
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
