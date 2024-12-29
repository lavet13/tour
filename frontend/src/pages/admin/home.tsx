import * as React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PageHeader, PageHeaderHeading } from '@/components/page-header';
import { pagesConfig } from '@/pages/admin/config/__pages';
import { NavItemWithChildren } from './types/__nav';

function AdminPage() {
  const sidebarNav = pagesConfig.sidebarNav;

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Административная панель</PageHeaderHeading>
      </PageHeader>
      <div className='relative container px-1 sm:px-4 mx-auto overflow-hidden space-y-2 flex-1 pt-2 md:pt-4 lg:pt-6'>
        {sidebarNav.map(nav => (
          <React.Fragment key={nav.title}>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              {nav.title}
            </h3>
            <div className='block flex-1 sm:grid space-y-2 sm:grid-cols-[repeat(auto-fill,_minmax(19rem,_1fr))]'>
              {nav.items?.map(item => (
                <ListItem key={item.title} item={item}>
                  {item.description}
                </ListItem>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

interface ListItemProps extends Omit<LinkProps, 'title' | 'to'> {
  className?: string;
  item: NavItemWithChildren;
}

const ListItem = React.forwardRef<HTMLAnchorElement, ListItemProps>(
  ({ className, children, item, ...props }, ref) => {
    return (
      <div
        className={cn(
          'relative text-foreground/80 block select-none space-y-1 rounded-md px-3 py-2 sm:p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
          className,
        )}
      >
        <div className='grid grid-cols-[auto_1fr] gap-y-0.5 gap-x-2 items-center'>
          {item.icon && <item.icon className='size-5' />}
          {item.title && (
            <div className='relative top-px text-sm self-center font-bold leading-none'>
              {item.title}
            </div>
          )}
          {children && (
            <p className='col-start-2 line-clamp-2 text-sm leading-snug text-muted-foreground'>
              {children}
            </p>
          )}
        </div>
        <Link to={item.url} className={'absolute inset-0'} ref={ref} {...props}>
          <span className='sr-only'>{item.title}</span>
        </Link>
      </div>
    );
  },
);

export default AdminPage;
