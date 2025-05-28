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
import { Helmet } from 'react-helmet';

const Layout: FC = () => {
  const location = useLocation();
  const errorLocation = useRef(location.pathname);

  return (
    <>
      <Helmet>
        <title>
          Донбасс-Тур - Пассажирские перевозки в Мариуполь и Азовское Побережье
        </title>
        <meta
          name='description'
          content='Донбасс-Тур - надежные пассажирские перевозки в Мариуполь и на Азовское Побережье. Комфортабельные автобусы, профессиональные водители, доступные цены.'
        />
        <meta
          name='keywords'
          content='Донбасс-Тур, пассажирские перевозки, Мариуполь, Азовское побережье, автобусные перевозки, транспорт, билеты'
        />
        <meta name='robots' content='index, follow' />
        <meta httpEquiv='Content-Language' content='ru' />
        <meta name='author' content='Донбасс-Тур' />
        <meta name='copyright' content='© Донбасс-Тур' />

        {/* Open Graph мета-теги */}
        <meta
          property='og:title'
          content='Донбасс-Тур - Пассажирские перевозки в Мариуполь и Азовское Побережье'
        />
        <meta
          property='og:description'
          content='Надежные пассажирские перевозки в Мариуполь и на Азовское Побережье. Комфортабельные автобусы, профессиональные водители.'
        />
        <meta property='og:type' content='website' />
        <meta property='og:locale' content='ru_RU' />
        <meta property='og:site_name' content='Донбасс-Тур' />

        {/* Twitter мета-теги */}
        <meta name='twitter:card' content='summary' />
        <meta
          name='twitter:title'
          content='Донбасс-Тур - Пассажирские перевозки в Мариуполь и Азовское Побережье'
        />
        <meta
          name='twitter:description'
          content='Надежные пассажирские перевозки в Мариуполь и на Азовское Побережье. Комфортабельные автобусы, профессиональные водители.'
        />

        {/* Дополнительные мета-теги для бизнеса */}
        <meta name='geo.region' content='UA' />
        <meta name='geo.placename' content='Мариуполь, Донецкая область' />
        <meta name='business.contact_data.country_name' content='Украина' />
        <meta name='business.contact_data.region' content='Донецкая область' />
        <meta name='business.contact_data.locality' content='Мариуполь' />

        <script type='text/javascript'>
          {`(function (m, e, t, r, i, k, a) {
        m[i] =
          m[i] ||
          function () {
            (m[i].a = m[i].a || []).push(arguments);
          };
        m[i].l = 1 * new Date();
        for (var j = 0; j < document.scripts.length; j++) {
          if (document.scripts[j].src === r) {
            return;
          }
        }
        (k = e.createElement(t)),
          (a = e.getElementsByTagName(t)[0]),
          (k.async = 1),
          (k.src = r),
          a.parentNode.insertBefore(k, a);
      })(
        window,
        document,
        'script',
        'https://mc.yandex.ru/metrika/tag.js',
        'ym',
      );

      ym(101961993, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
      });
      `}
        </script>
        <noscript>
          {`<div><img src="https://mc.yandex.ru/watch/101961993" style="position:absolute; left:-9999px;" alt="" /></div>`}
        </noscript>
      </Helmet>

      {/* Client Layout */}
      <div className='relative flex flex-col'>
        <Header />
        <main className='flex flex-col grow shrink-0 border-b min-h-[calc(100svh-3.5rem)]'>
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
    </>
  );
};

export default Layout;
