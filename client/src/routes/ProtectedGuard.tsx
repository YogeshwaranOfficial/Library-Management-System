import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const ProtectedGuard = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // 1. If not logged in at all, boot them to login console
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Strict URL Space Boundary Enforcement
  // Prevent Librarians from entering the "/admin" namespace
  if (location.pathname.startsWith("/admin") && user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  // Prevent Admins from entering librarian dashboard paths
  if (!location.pathname.startsWith("/admin") && user?.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};