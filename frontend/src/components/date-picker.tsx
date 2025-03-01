import { useControllableState } from '@/hooks/use-controllable-state';
import { useMediaQuery } from '@/hooks/use-media-query';
import { forwardRef, useState } from 'react';
import { useController } from 'react-hook-form';
import { FormControl } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { ru as fnsRU } from 'date-fns/locale';

type DatePickerProps = {
  name: string;
  value?: any;
  onValueChange?: (value: any) => void;
  disabled?: boolean;
  label?: string;
};

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  ({ value: valueProp, onValueChange, name, label, disabled }, ref) => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
    });

    const [open, setOpen] = useState(false);

    const {
      fieldState: { error },
    } = useController({ name });

    const renderTrigger = () => {
      return (
        <FormControl>
          <Button
            ref={ref}
            variant='outline'
            className={cn(
              'flex w-full',
              'justify-start text-left font-normal',
              !value && 'text-muted-foreground',
            )}
            disabled={disabled}
          >
            <CalendarIcon className='mr-2 size-4' />
            {value ? (
              <span
                className={cn(
                  'font-semibold',
                  error && 'text-muted-foreground',
                )}
              >
                {format(value, 'PPP', {
                  locale: fnsRU,
                })}
              </span>
            ) : (
              <span className='whitespace-pre leading-3 text-center'>
                {label}
              </span>
            )}
          </Button>
        </FormControl>
      );
    };

    const renderContent = () => {
      return (
        <Calendar
          className='w-fit mx-auto'
          locale={fnsRU}
          mode='single'
          selected={value}
          onSelect={date => {
            setValue(date);
            setOpen(false);
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
