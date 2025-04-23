import { FC, ReactNode, useCallback } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Icons } from '@/components/icons';
import {
  NavLink as RouterLink,
  NavLinkProps as RouterLinkProps,
} from 'react-router-dom';
import { cn } from '@/lib/utils';

type NavLinkProps = Omit<RouterLinkProps, 'className'> & {
  children: ReactNode;
  className?: string;
};

export const FooterLink: FC<NavLinkProps> = ({
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
          'inline-flex w-fit transition-colors font-semibold whitespace-nowrap font-medium hover:underline underline-offset-4',
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

const Footer: FC = () => {
  return (
    <footer className='py-6 md:px-8 md:py-8'>
      <div className='container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-8 min-h-24 max-w-7xl'>
        <div className='flex flex-col'>
          <h4 className='p-2 pl-4 scroll-m-20 text-xl font-semibold tracking-tight'>
            Связаться
          </h4>
          <div className='flex flex-col items-center pl-1'>
            <Link
              className={cn(
                buttonVariants({ variant: 'link', size: 'sm' }),
                '[&_svg]:size-5 self-start',
              )}
              target='_blank'
              rel='noreferrer'
              to='https://vk.com/go_to_krym'
            >
              <Icons.vkontakte className='fill-foreground transition-colors' />
              <span>Мы Вконтакте</span>
            </Link>
            <Link
              className={cn(
                buttonVariants({ variant: 'link', size: 'sm' }),
                '[&_svg]:size-5 self-start',
              )}
              target='_blank'
              rel='noreferrer'
              to='https://t.me/Donbass_Tur'
            >
              <Icons.telegram className='fill-foreground transition-colors' />
              <span>Мы в Телеграме</span>
            </Link>
          </div>
        </div>
        <div className='flex flex-col'>
          <h4 className='p-2 scroll-m-20 text-xl font-semibold tracking-tight'>
            Контакты
          </h4>
          <div className='flex flex-col items-center pl-1'>
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
      </div>
    </footer>
  );
};

export default Footer;
