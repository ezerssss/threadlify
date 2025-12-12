import { Kanban, type LucideIcon, User, BookUserIcon, LightbulbIcon } from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  isManagerOnly?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        title: "Kanban",
        url: "/dashboard/default",
        icon: Kanban,
      },
      {
        title: "Insights",
        url: "/dashboard/tasks",
        icon: LightbulbIcon,
      },
      {
        title: "Profile",
        url: "/dashboard/profile",
        icon: User,
      },
      {
        title: "Managed accounts",
        url: "/dashboard/manager",
        isManagerOnly: true,
        icon: BookUserIcon,
      },
      // {
      //   title: "Stats",
      //   url: "/dashboard/crm",
      //   icon: ChartBar,
      //   comingSoon: true,
      // },
      // {
      //   title: "Finance",
      //   url: "/dashboard/finance",
      //   icon: Banknote,
      // },
    ],
  },
];
