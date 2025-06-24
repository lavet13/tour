import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { PagesConfig } from '@/pages/admin/layout/config/__pages';
import { NavHeader } from './nav-header';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { ModeToggle } from './mode-toggle';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  config: PagesConfig;
}

export function AppSidebar({ config, ...props }: AppSidebarProps) {
  return (
    <Sidebar variant='floating' collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <NavHeader items={config.mainNav} />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <NavMain items={config.sidebarNav} />
      </SidebarContent>
      <SidebarFooter>
        <div className='flex justify-end items-center'>
          <ModeToggle />
        </div>
        <Button
          size='sm'
          variant='outline'
          className='text-sm w-full min-h-7 h-7'
          asChild
        >
          <Link onClick={() => window.scrollTo({ top: 0 })} to='/'>
            <Home />
            Основной сайт
          </Link>
        </Button>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
