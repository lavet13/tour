import { useEffect, useState, useCallback } from 'react';

// Define all possible drawer modes
export type DrawerMode = 'idle' | 'addRoute' | 'editRoute' | 'addSchedule' | 'editSchedule';

interface UseDrawerStateOptions<T extends DrawerMode> {
  // Initial mode
  initialMode?: T;
  // Query param keys to watch
  queryParams?: Partial<Record<T, string>>;
  // Current query param values (from useSearchParams or similar)
  paramValues?: Record<string, string | null>;
  // Whether drawer should close automatically when param is removed
  autoClose?: boolean;
}

export function useDrawerState<T extends DrawerMode>({
  initialMode = 'idle' as T,
  queryParams = {} as Record<T, string>,
  paramValues = {},
  autoClose = true,
}: UseDrawerStateOptions<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<T>(initialMode);

  // Determine if drawer should be open based on URL params
  useEffect(() => {
    const shouldBeOpen = Object.entries(queryParams).some(([modeKey, paramKey]) => {
      return paramValues[paramKey as string] && modeKey !== 'idle';
    });

    // Set correct mode based on URL params
    for (const [modeKey, paramKey] of Object.entries(queryParams)) {
      if (paramValues[paramKey as string] && modeKey !== 'idle') {
        setMode(modeKey as T);
        break;
      }
    }

    // Auto-close if all relevant params are gone
    if (autoClose && !shouldBeOpen && isOpen) {
      setIsOpen(false);
    }

    // Auto-open if params indicate we should
    if (shouldBeOpen && !isOpen) {
      setIsOpen(true);
    }
  }, [paramValues, queryParams, isOpen, autoClose]);

  // Reset mode to idle when closed
  useEffect(() => {
    if (!isOpen && mode !== initialMode) {
      setMode(initialMode);
    }
  }, [isOpen, mode, initialMode]);

  // Helper to open drawer with specific mode
  const openDrawer = useCallback((newMode: T) => {
    setMode(newMode);
    setIsOpen(true);
  }, []);

  // Helper to close drawer
  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    mode,
    setIsOpen,
    setMode,
    openDrawer,
    closeDrawer,
  };
}
