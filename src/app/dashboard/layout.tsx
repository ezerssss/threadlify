"use client";

import { ReactNode, useEffect, useState } from "react";

import { AppSidebar } from "@/app/dashboard/_components/sidebar/app-sidebar";
import ProtectedRouteWrapper from "@/components/protected-route-wrapper";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { SidebarVariant, SidebarCollapsible, ContentLayout, NavbarStyle } from "@/types/preferences/layout";

import PremiumUpgradeDialog from "./_components/sidebar/get-more-scans";
import { ProgressIndicator } from "./_components/sidebar/progress-indicator";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  const [defaultOpen, setDefaultOpen] = useState(true);

  useEffect(() => {
    // Read sidebar state from localStorage
    const storedValue = localStorage.getItem("sidebar_state");
    if (storedValue === "true" || storedValue === "false") {
      setDefaultOpen(storedValue === "true");
    }
  }, []);

  const sidebarVariant: SidebarVariant = "inset";
  const sidebarCollapsible: SidebarCollapsible = "icon";
  const contentLayout: ContentLayout = "centered";
  const navbarStyle: NavbarStyle = "sticky";

  return (
    <ProtectedRouteWrapper>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar variant={sidebarVariant} collapsible={sidebarCollapsible} />
        <SidebarInset
          data-content-layout={contentLayout}
          className={cn(
            "data-[content-layout=centered]:!mx-auto data-[content-layout=centered]:max-w-screen-2xl",
            // Adds right margin for inset sidebar in centered layout up to 113rem.
            // On wider screens with collapsed sidebar, removes margin and sets margin auto for alignment.
            "max-[113rem]:peer-data-[variant=inset]:!mr-2 min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:!mr-auto",
          )}
        >
          <header
            data-navbar-style={navbarStyle}
            className={cn(
              "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
              // Handle sticky navbar style with conditional classes so blur, background, z-index, and rounded corners remain consistent across all SidebarVariant layouts.
              "data-[navbar-style=sticky]:bg-background/50 data-[navbar-style=sticky]:sticky data-[navbar-style=sticky]:top-0 data-[navbar-style=sticky]:z-50 data-[navbar-style=sticky]:overflow-hidden data-[navbar-style=sticky]:rounded-t-[inherit] data-[navbar-style=sticky]:backdrop-blur-md",
            )}
          >
            <div className="flex w-full items-center justify-between px-4 lg:px-6">
              <div className="flex items-center gap-1 lg:gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                <ProgressIndicator />
              </div>
              <div className="flex items-center gap-2">
                {/* <LayoutControls {...layoutPreferences} />
                <ThemeSwitcher />
                <AccountSwitcher /> */}
              </div>
            </div>
          </header>
          <div className="h-full p-4 md:p-6">{children}</div>
        </SidebarInset>
        <PremiumUpgradeDialog />
      </SidebarProvider>
    </ProtectedRouteWrapper>
  );
}
