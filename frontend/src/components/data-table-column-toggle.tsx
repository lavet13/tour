import { useMediaQuery } from '@/hooks/use-media-query';
import { Table as ReactTable } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, ListCollapse } from 'lucide-react';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useEffect, useRef, useState } from 'react';

interface DataTableViewOptionsProps<TData> {
  table: ReactTable<TData>;
  isMobile: boolean;
  columnTranslations?: Record<string, any>;
}

export function DataTableViewOptions<TData>({
  table,
  isMobile,
  columnTranslations,
}: DataTableViewOptionsProps<TData>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [popoverWidth, setPopoverWidth] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

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
  }, []);

  const allColumns = table
    .getAllColumns()
    .filter(column => column.getCanHide());
  const visibleColumns = allColumns.filter(column => column.getIsVisible());
  const isAllVisible = visibleColumns.length === allColumns.length;
  const isSomeVisible = visibleColumns.length > 0 && !isAllVisible;

  const toggleAllColumns = (visible: boolean) => {
    allColumns.forEach(column => column.toggleVisibility(visible));
  };


  const renderTrigger = () => {
    return (
      <Button
        ref={buttonRef}
        className='grow sm:grow-0'
        size={isMobile ? 'sm' : 'default'}
        variant='outline'
      >
        <ListCollapse />
        Скрыть столбцы
        <ChevronDown />
      </Button>
    );
  };

  const renderContent = () => {
    return (
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem
              onSelect={() => toggleAllColumns(!isAllVisible)}
              className='flex gap-[4rem]'
            >
              <span className={cn(!isAllVisible && 'opacity-70')}>
                Все столбцы
              </span>
              {isAllVisible || isSomeVisible ? (
                <Check
                  className={cn(
                    'ml-auto',
                    isAllVisible ? 'opacity-100' : 'opacity-70',
                    isSomeVisible && 'opacity-70',
                  )}
                />
              ) : null}
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <ScrollArea className='h-[calc(16rem)]'>
            <CommandGroup>
              {allColumns.map(column => (
                <CommandItem
                  key={column.id}
                  onSelect={() =>
                    column.toggleVisibility(!column.getIsVisible())
                  }
                  className='flex gap-3'
                >
                  <span className={cn(!column.getIsVisible() && 'opacity-50')}>
                    {columnTranslations?.[column.id] ?? column.id}
                  </span>
                  {column.getIsVisible() ? (
                    <Check className='ml-auto opacity-100' />
                  ) : (
                    <Check className='ml-auto opacity-0' />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </ScrollArea>
        </CommandList>
      </Command>
    );
  };

  return isDesktop ? (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{renderTrigger()}</PopoverTrigger>
      <PopoverContent
        style={{ width: `${popoverWidth}px` }}
        className='p-0'
      >
        {renderContent()}
      </PopoverContent>
    </Popover>
  ) : (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{renderTrigger()}</DrawerTrigger>
      <DrawerContent>{renderContent()}</DrawerContent>
    </Drawer>
  );
}
