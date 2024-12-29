import { Bus, Home, Tickets } from "lucide-react";
import { MainNavItem, SidebarNavItem } from "../types/__nav";

export interface PagesConfig {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
}

export const pagesConfig: PagesConfig = {
  mainNav: [
    {
      title: 'Главная',
      icon: Home,
      url: '/admin/home',
    }
  ],
  sidebarNav: [
    {
      title: 'Перевозки',
      icon: Bus,
      url: '#',
      isActive: true,
      items: [
        {
          icon: Tickets,
          title: 'Бронирования',
          url: '/admin/bookings',
          description: 'Заявки на бронирование от клиентов',
        },
      ],
    },
  ],
};
