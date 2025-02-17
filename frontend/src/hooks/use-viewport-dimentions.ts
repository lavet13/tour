import { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAtom } from 'jotai';
import { breakpointsAtom } from '@/lib/atoms/tailwind';
import { useSidebar } from '@/components/ui/sidebar';

export interface ViewportDimensions {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isFullHD: boolean;
  contentWidth: number;
  sidebarExpanded: boolean;
}

export const useViewportDimensions = (mobileBreakpoint: number = 450): ViewportDimensions => {
  const [innerWidth, setInnerWidth] = useState(0);
  const [innerHeight, setInnerHeight] = useState(0);
  const [{ md, xl }] = useAtom(breakpointsAtom);
  const { state: sidebarState } = useSidebar();

  const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint}px)`);
  const isTablet = useMediaQuery(`(min-width: ${md}px)`);
  const isFullHD = useMediaQuery(`(min-width: ${xl}px)`);
  const sidebarExpanded = sidebarState === 'expanded';

  useEffect(() => {
    const updateViewportSize = () => {
      setInnerWidth(window.innerWidth);
      setInnerHeight(window.innerHeight);
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);

    return () => {
      window.removeEventListener('resize', updateViewportSize);
    };
  }, []);

  // Calculate the content width based on sidebar state
  const contentWidth = innerWidth - (isTablet && sidebarExpanded ? 256 : 0);

  return {
    width: innerWidth,
    height: innerHeight,
    isMobile,
    isTablet,
    isFullHD,
    contentWidth,
    sidebarExpanded
  };
};
