import { MainNavItem } from "@/pages/admin/layout/types/__nav";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { RouterLink } from "@/components/router-link";

export function NavHeader({ items }: { items: MainNavItem[] }) {
  return (
    <SidebarMenu>
      {items.map(item => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <RouterLink to={item.url}>
              {item.icon && <item.icon />}
              {item.title}
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
