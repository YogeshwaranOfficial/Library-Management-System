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

    // 1. Client-Side Parsing via your frontend schema
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
      toast.error("Validation failed. Please address layout errors.");
      return;
    }

    // 2. Transmit Handshake request to the backend REST API
    try {
      const networkResponse = await axiosClient.post("/auth/login", {
        gmail: email,      
        password: password, 
        role: selectedRole, 
      });

      const targetPayload = networkResponse.data?.data || networkResponse.data;
      const { user, token } = targetPayload;

      if (!token || !user) {
        toast.error("Invalid token package structural layout returned from server.");
        return;
      }

      setAuth(user, token);
      toast.success("Login Successfully");
      navigate("/dashboard");

    } catch (error: unknown) {
      console.error("Login Failed:", error);
      
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
    <div className="min-h-screen h-screen w-screen flex items-center justify-center bg-slate-secondary px-4 relative overflow-hidden font-sans">
      {/* Decorative Branding Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-124 h-125 rounded-full bg-sage-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-100 h-100 rounded-full bg-white/5 blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-light/10 overflow-hidden"
      >
        {/* Core Presentation Branding Shield */}
        <div className="bg-linear-to-r from-slate-secondary/90 to-slate-secondary p-8 text-center text-white border-b border-slate-light/10">
          <div className="w-12 h-12 bg-sage-primary rounded-xl flex items-center justify-center mx-auto text-2xl mb-3 shadow-md">
            📚
          </div>
          <h2 className="text-xl font-bold tracking-tight">Welcome to</h2>
          <h2 className="text-xl font-bold tracking-tight mt-0.5">Library Management System</h2>
        </div>

        <form onSubmit={handleFormSubmission} className="p-8 space-y-5">
          {/* RBAC Role Selector Tabs System */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-light uppercase tracking-wider block">Choose Your Role</label>
            <div className="grid grid-cols-2 gap-2 bg-canvas-dominant p-1.5 rounded-xl border border-slate-light/10">
              <button
                type="button"
                onClick={() => setSelectedRole("LIBRARIAN")}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRole === "LIBRARIAN"
                    ? "bg-white text-sage-primary shadow-xs"
                    : "text-slate-light hover:text-slate-secondary"
                }`}
              >
                Librarian Access
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("ADMIN")}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRole === "ADMIN"
                    ? "bg-white text-sage-primary shadow-xs"
                    : "text-slate-light hover:text-slate-secondary"
                }`}
              >
                System Admin
              </button>
            </div>
          </div>

          {/* Email Destination Input Structure */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-light uppercase tracking-wider block">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-light pointer-events-none text-xs">✉️</span>
              <input
                type="email"
                placeholder="librarian@enterprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 bg-canvas-dominant border text-slate-secondary rounded-xl text-sm font-semibold transition-all outline-hidden focus:bg-white focus:ring-4 ${
                  fieldErrors.email 
                    ? "border-utility-crimson focus:ring-utility-crimson/10 focus:border-utility-crimson" 
                    : "border-slate-light/10 focus:ring-sage-primary/10 focus:border-sage-primary"
                }`}
              />
            </div>
            {fieldErrors.email && <p className="text-xs text-utility-crimson font-medium mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Password Security Input Structure with Visibility Toggle */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-light uppercase tracking-wider block">Password</label>
              <button 
                type="button" 
                onClick={() => toast.info("Please notify an administrative systems officer to handle key updates.")}
                className="text-xs font-bold text-sage-primary hover:text-sage-primary/80 transition-colors outline-hidden cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-light pointer-events-none text-xs">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-9 pr-10 py-2.5 bg-canvas-dominant border text-slate-secondary rounded-xl text-sm font-semibold transition-all outline-hidden focus:bg-white focus:ring-4 ${
                  fieldErrors.password 
                    ? "border-utility-crimson focus:ring-utility-crimson/10 focus:border-utility-crimson" 
                    : "border-slate-light/10 focus:ring-sage-primary/10 focus:border-sage-primary"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-light hover:text-slate-secondary transition-colors text-xs outline-hidden cursor-pointer"
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
            {fieldErrors.password && <p className="text-xs text-utility-crimson font-medium mt-1">{fieldErrors.password}</p>}
          </div>

          {/* Core Submission Trigger Module */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-sage-primary hover:bg-sage-primary/90 disabled:bg-slate-light/20 disabled:text-slate-light/50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs active:scale-[0.99] flex items-center justify-center gap-2 outline-hidden cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Validating credentials...</span>
              </>
            ) : (
              <span>Login to Dashboard</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};