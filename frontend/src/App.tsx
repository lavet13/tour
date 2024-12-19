import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import suspenseFallbackMap from './suspense-fallback-map';
import { lazy, Suspense } from 'react';

import { SonnerSpinner } from '@/components/sonner-spinner';
import { useGetMe } from './features/auth';

type RouteComponent = (props: JSX.IntrinsicAttributes) => JSX.Element;
type AppRoute = {
  name: string;
  path: string;
  component: RouteComponent;
};

const Loadable =
  (
    Component: React.ComponentType,
    fallback = (
      <div className='flex-1 flex items-center justify-center min-h-screen'>
        <SonnerSpinner className='bg-foreground' scale='2' />
      </div>
    ),
  ) =>
  (props: JSX.IntrinsicAttributes) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );

const NotFound = Loadable(lazy(() => import('@/pages/layout/__not-found')));
const AdminNotFound = Loadable(
  lazy(() => import('@/pages/admin/layout/__not-found')),
);

const AdminLayout = Loadable(
  lazy(() => import('@/pages/admin/layout/__layout')),
);
const Layout = Loadable(lazy(() => import('@/pages/layout/__layout')));

const Login = Loadable(lazy(() => import('@/pages/__login')));

/*
 *
 * example
 * ./pages/home.tsx: () => import("/src/pages/home.tsx")
 * reference: https://vite.dev/guide/features#glob-import
 */
const PagePathsWithComponents: Record<string, any> = import.meta.glob(
  './pages/**/[!_]*.tsx',
);

import.meta.env.DEV &&
  console.log({
    PagePathsWithComponents,
    paths: Object.keys(PagePathsWithComponents),
  });

const processRoutes = (paths: Record<string, any>) => {
  const adminRoutes: AppRoute[] = [];
  const regularRoutes: AppRoute[] = [];

  Object.keys(paths).forEach(path => {
    const dynamicMatch = path.match(
      /\.\/pages\/(.*?)\/\[(.*?)\](?:\/(.*?)(?:\/(.*?))?)?\.tsx$/,
    );

    if (dynamicMatch) {
      const [, routePath, paramName, nestedPath = '', nestedParamName = ''] =
        dynamicMatch;
      const nestedPathToUse = nestedPath === 'index' ? '' : nestedPath;
      const nestedParamToUse = nestedParamName ? `:${nestedParamName}` : '';

      const route: AppRoute = {
        name: `${routePath}/${paramName}${nestedPathToUse ? `/${nestedPathToUse}${nestedParamName}` : ''}`,
        path: `${routePath}/:${paramName}${nestedPathToUse ? `/${nestedPathToUse}${nestedParamToUse}` : ''}`,
        component: Loadable(lazy(paths[path])),
      };

      if (routePath.startsWith('admin/')) {
        adminRoutes.push(route);
      } else {
        regularRoutes.push(route);
      }
      return;
    }

    const regularMatch = path.match(/\.\/pages\/(.*?)\/?(index)?\.tsx$/);
    if (regularMatch) {
      const [, name] = regularMatch;
      const lowerName = name.toLowerCase();

      const route: AppRoute = {
        name,
        path: lowerName === 'home' ? '/' : `/${lowerName}`,
        component: Loadable(lazy(paths[path]), undefined),
      };

      console.log({ route });

      if (name.startsWith('admin')) {
        adminRoutes.push(route);
      } else {
        regularRoutes.push(route);
      }
    }
  });

  return { adminRoutes, regularRoutes };
};

const { adminRoutes, regularRoutes } = processRoutes(PagePathsWithComponents);

import.meta.env.DEV && console.log({ adminRoutes, regularRoutes });

const App = () => {
  return (
    <Routes>
      <Route
        path='/admin'
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to={'home'} replace />} />
        {adminRoutes.map(({ path, component: ReactComponent }) => (
          <Route key={path} path={path} element={<ReactComponent />} />
        ))}
        <Route path='*' element={<AdminNotFound />} />
      </Route>

      <Route path='/' element={<Layout />}>
        {regularRoutes.map(({ path, component: ReactComponent }) => (
          <Route key={path} path={path} element={<ReactComponent />} />
        ))}
        <Route
          path='login'
          element={
            <RedirectUser>
              <Login />
            </RedirectUser>
          }
        />
      </Route>
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
};

function RedirectUser({ children }: { children: JSX.Element }) {
  const { data: user, isLoading } = useGetMe();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className='flex-1 flex items-center justify-center min-h-screen'>
        <SonnerSpinner className='bg-foreground' scale='2' />
      </div>
    );
  }

  if (user?.me) {
    return <Navigate to={'/'} replace state={{ from: location.pathname }} />;
  }

  return children;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { data: user, isLoading } = useGetMe();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className='flex-1 flex items-center justify-center min-h-screen'>
        <SonnerSpinner className='bg-foreground' scale='2' />
      </div>
    );
  }

  if (!user) {
    return <Navigate to='/' replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default App;
