import { ChevronRight, type LucideIcon } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Link, To, useLocation, useResolvedPath } from 'react-router-dom';
import { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';

interface RouterLinkProps {
  children: ReactNode;
  to: To;
  className?: string;
}

// that helped a lot: https://blog.stackademic.com/how-to-implement-tabs-that-sync-with-react-router-e255e0e90cfd
const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  ({ children, to, className }, ref) => {
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
        onClick={() => { window.scrollTo({ top: 0 }); isMobile && toggleSidebar(); } }
        {...(selected ? { 'aria-current': 'page' } : {})}
        data-active={selected}
      >
        {children}
      </Link>
    );
  },
);

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      icon?: LucideIcon;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map(item => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className='group/collapsible'
          >
            <SidebarMenuItem key={item.title}>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger asChild>
                  <Button className='w-full' variant='ghost'>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className='ml-auto transition-transform -rotate-90 duration-200 group-data-[state=open]/collapsible:rotate-90' />
                  </Button>
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map(subItem => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuButton asChild>
                        <RouterLink to={subItem.url}>
                          {subItem.icon && <subItem.icon />}
                          <span>{subItem.title}</span>
                        </RouterLink>
                      </SidebarMenuButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
