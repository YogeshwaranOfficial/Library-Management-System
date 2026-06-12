import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { motion } from "framer-motion";

// Lucide Icons matching your clean, balanced stroke layouts
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  LogOut,
  Library,
  User,
} from "lucide-react";

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      name: "Admin Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      color: "text-blue-600",
    },
    {
      name: "Manage Users",
      path: "/admin/users",
      icon: Users,
      color: "text-amber-700",
    },
    {
      name: "Manage Librarians",
      path: "/admin/librarians",
      icon: ShieldAlert,
      color: "text-rose-600",
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-amber-50/40 font-sans text-slate-800 antialiased selection:bg-amber-200">
      {/* Sidebar Navigation - Warm Archival Minimalist Layout (Matching 72 width) */}
      <aside className="w-72 bg-card-bg border-r border-amber-100 flex flex-col justify-between relative z-20 shadow-xs shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3.5 py-3 border-b border-slate-100 mb-6">
            {/* Elegant Institutional Identity Icon */}
            <div className="w-10 h-10 bg-slate-900 text-amber-100 rounded-lg flex items-center justify-center shadow-xs shrink-0">
              <Library size={20} className="stroke-[2.2]" />
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-text-main leading-tight">
                LMS
              </span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Admin Portal
              </span>
            </div>
          </div>

          {/* Navigation links optimized with comfortable typography scales & indicators */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-150 ${
                      isActive
                        ? "bg-slate-100 text-slate-950 font-bold shadow-xs border-l-4 border-slate-900 rounded-l-none pl-3"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`
                  }
                >
                  <IconComponent
                    size={18}
                    className={`stroke-[2.2] shrink-0 ${item.color}`}
                  />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer - Spacious Action Deck matches exactly */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200/60 transition-all cursor-pointer shadow-2xs"
          >
            <LogOut size={16} className="stroke-[2.5]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Structural Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Frame - Formatted with identical Height h-22 and Side Padding */}
        <header className="h-22 bg-card-bg border-b border-amber-100 flex items-center justify-between px-10 shadow-2xs shrink-0">
          <div>
            <h1 className="text-lg font-bold text-text-main tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-0.5">
              Core directory controls and active network administration
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-1">
                ROLE:{" "}
                <span className="text-rose-600 font-bold">
                  {user?.role || "ADMIN"}
                </span>
              </p>
            </div>

            {/* User Profile Avatar Frame */}
            <div className="w-11 h-11 bg-slate-50 border border-border-main/60 text-text-main rounded-lg flex items-center justify-center shadow-2xs">
              <User size={18} className="stroke-[2.2]" />
            </div>
          </div>
        </header>

        {/* Content View Injection Portal using your clean transition specs */}
        <main className="flex-1 overflow-y-auto p-10 bg-transparent">
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
