import { useLocation } from 'react-router-dom';
import { pagesConfig } from '@/pages/admin/layout/config/__pages';
import { SidebarNavItem } from '@/pages/admin/layout/types/__nav';
import { findBreadcrumbPath } from '@/helpers/find-breadcrumb-path';

export const useBreadcrumbs = (): {
  breadcrumbs: SidebarNavItem[];
  path: string;
} => {
  const location = useLocation();
  const path = location.pathname;

  const mainBreadcrumb = pagesConfig.mainNav.find(
    item => item.title === 'Главная',
  );

  // Try finding breadcrumbs in sidebarNav
  const sidebarTrail = findBreadcrumbPath(
    path,
    pagesConfig.sidebarNav,
    '',
    mainBreadcrumb,
  );

  // If no breadcrumbs found in sidebarNav, check mainNav
  if (sidebarTrail.length === 0) {
    const mainNavTrail = findBreadcrumbPath(path, pagesConfig.mainNav);
    if (mainNavTrail.length) return { breadcrumbs: mainNavTrail, path };
  }

  return {
    breadcrumbs: sidebarTrail,
    path,
  };
};
