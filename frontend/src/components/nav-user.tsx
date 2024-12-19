import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Settings,
  Sparkles,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useGetMe, useLogout } from '@/features/auth';
import { Skeleton } from './ui/skeleton';
import { Link, useNavigate } from 'react-router-dom';

export function NavUser() {
  const { isMobile } = useSidebar();
  const { data, isPending } = useGetMe();
  const { me: user } = data || {};

  const { mutateAsync: logout } = useLogout();
  const navigate = useNavigate();

  const renderNameAbbreviation = (name: string) => {
    const [firstName, lastName] = name.split(' ');
    return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
  };

  const renderUserData = () => {
    return (
      <>
        {isPending && (
          <>
            <Skeleton className='size-8 rounded-lg' />
            <div className='grid flex-1 text-left space-y-1 text-sm leading-tight'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
            </div>
          </>
        )}
        {user && !isPending && (
          <>
            <Avatar className='h-8 w-8 rounded-lg'>
              {/* <AvatarImage src={user!.avatar} alt={user.name} /> */}
              <AvatarFallback className='rounded-lg'>
                {renderNameAbbreviation(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>{user.name}</span>
              <span className='truncate text-xs'>{user.email}</span>
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              {renderUserData()}
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                {renderUserData()}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to={'/admin/settings'}>
                  <Settings />
                  Настройки
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              <LogOut />
              Выйти из аккаунта
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
