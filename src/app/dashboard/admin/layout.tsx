"use client";

import React, { ReactNode } from "react";

import AdminProtectedRouteWrapper from "@/components/admin-route-wrapper";

function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return <AdminProtectedRouteWrapper>{children}</AdminProtectedRouteWrapper>;
}

export default Layout;
