import { LucideIcon } from "lucide-react";
import { To } from "react-router-dom";

export interface NavItem {
  isActive?: boolean;
  title: string;
  icon?: LucideIcon;
  url: To;
  label?: string;
  description?: string;
}


export interface NavItemWithChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface MainNavItem extends NavItem {}

export interface SidebarNavItem extends NavItemWithChildren {}
