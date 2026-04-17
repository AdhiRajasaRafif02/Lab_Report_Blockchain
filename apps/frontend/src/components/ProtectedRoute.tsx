import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types/api";
import { LoadingState } from "./LoadingState";

export const ProtectedRoute = ({ roles }: { roles?: UserRole[] }) => {
  const { isReady, isAuthenticated, hasRole } = useAuth();

  if (!isReady) return <LoadingState label="Loading session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !hasRole(roles)) return <Navigate to="/" replace />;

  return <Outlet />;
};
