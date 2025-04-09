import { ModeToggle } from '@/components/mode-toggle';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { FC } from 'react';
import { cn } from '@/lib/utils';
import MobileNav from '@/components/mobile-nav';
import MainNav from '@/components/main-nav';
import { Icons } from '@/components/icons';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { ChevronRightIcon } from 'lucide-react';

const Header: FC = () => {
  return (
    <header className='sticky top-0 z-50 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container h-14 flex items-center'>
        <MainNav />
        <MobileNav />
        <div className='flex flex-1 items-center justify-between space-x-2 sm:justify-end'>
          <div className='w-full flex-1 sm:w-auto sm:flex-none'>
            <RainbowButton
              rightElement={
                <ChevronRightIcon className='ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1' />
              }
              className='text-sm w-full h-8 sm:h-9 px-4 py-2'
              asChild
            >
              <Link
                onClick={() => window.scrollTo({ top: 0 })}
                to='/booking-bus'
              >
                Заказать билет
              </Link>
            </RainbowButton>
          </div>

          <nav className='flex items-center'>
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
              to='https://t.me/Donbass_Tur'
            >
              <Icons.telegram />
              <span className='sr-only'>Telegram</span>
            </Link>
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
