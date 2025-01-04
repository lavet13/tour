import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { OctagonAlert } from 'lucide-react';
import { FC, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { useCookies } from 'react-cookie';
import { ModeToggle } from '@/components/mode-toggle';
import { pagesConfig } from '@/pages/admin/layout/config/__pages';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';

const Layout: FC = () => {
  const [cookies] = useCookies();
  const { breadcrumbs, path } = useBreadcrumbs();

  return (
    <SidebarProvider defaultOpen={cookies['sidebar:state'] === true}>
      <AppSidebar config={pagesConfig} />
      <main className={'relative flex min-h-svh flex-1 flex-col bg-background'}>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              FallbackComponent={({ error, resetErrorBoundary }) => {
                const location = useLocation();
                const errorLocation = useRef(location.pathname);

                useEffect(() => {
                  if (location.pathname !== errorLocation.current) {
                    resetErrorBoundary();
                  }
                }, [location.pathname]);

                const errorMessage = isGraphQLRequestError(error)
                  ? error.response.errors[0].message
                  : error.message;

                return (
                  <>
                    <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
                      <div className='flex flex-1 items-center gap-2 px-4'>
                        <SidebarTrigger className='-ml-1' />
                        <Separator
                          orientation='vertical'
                          className='mr-2 h-4'
                        />
                        <div className='ml-auto'>
                          <ModeToggle />
                        </div>
                      </div>
                    </header>
                    <div className='flex justify-center items-center grow'>
                      <div className='container max-w-[600px]'>
                        <Alert className='flex flex-col'>
                          <OctagonAlert className='h-4 w-4' />
                          <AlertTitle>Ошибка</AlertTitle>
                          <AlertDescription className='mb-3'>
                            {errorMessage}
                          </AlertDescription>
                          <div className='flex'>
                            <Button
                              className='sm:ml-auto flex-1 sm:flex-none'
                              variant='secondary'
                              onClick={() => resetErrorBoundary()}
                            >
                              Повторить запрос
                            </Button>
                          </div>
                        </Alert>
                      </div>
                    </div>
                  </>
                );
              }}
              onReset={reset}
            >
              <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
                <div className='flex flex-1 items-center gap-2 px-2 sm:px-4'>
                  <SidebarTrigger className='-ml-1' />
                  <Separator orientation='vertical' className='mr-2 h-4' />
                  {breadcrumbs.length > 0 && (
                    <Breadcrumb>
                      <BreadcrumbList>
                        {breadcrumbs.map((crumb, idx) => (
                          <BreadcrumbItem key={(crumb.url as string) || crumb.title}>
                            {crumb.url &&
                            crumb.url !== '#' &&
                            crumb.url !== path ? (
                              <BreadcrumbLink asChild>
                                <Link to={crumb.url}>{crumb.title}</Link>
                              </BreadcrumbLink>
                            ) : (
                              <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                            )}
                            {idx < breadcrumbs.length - 1 && (
                              <BreadcrumbSeparator />
                            )}
                          </BreadcrumbItem>
                        ))}
                      </BreadcrumbList>
                    </Breadcrumb>
                  )}

                  <div className='ml-auto'>
                    <ModeToggle />
                  </div>
                </div>
              </header>
              <Outlet />
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </main>
    </SidebarProvider>
  );
};

export default Layout;
