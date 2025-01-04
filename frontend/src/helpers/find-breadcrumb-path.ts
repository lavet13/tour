import { SidebarNavItem } from '@/pages/admin/layout/types/__nav';

export const findBreadcrumbPath = (
  path: string,
  items: SidebarNavItem[],
  parentPath = '',
  baseBreadcrumb?: SidebarNavItem,
): SidebarNavItem[] => {
  const normalizePath = (inputPath: string) =>
    inputPath.replace(/^\/#/, '').replace(/\/$/, '');

  const normalizedTargetPath = normalizePath(path);

  for (const item of items) {
    const currentPath = item.url
      ? `${parentPath.replace(/\/$/, '')}${(item.url as string).startsWith('/') ? '' : '/'}${item.url}`
      : parentPath;

    const normalizedCurrentPath = normalizePath(currentPath);

    if (normalizedTargetPath === normalizedCurrentPath) {
      return [item];
    }

    if (item.items) {
      const childPath = findBreadcrumbPath(
        path,
        item.items,
        currentPath,
        baseBreadcrumb,
      );
      if (childPath.length) {
        return baseBreadcrumb
          ? [baseBreadcrumb, item, ...childPath]
          : [item, ...childPath];
      }
    }
  }

  return [];
};
