import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { ArrowLeft, MapPinPlus } from 'lucide-react';
import { useDeferredValue, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { RouteForm } from '@/features/routes/components';
import { useDrawerState } from '@/hooks/use-drawer-state';
import { Separator } from '@/components/ui/separator';
import { useViewportDimensions } from '@/hooks/use-viewport-dimentions';
import { useRegions } from '@/features/region';
import RegionSection from './__region-section';
import { SonnerSpinner } from '@/components/sonner-spinner';

function RoutesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('q') ?? '';
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const routeId = searchParams.get('route_id');
  const addRoute = searchParams.get('add_route');

  const { isOpen, mode, setIsOpen, openDrawer } = useDrawerState<
    'idle' | 'addRoute' | 'editRoute'
  >({
    initialMode: 'idle',
    queryParams: {
      addRoute: 'add_route',
      editRoute: 'route_id',
    },
    paramValues: {
      route_id: routeId,
      add_route: addRoute,
    },
  });

  const { data: regionsData, isPending: isRegionsPending } = useRegions();
  const regions = useMemo(
    () => [
      ...(regionsData?.regions ?? []),
      { id: null, name: 'Маршруты без региона' },
    ],
    [regionsData],
  );

  const handleClose = () => {
    if (mode === 'editRoute') {
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());
        query.delete('route_id');
        return query;
      });
    } else if (mode === 'addRoute') {
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());
        query.delete('add_route');
        return query;
      });
    }
  };

  const handleAddRoute = () => {
    openDrawer('addRoute');
    setSearchParams(params => {
      const query = new URLSearchParams(params.toString());
      query.set('add_route', 'true');
      return query;
    });
  };

  const handleEditRoute = (id: string) => {
    openDrawer('editRoute');
    setSearchParams(params => {
      const query = new URLSearchParams(params.toString());
      query.set('route_id', id);
      return query;
    });
  };

  const handleDeleteRoute = (id: string) => {};

  const MOBILE_BREAKPOINT = 400;
  const { isMobile, contentWidth, sidebarExpanded } =
    useViewportDimensions(MOBILE_BREAKPOINT);

  return (
    <div className='container px-1 sm:px-2 pt-2 mx-auto overflow-hidden flex-1 flex flex-col'>
      <div
        className={cn('relative space-y-2 flex-1', !sidebarExpanded && 'mx-0')}
        style={{
          maxWidth: `calc(${contentWidth}px)`,
        }}
      >
        <div className='flex items-center gap-2'>
          <Tooltip delayDuration={700}>
            <TooltipTrigger asChild>
              <Button
                className={cn('h-10 min-w-10', isMobile && 'h-9 min-w-9')}
                variant='outline'
                size='icon'
                onClick={() => navigate('../home')}
              >
                <ArrowLeft />
                <span className='sr-only'>Назад</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              align={!sidebarExpanded ? 'start' : 'center'}
              side='bottom'
            >
              Вернуться назад
            </TooltipContent>
          </Tooltip>

          <Input
            className={cn('max-w-full sm:max-w-[300px]', isMobile && 'h-9')}
            placeholder='Найти маршрут...'
            value={searchQuery}
            onChange={e => {
              setSearchParams(params => {
                const query = new URLSearchParams(params.toString());

                if (e.target.value.length === 0) {
                  query.delete('q');
                  return query;
                }

                query.set('q', e.target.value);
                return query;
              });
            }}
          />

          {isMobile && (
            <Tooltip delayDuration={700}>
              <TooltipTrigger asChild>
                <Button
                  className='h-9 min-w-9'
                  size={'icon'}
                  onClick={handleAddRoute}
                >
                  <MapPinPlus />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                align={!sidebarExpanded ? 'start' : 'center'}
                side='bottom'
              >
                Добавить маршрут
              </TooltipContent>
            </Tooltip>
          )}
          {!isMobile && (
            <Button onClick={handleAddRoute}>
              <MapPinPlus />
              Добавить маршрут
            </Button>
          )}
        </div>

        {isRegionsPending && (
          <div className='flex-1 flex items-center justify-center min-h-screen'>
            <SonnerSpinner className='bg-foreground' />
          </div>
        )}

        {/* Render routes organized by region */}
        {regions.map(region => (
          <RegionSection
            key={region.id}
            regionId={region.id}
            regionName={region.name}
            searchQuery={deferredSearchQuery}
            onEdit={handleEditRoute}
            onDelete={handleDeleteRoute}
          />
        ))}

        <Drawer open={isOpen} onOpenChange={setIsOpen} onClose={handleClose}>
          {/* <DrawerContent className="inset-x-auto right-2"> */}
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                {mode === 'addRoute' && 'Добавить новый маршрут'}
                {mode === 'editRoute' && 'Изменить маршрут'}
                {mode === 'idle' && <Skeleton className='h-6 w-full' />}
              </DrawerTitle>
            </DrawerHeader>
            <Separator className='mt-2 mb-4' />
            <RouteForm
              onClose={handleClose}
              routeId={routeId}
              drawerMode={mode}
            />
          </DrawerContent>
          {/* </DrawerContent> */}
        </Drawer>
      </div>
    </div>
  );
}

export default RoutesPage;
