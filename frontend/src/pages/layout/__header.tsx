import { ModeToggle } from '@/components/mode-toggle';
import { Link } from 'react-router-dom';
import { Button, buttonVariants } from '@/components/ui/button';
import { FC } from 'react';
import { cn } from '@/lib/utils';
import MobileNav from '@/components/mobile-nav';
import MainNav from '@/components/main-nav';
import { Icons } from '@/components/icons';
import TelegramLogin from '@/components/telegram-login';
import { useGetMe, useLogout } from '@/features/auth';

const Header: FC = () => {
  const { data, isPending: meIsPending, refetch: refetchUser } = useGetMe();
  const { me: user } = data || {};
  const { mutateAsync: logout, isPending: logoutIsPending } = useLogout();

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
            {!meIsPending && !user && (
              <TelegramLogin
                botName={'DonbassTourBot'}
                buttonSize='small'
                canSendMessages
              />
            )}
            {!meIsPending && user?.telegram && (
              <Button
                size='sm'
                onClick={async () => {
                  await logout();
                  await refetchUser();
                }}
              >
                Выйти из аккаунта
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
