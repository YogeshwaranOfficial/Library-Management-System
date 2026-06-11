import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const PublicGuard = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  // If NOT logged in, let them view public pages (like /login)
  if (!isAuthenticated) {
    return <Outlet />;
  }

  // 💡 FIXED: Dynamic RBAC deflection for logged-in users trying to access /login
  if (user?.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};