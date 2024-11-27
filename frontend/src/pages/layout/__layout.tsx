import { FC, useEffect, useRef } from 'react';
import Header from '@/pages/layout/__header';
import Footer from '@/pages/layout/__footer';
import { Outlet, useLocation } from 'react-router-dom';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { OctagonAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Layout: FC = () => {
  return (
    <div className='relative flex flex-col'>
      <Header />
      <main className='flex flex-col grow shrink-0 border-b min-h-[calc(100svh-3.5rem)]'>
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
                  <div className='flex justify-center items-center grow'>
                    <div className='container max-w-[600px]'>
                      <Alert className="flex flex-col">
                        <OctagonAlert className='h-4 w-4' />
                        <AlertTitle>Ошибка</AlertTitle>
                        <AlertDescription className="mb-3">
                          {errorMessage}
                        </AlertDescription>
                        <div className="flex">
                          <Button className="sm:ml-auto flex-1 sm:flex-none" variant="secondary" onClick={() => resetErrorBoundary()}>
                            Повторить запрос
                          </Button>
                        </div>
                      </Alert>
                    </div>
                  </div>
                );
              }}
              onReset={reset}
            >
              <Outlet />
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
