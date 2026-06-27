import {
  LayoutDashboard,
  Users,
  History,
  Newspaper,
  Gift,
  CalendarClock,
  Calculator,
  Map,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

/** Primary navigation — one entry per feature module. */
export const NAV_ITEMS: NavItem[] = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Tổng quan",
  },
  {
    path: "/resonators",
    label: "Resonators",
    icon: Users,
    description: "Tra cứu & build",
  },
  {
    path: "/convene",
    label: "Convene",
    icon: History,
    description: "Pity & lịch sử thật",
  },
  {
    path: "/news",
    label: "News",
    icon: Newspaper,
    description: "Tin tức chính thức",
  },
  {
    path: "/codes",
    label: "Codes",
    icon: Gift,
    description: "Code đổi quà",
  },
  {
    path: "/banners",
    label: "Banners",
    icon: CalendarClock,
    description: "Lịch & leak banner",
  },
  {
    path: "/tools",
    label: "Tiện ích",
    icon: Calculator,
    description: "Tính pull & farm",
  },
  {
    path: "/map",
    label: "Bản đồ",
    icon: Map,
    description: "Map rương & nguyên liệu",
  },
];
