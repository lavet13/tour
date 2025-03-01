import { VariantProps } from 'class-variance-authority';
import { Button, buttonVariants } from './ui/button';
import { forwardRef, useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useControllableState } from '@/hooks/use-controllable-state';
import { cn } from '@/lib/utils';
import { SonnerSpinner } from './sonner-spinner';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from './ui/command';
import { ScrollArea } from './ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Drawer, DrawerContent, DrawerTrigger } from './ui/drawer';

interface ComboBoxProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  value?: any;
  onValueChange?: (value: any) => void;
  items: any[];
  disabled?: boolean;
  width?: number;
  isLoading?: boolean;
}

export const ComboBox = forwardRef<HTMLButtonElement, ComboBoxProps>(
  (
    {
      value: valueProp,
      onValueChange,
      items,
      disabled,
      variant,
      size,
      width,
      isLoading,
    }: ComboBoxProps,
    ref,
  ) => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
    });

    const [open, setOpen] = useState(false);

    const handleItemSelect = (item: any) => {
      const selectedValue = item[1];
      setValue(selectedValue);
      setOpen(false); // Close the popover or drawer
    };
    const selectedItem = items.find(item => {
      return item[1] === value;
    });
    const label = selectedItem?.[0] ?? 'Выбрать';
    const Icon = selectedItem?.[2] as React.ElementType | undefined;
    const renderTrigger = () => {
      return (
        <Button
          style={{ width: width ? width - 20 : undefined }}
          ref={ref}
          variant={variant || 'outline'}
          role='combobox'
          size={size || 'sm'}
          disabled={disabled}
          className={cn(
            'flex w-full justify-between h-8',
            !value && 'text-muted-foreground',
          )}
        >
          {isLoading ? (
            <span className='relative top-0.5'>
              <SonnerSpinner className='bg-foreground' />
            </span>
          ) : (
            Icon && <Icon />
          )}
          {label}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      );
    };

    const renderContent = () => {
      return (
        <Command>
          <CommandList>
            <CommandEmpty>Не найдено</CommandEmpty>
            <CommandGroup>
              <ScrollArea
                className={cn(
                  items.length >= 7 && 'h-[calc(14rem)] -mr-px pr-3',
                )}
              >
                {items.map(item => {
                  const Icon = item[2] as React.ElementType | undefined;
                  const label = item[0];
                  const selectedValue = item[1];

                  return (
                    <CommandItem
                      key={selectedValue}
                      onSelect={() => handleItemSelect(item)}
                      className='flex items-center gap-3'
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            'h-4 w-4 text-muted-foreground',
                            value === selectedValue
                              ? 'opacity-100'
                              : 'opacity-40',
                          )}
                        />
                      )}
                      {label}
                      <Check
                        className={cn(
                          'ml-auto',
                          selectedValue === value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      );
    };

    return isDesktop ? (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{renderTrigger()}</PopoverTrigger>
        <PopoverContent style={{ width: width ? width - 20 : undefined }} className='p-0'>
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
