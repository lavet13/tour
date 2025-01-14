import { useEffect, useState } from 'react';

export type DrawerMode = 'idle' | 'editRoute' | 'addRoute';

interface UseDrawerStateProps {
  routeId: string | null;
  addRoute: string | null;
}

export function useDrawerState({ routeId, addRoute }: UseDrawerStateProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('idle');

  // Only set up edit drawerMode when route_id is present
  useEffect(() => {
    if (routeId) {
      setDrawerMode('editRoute');
    } else if (addRoute) {
      setDrawerMode('addRoute');
    } else if (!isDrawerOpen) {
      setDrawerMode('idle');
    }
  }, [routeId, addRoute, isDrawerOpen]);

  // Handle drawer state based on route_id
  useEffect(() => {
    if (!addRoute && isDrawerOpen && drawerMode === 'addRoute') {
      setIsDrawerOpen(false);
    }
    if (addRoute && !isDrawerOpen && drawerMode === 'addRoute') {
      setIsDrawerOpen(true);
    }
    if (!routeId && isDrawerOpen && drawerMode === 'editRoute') {
      setIsDrawerOpen(false);
    }
    if (routeId && !isDrawerOpen && drawerMode === 'editRoute') {
      setIsDrawerOpen(true);
    }
  }, [routeId, addRoute, isDrawerOpen, drawerMode]);

  return {
    isDrawerOpen,
    drawerMode,
    setIsDrawerOpen,
    setDrawerMode,
  };
}
