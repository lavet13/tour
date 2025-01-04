import { Bus, Home, Tickets, CalendarClock, Route } from "lucide-react";
import { MainNavItem, SidebarNavItem } from "@/pages/admin/layout/types/__nav";

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
        {
          icon: Route,
          title: 'Маршруты',
          url: '/admin/routes',
          description: 'Определение маршрутов',
        },
        {
          icon: CalendarClock,
          title: 'Расписания',
          url: '/admin/schedules',
          description: 'Определение расписания маршрутов',
        },
      ],
    },
  ],
};
