import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import type { UserRole } from "@/entities/user/model";
import { routes } from "@/shared/constants/routes";
import { useAuthSession } from "../hooks/useAuthSession";

interface RoleRouteProps {
  allowedRoles: UserRole[];
  allowGuest?: boolean;
}

export function RoleRoute({
  allowedRoles,
  allowGuest = false,
  children,
}: PropsWithChildren<RoleRouteProps>) {
  const session = useAuthSession();

  if (!session) {
    return allowGuest ? <>{children}</> : <Navigate to={routes.login} replace />;
  }

  if (!allowedRoles.includes(session.user.role)) {
    return <Navigate to={getHomePathForRole(session.user.role)} replace />;
  }

  return <>{children}</>;
}

export function RoleHomeRedirect() {
  const session = useAuthSession();

  return <Navigate to={getHomePathForRole(session?.user.role)} replace />;
}

export function getHomePathForRole(role?: UserRole) {
  if (role === "organizer") {
    return routes.organizerDashboard;
  }

  if (role === "gate") {
    return routes.gateValidation;
  }

  return routes.events;
}
