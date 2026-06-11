import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { axiosClient } from "../../../api/axiosClient";
import { LoginSchema } from "../../../types/schemas";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react";

export const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "LIBRARIAN">("LIBRARIAN");
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

    const parsingResults = LoginSchema.safeParse({ email, password, role: selectedRole });

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

    try {
      const networkResponse = await axiosClient.post("/auth/login", { gmail: email, password, role: selectedRole });
      const targetPayload = networkResponse.data?.data || networkResponse.data;
      const { user, token } = targetPayload;

      if (!token || !user) {
        toast.error("Invalid token package structural layout returned from server.");
        return;
      }

      if (user.role === "ADMIN" && selectedRole === "ADMIN") {
        setAuth(user, token);
        toast.success("Admin Logged In Successfully");
        navigate("/admin/dashboard");
      } else if (user.role === "LIBRARIAN" && selectedRole === "LIBRARIAN") {
        setAuth(user, token);
        toast.success("Librarian Logged In Successfully");
        navigate("/dashboard");
      } else {
        toast.error("Access Denied: Role mismatch error.");
        navigate("/login");
      }
    } catch (error: unknown) {
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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 font-sans selection:bg-amber-100">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-100 bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden"
      >
        {/* Branding Header */}
        <div className="bg-slate-900 p-8 text-center text-white border-b border-slate-800">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <BookOpen size={24} className="text-white" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">Library Management</h2>
          <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mt-1">Authentication Portal</p>
        </div>

        <form onSubmit={handleFormSubmission} className="p-8 space-y-6">
          {/* Role Tabs */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Access Level</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedRole("LIBRARIAN")}
                className={`py-2 text-[11px] font-bold rounded-lg transition-all ${selectedRole === "LIBRARIAN" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
              >
                Librarian
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("ADMIN")}
                className={`py-2 text-[11px] font-bold rounded-lg transition-all ${selectedRole === "ADMIN" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
              <input
                type="email"
                placeholder="admin@library.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
              />
            </div>
            {fieldErrors.email && <p className="text-[10px] text-rose-600 font-bold mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
              <button type="button" onClick={() => toast.info("Contact Systems Admin.")} className="text-[10px] font-bold text-amber-600 hover:text-amber-700 transition-colors">
                Forgot?
              </button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-700">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-[10px] text-rose-600 font-bold mt-1">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? "Validating..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};