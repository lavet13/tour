import * as React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';

function AdminPage() {
  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Административная панель</PageHeaderHeading>
      </PageHeader>
      <div className='relative container px-1 sm:px-4 mx-auto overflow-hidden space-y-2 flex-1 pt-2 md:pt-4 lg:pt-6'>
        <div className='flex-1 grid grid-cols-[repeat(auto-fill,_minmax(18rem,_1fr))]'>
          <ListItem to={'/admin/bookings'} title={'Бронирование'}>
            Заявки на бронирование от клиентов
          </ListItem>
        </div>
      </div>
    </>
  );
}

interface ListItemProps extends Omit<LinkProps, 'title'> {
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

const ListItem = React.forwardRef<HTMLAnchorElement, ListItemProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        className={cn(
          'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
          className,
        )}
        {...props}
      >
        {title && <div className='text-sm font-bold leading-none'>{title}</div>}
        {children && (
          <p className='line-clamp-2 text-sm leading-snug text-muted-foreground'>
            {children}
          </p>
        )}
      </Link>
    );
  },
);

export default AdminPage;
