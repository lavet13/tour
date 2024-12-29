import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { PagesConfig } from '@/pages/admin/config/__pages';
import { NavHeader } from './nav-header';

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
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
