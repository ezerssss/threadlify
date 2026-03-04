import { Kanban, type LucideIcon, User, BookUserIcon, LightbulbIcon, BotMessageSquareIcon, Shield } from "lucide-react";

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
  isAdminOnly?: boolean;
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
      // {
      //   title: "Assistant",
      //   url: "/dashboard/copilot",
      //   icon: BotMessageSquareIcon,
      // },
      {
        title: "Kanban",
        url: "/dashboard/default",
        icon: Kanban,
      },
      {
        title: "Karma builder",
        url: "/dashboard/karma-builder",
        icon: BotMessageSquareIcon,
      },
      {
        title: "Signals",
        url: "/dashboard/insights",
        icon: LightbulbIcon,
      },
      // {
      //   title: "Competitors",
      //   url: "/dashboard/competitors",
      //   icon: Eye,
      // },
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
      {
        title: "Admin",
        url: "/dashboard/admin",
        isAdminOnly: true,
        icon: Shield,
      },
    ],
  },
];
