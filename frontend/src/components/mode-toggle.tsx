import { Button } from '@/components/ui/button';
import { CheckIcon, LaptopIcon, MoonIcon, SunIcon } from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/lib/atoms/theme';
import { cn } from '@/lib/utils';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const activeStyles = 'text-primary focus:text-primary focus:bg-primary/10 opacity-100';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className='h-8 w-8' variant='ghost' size='icon'>
          <SunIcon className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
          <MoonIcon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem className={cn("transition-none", theme === 'light' ? activeStyles : 'opacity-40')} onClick={() => setTheme('light')}>
          <SunIcon className='mr-2 size-4' /> Светлая
        </DropdownMenuItem>
        <DropdownMenuItem className={cn("transition-none", theme === 'dark' ? activeStyles : 'opacity-40')} onClick={() => setTheme('dark')}>
          <MoonIcon className='mr-2 size-4' /> Темная
        </DropdownMenuItem>
        <DropdownMenuItem className={cn("transition-none", theme === 'system' ? activeStyles : 'opacity-40')} onClick={() => setTheme('system')}>
          <LaptopIcon className="mr-2 size-4" /> Системная
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
