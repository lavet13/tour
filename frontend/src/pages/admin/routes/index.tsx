import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { MapPinPlus } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RouteForm } from '@/features/routes/components';
import { useDrawerState } from '@/hooks/use-drawer-state';
import { useViewportDimensions } from '@/hooks/use-viewport-dimentions';
import { useRegions } from '@/features/region';
import RegionSection from './__region-section';
import { SonnerSpinner } from '@/components/sonner-spinner';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import CitySelectionForm from '@/components/city-selection';

function RoutesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const routeId = searchParams.get('route_id');
  const addRoute = searchParams.get('add_route');
  const departureCityId = searchParams.get('departureCityId') || '';
  const arrivalCityId = searchParams.get('arrivalCityId') || '';

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

  const handleValuesChange = (values: any) => {
    // This gets called automatically whenever both cities are selected
    console.log('Auto-submitting with values:', values);
    // Call your API or perform any action needed with these values
  };

  const MOBILE_BREAKPOINT = 400;
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const { contentWidth, sidebarExpanded } = useViewportDimensions();

  return (
    <div className='container px-1 sm:px-2 pt-2 mx-auto overflow-hidden flex-1 flex flex-col'>
      <div
        className={cn('relative space-y-2 flex-1', !sidebarExpanded && 'mx-0')}
        style={{
          maxWidth: `calc(${contentWidth}px)`,
        }}
      >
        <Breadcrumb className='mb-3'>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link className='flex items-center gap-2' to={`/admin/home`}>
                  Главная
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Маршруты</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className='flex items-center gap-2'>
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

        <CitySelectionForm />

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
            onEdit={handleEditRoute}
            onDelete={handleDeleteRoute}
          />
        ))}

        <Drawer open={isOpen} onOpenChange={setIsOpen} onClose={handleClose}>
          {/* <DrawerContent className="inset-x-auto right-2"> */}
          <DrawerContent>
            <RouteForm
              sidebarExpanded={sidebarExpanded}
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
