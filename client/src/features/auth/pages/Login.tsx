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
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "LIBRARIAN">(
    "LIBRARIAN",
  );

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

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

    try {
      const networkResponse = await axiosClient.post("/auth/login", {
        gmail: email,
        password,
        role: selectedRole,
      });
      const targetPayload = networkResponse.data?.data || networkResponse.data;
      const { user, token } = targetPayload;

      if (!token || !user) {
        toast.error(
          "Invalid token package structural layout returned from server.",
        );
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
        toast.error(
          error.response?.data?.message || "Invalid account credentials.",
        );
      } else {
        toast.error("An unexpected infrastructure error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1A365D] shadow-2xl shadow-white px-4 font-sans select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden text-left"
      >
        {/* Branding Header Framework */}
        <div className="bg-white p-8 text-center border-b border-gray-200">
          <div className="w-12 h-12 bg-[#1A365D] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xs">
            <BookOpen size={22} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-[#1A365D] tracking-tight">
            Library Management
          </h2>
          <p className="text-[11px] uppercase tracking-wider text-[#718096] font-bold mt-1.5">
            Authentication Portal
          </p>
        </div>

        <form onSubmit={handleFormSubmission} className="p-8 space-y-5">
          {/* Access Level Controls */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block">
              Access Level
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-gray-200/40">
              <button
                type="button"
                onClick={() => setSelectedRole("LIBRARIAN")}
                className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRole === "LIBRARIAN"
                    ? "bg-white text-[#1A365D] shadow-xs"
                    : "text-[#718096] hover:text-[#1A365D]"
                }`}
              >
                Librarian
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("ADMIN")}
                className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRole === "ADMIN"
                    ? "bg-white text-[#1A365D] shadow-xs"
                    : "text-[#718096] hover:text-[#1A365D]"
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Email Block Layout */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative group">
              <Mail
                className="absolute left-3.5 top-3.5 text-[#718096] group-focus-within:text-[#1A365D] transition-colors"
                size={15}
              />
              <input
                type="email"
                placeholder="admin@library.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-semibold text-[#2D3748] outline-none focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/10 transition-all placeholder:text-[#718096]/40"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[11px] text-rose-600 font-bold mt-1">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password Input Block Frame */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block">
                Password
              </label>
              <button
                type="button"
                onClick={() => toast.info("Contact Systems Administrator for reset assistance.")}
                className="text-[11px] font-bold text-[#2B6CB0] hover:text-[#1A365D] transition-colors cursor-pointer"
              >
                Forgot?
              </button>
            </div>
            <div className="relative group">
              <Lock
                className="absolute left-3.5 top-3.5 text-[#718096] group-focus-within:text-[#1A365D] transition-colors"
                size={15}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-semibold text-[#2D3748] outline-none focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/10 transition-all placeholder:text-[#718096]/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-[#718096] hover:text-[#1A365D] cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] text-rose-600 font-bold mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Action Trigger Submit Element */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 bg-[#1A365D] hover:bg-[#2B6CB0] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? "Validating Account..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};