import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button, buttonVariants } from '@/components/ui/button';
import { Link, NavLink, NavLinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { FC, ReactNode, useCallback, useState } from 'react';
import { Icons } from '@/components/icons';

type SheetLinkProps = Omit<NavLinkProps, 'className'> & {
  children: ReactNode;
  className?: string;
  onOpenChange: (open: boolean) => void;
};

const SheetLink: FC<SheetLinkProps> = ({
  to,
  children,
  className,
  onOpenChange,
  ...props
}) => {
  const handleClick = useCallback(() => {
    onOpenChange(false);
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'w-full text-left transition-colors font-semibold pl-6 border-l -ml-px text-muted-foreground/60',
          isActive
            ? 'text-foreground border-foreground'
            : 'hover:text-foreground/80 hover:border-foreground/20',
          className,
        )
      }
      onClick={handleClick}
      {...props}
    >
      {children}
    </NavLink>
  );
};

const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className='w-8 h-8 shrink-0 md:hidden hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0'
          variant='ghost'
          size='icon'
        >
          <Icons.sandwitch className='h-5 w-5' />
          <span className='sr-only'>Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent className='pr-0' side='left'>
        <SheetClose asChild>
          <Link
            onClick={() => window.scrollTo({ top: 0 })}
            to='/'
            className={cn('flex items-center space-x-2')}
          >
            <Icons.logo className='h-4 w-4' />
            <span className='font-bold text-sm'>Джаббаров</span>
          </Link>
        </SheetClose>
        <ScrollArea className='my-4 h-[calc(100vh-8rem)] pb-10'>
          <div className='flex flex-col h-full'>
            <nav className='flex flex-col space-y-3 border-l'>
              <SheetLink onOpenChange={setOpen} to='/wb-order'>
                Wildberries
              </SheetLink>
            </nav>
            <div className='flex flex-col items-start grow justify-end space-y-1 pt-6 pl-0'>
              <Button variant="link" className='w-fit px-2 py-0 space-x-1 h-9' asChild>
                <Link
                  to='https://vk.com/id56419815'
                  target='_blank'
                  rel='noreferrer'
                >
                  <Icons.vkontakte className='basis-5 fill-foreground transition-colors' />
                  <span>Вконтакте</span>
                </Link>
              </Button>

              <Button variant="link" className='w-fit px-2 py-0 space-x-1 h-9' asChild>
                <Link
                  to='https://t.me/JaBBaRoV_JR'
                  target='_blank'
                  rel='noreferrer'
                >
                  <Icons.telegram className='basis-5 fill-foreground transition-colors' />
                  <span>Telegram</span>
                </Link>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
