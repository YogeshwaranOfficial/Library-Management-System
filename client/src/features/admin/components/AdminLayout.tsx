import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { Users, ShieldAlert, LogOut, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas-dominant font-sans text-slate-secondary">
      {/* Admin Sidebar Layout Navigation Container */}
      <aside className="w-64 bg-white border-r border-slate-light/10 flex flex-col justify-between">
        <div className="p-4">
          <div className="flex items-center gap-2 px-2 py-3 border-b border-slate-light/10 mb-4">
            <div className="w-8 h-8 bg-sage-primary rounded-lg flex items-center justify-center text-white font-bold font-sans">
              A
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-slate-secondary">LMS Admin</h1>            </div>
          </div>

          <nav className="space-y-1">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-sage-primary/10 text-sage-primary"
                    : "text-slate-light hover:bg-canvas-dominant hover:text-slate-secondary"
                }`
              }
            >
              <LayoutDashboard size={16} />
              Admin Dashboard 
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-sage-primary/10 text-sage-primary"
                    : "text-slate-light hover:bg-canvas-dominant hover:text-slate-secondary"
                }`
              }
            >
              <Users size={16} />
              Manage Users
            </NavLink>
            <NavLink
              to="/admin/librarians"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-sage-primary/10 text-sage-primary"
                    : "text-slate-light hover:bg-canvas-dominant hover:text-slate-secondary"
                }`
              }
            >
              <ShieldAlert size={16} />
              Manage Librarians
            </NavLink>
          </nav>
        </div>

        {/* Operational Log Out Anchor */}
        <div className="p-4 border-t border-slate-light/10">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-utility-crimson hover:bg-utility-crimson/10 transition-colors cursor-pointer"
          >
            <LogOut size={16} /> Logout 
          </button>
        </div>
      </aside>

      {/* Main Structural Viewport Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-18 bg-white flex items-center justify-between px-6 border-b border-slate-light/10 shadow-xs">
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-secondary">Admin Panel</h1>
            <p className="text-xs text-slate-light font-medium">Library Management System</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <p className="font-bold text-slate-secondary font-data">Logged in as: {user?.email}</p>
              <p className="text-[11px] text-utility-crimson font-bold tracking-wide uppercase mt-0.5">Authorization: {user?.role}</p>
            </div>
            <div className="w-9 h-9 bg-canvas-dominant text-slate-secondary rounded-full flex items-center justify-center border border-slate-light/10 text-sm shadow-xs">
              🛡️
            </div>
          </div>
        </header>

        {/* Content View Injection Portal with Canvas Animation Layouts */}
        <main className="flex-1 overflow-y-auto p-6 bg-canvas-dominant">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};