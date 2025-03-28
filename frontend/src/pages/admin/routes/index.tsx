import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { Filter, FilterX, MapPinPlus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
import RouteFilterForm from '@/components/route-filter-form';
import { useQueryClient } from '@tanstack/react-query';

function RoutesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const routeId = searchParams.get('route_id');
  const addRoute = searchParams.get('add_route');

  const departureCityIdParams = searchParams.get('departureCityId') || '';
  const arrivalCityIdParams = searchParams.get('arrivalCityId') || '';
  const regionIdParams = searchParams.get('regionId') || '';

  const filteredSearchParams = [
    departureCityIdParams,
    arrivalCityIdParams,
    regionIdParams,
  ].filter(Boolean);
  const activeSearchParamsCount = filteredSearchParams.length;

  // Function to reset filters
  const resetFilters = () => {
    setSearchParams(params => {
      const query = new URLSearchParams(params.toString());
      query.delete('departureCityId');
      query.delete('arrivalCityId');
      query.delete('regionId');
      return query;
    });
  };

  const filter = searchParams.get('filter');
  const {
    isOpen: filterIsOpen,
    mode: filterMode,
    setIsOpen: setFilterIsOpen,
    openDrawer: openFilterDrawer,
  } = useDrawerState<'idle' | 'filter'>({
    initialMode: 'idle',
    queryParams: {
      filter: 'filter',
    },
    paramValues: {
      filter: filter,
    },
  });

  const {
    isOpen: routeIsOpen,
    mode: routeMode,
    setIsOpen: setRouteIsOpen,
    openDrawer: openRouteDrawer,
  } = useDrawerState<'idle' | 'addRoute' | 'editRoute'>({
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
  const regions = useMemo(() => {
    return [
      ...(regionsData?.regions ?? []),
      { id: null, name: 'Маршруты без региона' },
    ].filter(region => {
      if (regionIdParams?.length !== 0) {
        const castedIdParams =
          regionIdParams === 'null' ? null : regionIdParams;

        return region.id === castedIdParams;
      }

      return true;
    });
  }, [regionsData, regionIdParams]);
  console.log({ regions, regionIdParams });

  const handleOpenFilter = () => {
    openFilterDrawer('filter');
    setSearchParams(params => {
      const query = new URLSearchParams(params.toString());
      query.set('filter', 'true');
      return query;
    });
  };

  const handleFilterClose = () => {
    if (filterMode === 'filter') {
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());
        query.delete('filter');
        return query;
      });
    }
  };

  const handleRouteClose = () => {
    if (routeMode === 'editRoute') {
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());
        query.delete('route_id');
        return query;
      });
    } else if (routeMode === 'addRoute') {
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());
        query.delete('add_route');
        return query;
      });
    }
  };

  const handleAddRoute = () => {
    openRouteDrawer('addRoute');
    setSearchParams(params => {
      const query = new URLSearchParams(params.toString());
      query.set('add_route', 'true');
      return query;
    });
  };

  const handleEditRoute = (id: string) => {
    openRouteDrawer('editRoute');
    setSearchParams(params => {
      const query = new URLSearchParams(params.toString());
      query.set('route_id', id);
      return query;
    });
  };

  const handleDeleteRoute = (id: string) => {};

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
        <div
          className={cn(
            'flex justify-between items-center gap-2',
            isMobile && 'justify-end',
          )}
        >
          {isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className='h-9 min-w-9'
                  size={'icon'}
                  onClick={handleAddRoute}
                >
                  <span className='sr-only'>Добавить маршрут</span>
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
            <Button className='h-9 min-w-9' onClick={handleAddRoute}>
              <MapPinPlus />
              Добавить маршрут
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                className='h-9 min-w-9 relative'
                onClick={handleOpenFilter}
              >
                <Filter />
                {activeSearchParamsCount > 0 && (
                  <span className='absolute -top-1 -left-1 bg-primary text-primary-foreground rounded-full text-xs size-4 flex items-center justify-center'>
                    {activeSearchParamsCount}
                  </span>
                )}
                <span className='sr-only'>Фильтры</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              align={!sidebarExpanded ? 'start' : 'center'}
              side='bottom'
            >
              Фильтры
            </TooltipContent>
          </Tooltip>
        </div>

        <Drawer
          direction={'right'}
          open={filterIsOpen}
          onOpenChange={setFilterIsOpen}
          onClose={handleFilterClose}
        >
          <DrawerContent
            isSidebar
            showCloseButton
            showCloseButtonOnMobile
            showTheLine={false}
            direction={'right'}
          >
            <RouteFilterForm />
          </DrawerContent>
        </Drawer>

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

        <Drawer
          open={routeIsOpen}
          onOpenChange={setRouteIsOpen}
          onClose={handleRouteClose}
        >
          {/* <DrawerContent className="inset-x-auto right-2"> */}
          <DrawerContent>
            <RouteForm
              sidebarExpanded={sidebarExpanded}
              onClose={handleRouteClose}
              routeId={routeId}
              drawerMode={routeMode}
            />
          </DrawerContent>
          {/* </DrawerContent> */}
        </Drawer>
      </div>
    </div>
  );
}

export default RoutesPage;
