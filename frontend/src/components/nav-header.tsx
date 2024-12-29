import { MainNavItem } from "@/pages/admin/types/__nav";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { RouterLink } from "./router-link";

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
