import { forwardRef, ReactNode } from "react";
import { useSidebar } from "./ui/sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Link, To, useLocation, useResolvedPath } from "react-router-dom";
import { cn } from "@/lib/utils";

interface RouterLinkProps {
  children: ReactNode;
  to: To;
  className?: string;
}

// that helped a lot: https://blog.stackademic.com/how-to-implement-tabs-that-sync-with-react-router-e255e0e90cfd
export const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
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
        onClick={() => {
          window.scrollTo({ top: 0 });
          isMobile && toggleSidebar();
        }}
        {...(selected ? { 'aria-current': 'page' } : {})}
        data-active={selected}
      >
        {children}
      </Link>
    );
  },
);
