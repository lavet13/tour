import { useControllableState } from '@/hooks/use-controllable-state';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form';
import { SonnerSpinner } from '@/components/sonner-spinner';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

interface ComboBoxProps {
  value?: any;
  onValueChange?: (value: any) => void;
  isLoading?: boolean;
  items: any[];
  label?: string;
  emptyLabel?: string;
  inputPlaceholder?: string;
  disabled?: boolean;
}

export const ComboBox = forwardRef<HTMLButtonElement, ComboBoxProps>(
  (
    {
      value: valueProp,
      onValueChange,
      items,
      label,
      emptyLabel,
      inputPlaceholder,
      isLoading,
      disabled,
    },
    ref,
  ) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [popoverWidth, setPopoverWidth] = useState<number>(0);
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
    });

    const [open, setOpen] = useState(false);

    const handleItemSelect = (item: any) => {
      setValue(item.id);
      setOpen(false); // Close the popover or drawer
    };

    // Merge the forwarded ref with our local ref
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(buttonRef.current);
      } else if (ref) {
        ref.current = buttonRef.current;
      }
    }, [ref]);

    // Update popover width when button width changes
    useEffect(() => {
      if (buttonRef.current) {
        const updateWidth = () => {
          const width = buttonRef.current?.offsetWidth ?? 0;
          setPopoverWidth(width);
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
      }
    }, [open]);

    const displayValue = (value: string) => {
      const castedValue = value === 'null' ? null : value;
      return items.find(item => item.id === castedValue)?.name || label;
    };

    const renderTrigger = () => {
      return (
        <FormControl>
          <Button
            ref={buttonRef}
            variant='outline'
            role='combobox'
            disabled={isLoading || disabled}
            className={cn(
              'group',
              'flex w-full justify-between',
              'focus:outline-none focus:ring-1 focus:ring-ring aria-[invalid=true]:ring-destructive aria-[invalid=true]:border-destructive/15 hover:aria-[invalid=true]:bg-destructive/10 hover:aria-[invalid=true]:text-destructive',
              !value && 'text-muted-foreground',
            )}
          >
            {isLoading ? (
              <div className='w-full select-none flex justify-between items-center gap-2'>
                Загрузка...
                <SonnerSpinner className='bg-foreground' />
              </div>
            ) : value ? (
              <span
                className={cn('font-semibold group-aria-[invalid=true]:text-destructive/90')}
              >
                {displayValue(value)}
              </span>
            ) : (
              <span
                className={cn(
                  'whitespace-pre leading-3 text-center group-aria-[invalid=true]:text-destructive/80',
                )}
              >
                {label}
              </span>
            )}
            {!isLoading && (
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50 group-aria-[invalid=true]:text-destructive' />
            )}
          </Button>
        </FormControl>
      );
    };

    const renderContent = () => {
      // TODO: find a solution for scroll lock
      const commandList = (
        <CommandList onWheelCapture={e => e.stopPropagation()}>
          {items.length >= 7 && <CommandEmpty>{emptyLabel}</CommandEmpty>}
          <CommandGroup>
            {items.length !== 0 &&
              items.map(item => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleItemSelect(item)}
                >
                  {item.name}
                  <Check
                    className={cn(
                      'ml-auto',
                      item.id === value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            {items.length === 0 && (
              <p className='py-2 text-center text-sm text-muted-foreground'>
                Нет данных
              </p>
            )}
          </CommandGroup>
        </CommandList>
      );

      return (
        <Command>
          {items.length >= 7 && <CommandInput placeholder={inputPlaceholder} />}
          {isDesktop ? (
            <div className={cn('max-h-fit overflow-y-auto h-[30vh]')}>
              {commandList}
            </div>
          ) : (
            commandList
          )}
        </Command>
      );
    };

    return isDesktop ? (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{renderTrigger()}</PopoverTrigger>
        <PopoverContent style={{ width: `${popoverWidth}px` }} className='p-0'>
          {renderContent()}
        </PopoverContent>
      </Popover>
    ) : (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{renderTrigger()}</DrawerTrigger>
        <DrawerContent>{renderContent()}</DrawerContent>
      </Drawer>
    );
  },
);
