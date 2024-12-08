import { forwardRef } from 'react';
import { Bus, Home, Settings2, Tickets } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Link, useLocation, useResolvedPath } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Перевозки',
      icon: Bus,
      url: '#',
      isActive: true,
      items: [
        {
          icon: Tickets,
          title: 'Бронирования',
          url: 'bookings',
        },
      ],
    },
  ],
};

const RouterLink = forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof Link>
>(({ children, to, className }, ref) => {
  const { pathname: toPathname } = useResolvedPath(to);
  const { pathname: locationPathname } = useLocation();

  const selected = locationPathname.startsWith(toPathname);
  const { toggleSidebar } = useSidebar();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Link
      to={to}
      ref={ref}
      className={cn(className)}
      role='tab'
      onClick={() => { window.scrollTo({ top: 0 }); isMobile && toggleSidebar(); }}
      {...(selected ? { 'aria-current': 'page' } : {})}
      data-active={selected}
    >
      {children}
    </Link>
  );
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant='floating' collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <RouterLink to='home'>
                <Home />
                Главная
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
