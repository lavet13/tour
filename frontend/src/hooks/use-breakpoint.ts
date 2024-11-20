// hooks/use-breakpoint.ts
import { useEffect, useState } from 'react';
import { breakpointsAtom } from '@/lib/atoms/tailwind';
import { useAtom, useAtomValue } from 'jotai';

type BreakpointKey = keyof ReturnType<
  typeof useAtomValue<typeof breakpointsAtom>
>;

type BreakpointValues<T> = {
  base: T;
} & {
  [Key in BreakpointKey]?: T;
};

function useBreakpoint<T>(values: BreakpointValues<T>): T {
  const [currentValue, setCurrentValue] = useState<T>(values.base);
  const [breakpoints] = useAtom(breakpointsAtom);

  useEffect(() => {
    const updateValue = () => {
      let newValue = values.base;

      // Check each breakpoint from largest to smallest
      const breakpointEntries = Object.entries(breakpoints).reverse();

      for (const [breakpoint, minWidth] of breakpointEntries) {
        if (
          window.matchMedia(`(min-width: ${minWidth}px)`).matches &&
          values[breakpoint as BreakpointKey] !== undefined
        ) {
          newValue = values[breakpoint as BreakpointKey] ?? values.base;
          break;
        }
      }

      setCurrentValue(newValue);
    };

    // Initial check
    updateValue();

    // Create media query listeners for each breakpoint
    const mediaQueryLists = Object.entries(breakpoints).map(([_, minWidth]) =>
      window.matchMedia(`(min-width: ${minWidth}px)`),
    );

    // Add listeners
    const listeners = mediaQueryLists.map(mql => {
      const listener = () => updateValue();
      mql.addEventListener('change', listener);
      return { mql, listener };
    });

    // Cleanup
    return () => {
      listeners.forEach(({ mql, listener }) => {
        mql.removeEventListener('change', listener);
      });
    };
  }, [values]);

  return currentValue;
}

export { useBreakpoint };
export type { BreakpointValues, BreakpointKey };
