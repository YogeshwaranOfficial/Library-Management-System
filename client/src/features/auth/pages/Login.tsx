import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { axiosClient } from "../../../api/axiosClient";
import { LoginSchema } from "../../../types/schemas";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Form Field Tracking Configuration states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "LIBRARIAN">("LIBRARIAN");
  
  // UI Presentation States
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

    // 1. Client-Side Parsing via Zod Engine Engine
    const parsingResults = LoginSchema.safeParse({
      email,
      password,
      role: selectedRole,
    });

    if (!parsingResults.success) {
      const structuredErrors: { email?: string; password?: string } = {};
      parsingResults.error.issues.forEach((err) => {
        if (err.path[0] === "email") structuredErrors.email = err.message;
        if (err.path[0] === "password") structuredErrors.password = err.message;
      });
      setFieldErrors(structuredErrors);
      setIsLoading(false);
      toast.error("Validation validation failed. Please address layout errors.");
      return;
    }

    // 2. Transmit Handshake request to the backend REST API
    try {
      const networkResponse = await axiosClient.post("/auth/login", {
        email,
        password,
        role: selectedRole,
      });

      const { user, token } = networkResponse.data;

      // Commit the session credentials to global memory storage
      setAuth(user, token);
      toast.success("Security authorization handshake complete!");
      
      // Dynamic operational routing redirection path choice
      navigate("/dashboard");
    } catch (error: unknown) { // FIX (ESLint): Changed from 'any' to 'unknown'
      console.error("Login authorization collapse anomaly:", error);
      
      // FIX (ESLint): Safe Type-Guarded extraction parsing
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Invalid account credentials.");
      } else {
        toast.error("An unexpected infrastructure error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-screen h-screen w-screen flex items-center justify-center bg-ocean-blue px-4 relative overflow-hidden">
      {/* Decorative Branding Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-124 h-125 rounded-full bg-teal-brand/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-100 h-100 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* Core Presentation Branding Shield */}
        <div className="bg-linear-to-r from-ocean-light to-ocean-blue p-8 text-center text-white border-b border-gray-800">
          <div className="w-12 h-12 bg-teal-brand rounded-xl flex items-center justify-center mx-auto text-2xl mb-3 shadow-md">
            📚
          </div>
          <h2 className="text-2xl font-bold tracking-tight">System Core Authentication</h2>
          <p className="text-gray-400 text-xs mt-1">Enterprise Library Management Core Shell Portal</p>
        </div>

        <form onSubmit={handleFormSubmission} className="p-8 space-y-6">
          {/* RBAC Role Selector Tabs System */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Access Profile Authorization Clearances</label>
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setSelectedRole("LIBRARIAN")}
                className={`py-2 text-sm font-medium rounded-lg transition-all ${
                  selectedRole === "LIBRARIAN"
                    ? "bg-white text-teal-brand shadow-sm font-semibold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Librarian Access
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("ADMIN")}
                className={`py-2 text-sm font-medium rounded-lg transition-all ${
                  selectedRole === "ADMIN"
                    ? "bg-white text-teal-brand shadow-sm font-semibold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                System Admin
              </button>
            </div>
          </div>

          {/* Email Destination Input Structure */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 tracking-wide block">System Identity Domain Address (Email)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none text-sm">✉️</span>
              <input
                type="email"
                placeholder="librarian@enterprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all outline-none focus:bg-white focus:ring-2 ${
                  fieldErrors.email 
                    ? "border-red-400 focus:ring-red-100 focus:border-red-500" 
                    : "border-gray-200 focus:ring-teal-100 focus:border-teal-brand"
                }`}
              />
            </div>
            {fieldErrors.email && <p className="text-xs text-red-500 font-medium">{fieldErrors.email}</p>}
          </div>

          {/* Password Security Input Structure with Visibility Toggle */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-700 tracking-wide block">Network Signature Credentials (Password)</label>
              <button 
                type="button" 
                onClick={() => toast.info("Please notify an administrative systems officer to handle key updates.")}
                className="text-xs font-semibold text-teal-brand hover:text-teal-hover transition-colors outline-none"
              >
                Key Recovery?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none text-sm">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-9 pr-10 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all outline-none focus:bg-white focus:ring-2 ${
                  fieldErrors.password 
                    ? "border-red-400 focus:ring-red-100 focus:border-red-500" 
                    : "border-gray-200 focus:ring-teal-100 focus:border-teal-brand"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors text-xs outline-none"
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
            {fieldErrors.password && <p className="text-xs text-red-500 font-medium">{fieldErrors.password}</p>}
          </div>

          {/* Core Submission Trigger Module */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-teal-brand hover:bg-teal-hover disabled:bg-teal-brand/50 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 outline-none cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Validating Signature...</span>
              </>
            ) : (
              <span>Authorize Account Portal</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};