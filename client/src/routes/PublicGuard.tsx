import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const PublicGuard = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
};