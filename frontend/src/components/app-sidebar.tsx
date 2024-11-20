import { forwardRef, ReactNode } from "react"
import {
    Home,
  Settings2,
  Store,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, To, useLocation, useMatch, useResolvedPath } from "react-router-dom"
import { cn } from "@/lib/utils"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Маркетплейсы",
      icon: Store,
      url: '#',
      isActive: true,
      items: [
        {
          title: "Wildberries",
          url: "wb-orders",
        },
      ],
    },
  ],
}

interface RouterLinkProps {
  children: ReactNode;
  to: To;
  className?: string;
}

const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  ({ children, to, className }, ref) => {
    const { pathname: toPathname } = useResolvedPath(to);
    const { pathname: locationPathname } = useLocation();

    const selected = locationPathname.startsWith(toPathname);

    return (
      <Link
        to={to}
        ref={ref}
        className={cn(className)}
        role='tab'
        {...(selected ? { 'aria-current': 'page' } : {})}
        data-active={selected}
      >
        {children}
      </Link>
    );
  },
);

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Главная" asChild>
              <RouterLink to="home">
                <Home />
                <span>Главная</span>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
