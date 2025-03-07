import { useViewportDimensions } from '@/hooks/use-viewport-dimentions';
import { cn } from '@/lib/utils';
import { FC, ReactNode } from 'react';

type PageContentProps = {
  children?: ReactNode;
};

export const PageContent: FC<PageContentProps> = ({ children }) => {
  const { contentWidth, sidebarExpanded } = useViewportDimensions();

  return (
    <div className='container px-1 sm:px-2 pt-2 mx-auto overflow-hidden flex-1 flex flex-col'>
      <div
        className={cn('relative space-y-2 flex-1', !sidebarExpanded && 'mx-0')}
        style={{
          maxWidth: `calc(${contentWidth}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
