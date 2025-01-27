import { useControllableState } from '@/hooks/use-controllable-state';
import { useMediaQuery } from '@/hooks/use-media-query';
import { forwardRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

type DatePickerProps = {
  value?: any;
  onValueChange?: (value: any) => void;
  disabled?: boolean;
};

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  ({ value: valueProp, onValueChange, disabled }, ref) => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
    });

    const [from, to] = value || [];
    console.log({ from, to });

    const [open, setOpen] = useState(false);

    const renderTrigger = () => {
      return (
        <Button
          ref={ref}
          variant='outline'
          size='sm'
          className={cn(
            'flex w-full',
            'focus:outline-none focus:ring-1 focus:ring-ring',
            'justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
          disabled={disabled}
        >
          <CalendarIcon className='size-4' />
          {value?.length ? (
            <span>
              {from ? (
                to ? (
                  <>
                    {format(from, 'dd/MM')} - {format(to, 'dd/MM')}
                  </>
                ) : (
                  format(from, 'dd/MM')
                )
              ) : (
                <span className='whitespace-pre leading-3 text-center'>
                  Дата
                </span>
              )}
            </span>
          ) : (
            <span className='whitespace-pre leading-3 text-center'>Дата</span>
          )}
        </Button>
      );
    };

    const renderContent = () => {
      return (
        <Calendar
          className='w-fit mx-auto'
          locale={ru}
          mode='range'
          selected={{
            from,
            to,
          }}
          onSelect={date => {
            setValue([date?.from, date?.to]);
          }}
          initialFocus
        />
      );
    };

    return isDesktop ? (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{renderTrigger()}</PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
          {renderContent()}
        </PopoverContent>
      </Popover>
    ) : (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{renderTrigger()}</DrawerTrigger>
        <DrawerContent className='min-h-[380px]'>
          {renderContent()}
        </DrawerContent>
      </Drawer>
    );
  },
);
