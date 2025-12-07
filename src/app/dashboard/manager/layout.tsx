"use client";

import React, { ReactNode } from "react";

import ManagerProtectedRouteWrapper from "@/components/manager-route-wrapper";

function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return <ManagerProtectedRouteWrapper>{children}</ManagerProtectedRouteWrapper>;
}

export default Layout;
