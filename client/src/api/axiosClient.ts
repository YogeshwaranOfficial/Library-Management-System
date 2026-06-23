import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";

export const axiosClient: AxiosInstance = axios.create({
  // FIXED: Added /v1 to match your app.ts mounting route
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    
    // 🔍 Add this line to see exactly WHAT token your frontend is shipping out!
    console.log("Axios sending token to server:", token ? `${token.substring(0, 15)}...` : "NONE"); 

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (status === 401) {
      if (!isLoginRequest) {
        toast.error("Session expired. Re-authenticating...");
        useAuthStore.getState().logout();
      } else {
        // Handle wrong credentials on the login screen cleanly
        toast.error(error.response?.data?.message || "Invalid credentials.");
      }
    } else if (status === 403) {
      toast.error("Unauthorized operation blocked.");
    } else if (status === 404) {
      // 💡 FIXED: Prevent 404s from executing a force-logout sequence
      toast.warning(`Server API Endpoint Missing: ${error.config?.url}`);
    } else {
      toast.error(error.response?.data?.message || "An unexpected network anomaly occurred.");
    }
    return Promise.reject(error);
  }
);