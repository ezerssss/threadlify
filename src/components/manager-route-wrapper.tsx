"use client";

import { ReactNode } from "react";

import { PuffLoader } from "react-spinners";

import UnauthorizedPage from "@/app/unauthorized/page";
import useUser from "@/hooks/use-user";

interface PropsInterface {
  children: ReactNode;
}

function ManagerProtectedRouteWrapper(props: PropsInterface): ReactNode {
  const { children } = props;

  const { claims, isClaimsLoading } = useUser();

  const authCheck = claims.isManager ? children : UnauthorizedPage();

  return isClaimsLoading ? (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <PuffLoader color="#df5e3a" />
    </div>
  ) : (
    authCheck
  );
}

export default ManagerProtectedRouteWrapper;
