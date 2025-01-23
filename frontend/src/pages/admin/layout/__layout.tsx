import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ChevronRightIcon, OctagonAlert } from 'lucide-react';
import { FC, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { useCookies } from 'react-cookie';
import { ModeToggle } from '@/components/mode-toggle';
import { pagesConfig } from '@/pages/admin/layout/config/__pages';
import { RainbowButton } from '@/components/ui/rainbow-button';

const Layout: FC = () => {
  const [cookies] = useCookies();
  const location = useLocation();
  const errorLocation = useRef(location.pathname);

  return (
    <SidebarProvider defaultOpen={cookies['sidebar:state'] === true}>
      <AppSidebar config={pagesConfig} />
      <main className={'relative flex min-h-svh flex-1 flex-col bg-background'}>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              FallbackComponent={({ error, resetErrorBoundary }) => {
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
                    <header className='sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
                      <div className='flex flex-1 justify-between items-center gap-2 px-2 sm:px-4'>
                        <SidebarTrigger className='sm:-ml-1' />
                        {/* <Separator orientation='vertical' className='mr-2 h-4' /> */}

                        <div className='flex items-center gap-2 w-full flex-1 sm:w-auto sm:flex-none'>
                          <RainbowButton
                            rightElement={
                              <ChevronRightIcon className='ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1' />
                            }
                            className='text-sm w-full h-8 sm:h-9 px-4 py-2'
                            asChild
                          >
                            <Link
                              onClick={() => window.scrollTo({ top: 0 })}
                              to='/'
                            >
                              Вернуться на сайт
                            </Link>
                          </RainbowButton>

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
              <header className='sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
                <div className='flex flex-1 justify-between items-center gap-2 px-2 sm:px-4'>
                  <SidebarTrigger className='sm:-ml-1' />
                  {/* <Separator orientation='vertical' className='mr-2 h-4' /> */}

                  <div className='flex items-center gap-2 w-full flex-1 sm:w-auto sm:flex-none'>
                    <RainbowButton
                      rightElement={
                        <ChevronRightIcon className='ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1' />
                      }
                      className='text-sm w-full h-8 sm:h-9 px-4 py-2'
                      asChild
                    >
                      <Link onClick={() => window.scrollTo({ top: 0 })} to='/'>
                        Вернуться на сайт
                      </Link>
                    </RainbowButton>

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
