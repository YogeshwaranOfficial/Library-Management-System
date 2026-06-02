import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";

export const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to inject bearer token before request hits the network
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to globalize exception management (e.g., handling token expirations)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      toast.error("Session expired. Re-authenticating...");
      useAuthStore.getState().logout();
    } else if (status === 403) {
      toast.error("Unauthorized operation blocked.");
    } else {
      toast.error(error.response?.data?.message || "An unexpected network anomaly occurred.");
    }
    return Promise.reject(error);
  }
);