import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import { breakpointsAtom } from '@/lib/atoms/tailwind';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => {
  return (
    <DrawerPrimitive.Root
      shouldScaleBackground={shouldScaleBackground}
      {...props}
    />
  );
};
Drawer.displayName = 'Drawer';

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/80', className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const [{ md }] = useAtom(breakpointsAtom);
  const isTablet = useMediaQuery(`(min-width: ${md}px)`);
  const isTabletRef = React.useRef(isTablet);

  // Фиксируем `isTablet`, если он был `true`
  isTabletRef.current = isTablet || isTabletRef.current;

  const contentClassName = React.useMemo(() => {
    return cn(
      isTabletRef.current
        ? 'fixed inset-x-0 bottom-2 top-2 z-50 mx-auto flex h-auto w-full max-w-lg flex-col rounded-[10px] bg-transparent outline-none'
        : 'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-[80%] lg:h-[320px] flex-col rounded-t-[10px] border bg-background outline-none',
      className,
    );
  }, [isTabletRef.current, className]);

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={contentClassName}
        {...props}
      >
        {isTabletRef.current ? (
          <div className='bg-background border h-full w-full flex flex-col rounded-[16px] overflow-y-auto'>
            <div className='mx-auto mt-4 h-1 w-[100px] rounded-full bg-muted' />
            <DrawerClose asChild>
              <Button
                className='absolute top-3 right-3 w-6 h-6'
                variant='ghost'
                size='icon'
              >
                <X />
                <span className='sr-only'>Закрыть модальное окно</span>
              </Button>
            </DrawerClose>
            <div className='flex-1 overflow-y-auto'>{children}</div>
          </div>
        ) : (
          <div className='flex flex-col flex-1 overflow-y-auto'>
            <div className='mx-auto mt-4 h-1 w-[100px] rounded-full bg-muted' />
            <div className='flex-1 overflow-y-auto'>{children}</div>
          </div>
        )}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
});
DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'grid gap-1.5 p-4 px-5 md:pt-7 md:px-5 text-center sm:text-left sm:max-w-screen-sm mx-auto',
      className,
    )}
    {...props}
  />
);
DrawerHeader.displayName = 'DrawerHeader';

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('mt-auto flex flex-col gap-2 p-4', className)}
    {...props}
  />
);
DrawerFooter.displayName = 'DrawerFooter';

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
